// wllama-bridge.js — Extension version
// Default: BM25 retrieval (chat model only, ~400MB)
// Optional: AI embeddings toggle (adds embed model, ~80MB)

import { Wllama, CacheManager } from './wllama.js';

const EMBED_URL = 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf';
const CHAT_URL  = 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_1.gguf';

const WASM_URL = () => chrome.runtime.getURL('lib/wllama.wasm');

// ── State ──────────────────────────────────────────────────────────────────────
let _embed          = null;
let _chat           = null;
let _store          = [];      // [{ text: string, emb: number[]|null }] — page index
let _knowledgeStore = [];      // [{ text: string, emb: number[]|null }] — personal knowledge
let _status     = 'idle';
let _progress   = 0;
let _useEmbed   = false;   // default: BM25
let _currentUrl = '';
let _gpuFailed  = false;   // set true after first GPU compatibility failure
const _subs     = new Set();
const _cache    = new Map(); // url → { store, title }
const CACHE_MAX = 10;

function emit() {
  _subs.forEach(fn => fn({ status: _status, progress: _progress, useEmbed: _useEmbed }));
}

// ── Model loader with cache-corruption recovery ────────────────────────────────
async function loadWithCache(wllama, url, params) {
  try {
    await wllama.loadModelFromUrl(url, { ...params, useCache: true });
  } catch (err) {
    console.warn('[pagechat] Load failed — clearing cache and retrying fresh download…', err);
    await new CacheManager().clear();
    await wllama.loadModelFromUrl(url, { ...params, useCache: true });
  }
}

// ── Text chunker ───────────────────────────────────────────────────────────────
function chunkText(text, size = 450, overlap = 60) {
  text = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    const c = text.slice(i, i + size).trim();
    if (c.length > 80) chunks.push(c);
  }
  return chunks;
}

// ── BM25 retrieval ─────────────────────────────────────────────────────────────
function bm25Score(query, doc, avgLen, k1 = 1.5, b = 0.75) {
  const qTerms = query.toLowerCase().split(/\s+/);
  const dTerms = doc.toLowerCase().split(/\s+/);
  const freq = {};
  dTerms.forEach(t => freq[t] = (freq[t] || 0) + 1);
  return qTerms.reduce((score, t) => {
    const f = freq[t] || 0;
    return score + (f * (k1 + 1)) / (f + k1 * (1 - b + b * dTerms.length / avgLen));
  }, 0);
}

function retrieveBM25(query, k = 3, store = _store) {
  const chunks = store.map(i => i.text);
  const avg = chunks.reduce((s, c) => s + c.split(/\s+/).length, 0) / (chunks.length || 1);
  return chunks
    .map(c => ({ text: c, score: bm25Score(query, c, avg) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(c => c.text);
}

// ── Cosine (embed mode) ────────────────────────────────────────────────────────
function cosine(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; ma += a[i]*a[i]; mb += b[i]*b[i]; }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb) || 1);
}

function retrieveEmbed(queryEmb, k = 3, store = _store) {
  return [...store]
    .map(item => ({ text: item.text, score: cosine(queryEmb, item.emb) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(item => item.text);
}

// ── Qwen3 think-token filter ───────────────────────────────────────────────────
function makeFilter() {
  let inThink = false, buf = '';
  return function flush(piece) {
    if (!inThink && !piece.includes('<')) return piece;
    buf += piece;
    let out = '';
    while (buf.length > 0) {
      if (!inThink) {
        const s = buf.indexOf('<think>');
        if (s === -1) { const safe = Math.max(0, buf.length - 6); out += buf.slice(0, safe); buf = buf.slice(safe); break; }
        out += buf.slice(0, s); buf = buf.slice(s + 7); inThink = true;
      } else {
        const e = buf.indexOf('</think>');
        if (e === -1) { buf = ''; break; }
        buf = buf.slice(e + 8); inThink = false;
      }
    }
    return out;
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────
window.__pagechat = {
  /** Wipe the wllama model cache (fixes corrupted-cache errors). */
  async clearModelCache() {
    await new CacheManager().clear();
  },

  get status()      { return _status; },
  get progress()    { return _progress; },
  get chunkCount()  { return _store.length; },
  get useEmbed()    { return _useEmbed; },
  get cachedPages() { return _cache.size; },

  subscribe(fn) { _subs.add(fn); return () => _subs.delete(fn); },

  /** Toggle embed mode. Only allowed before models are loaded. */
  setUseEmbed(val) {
    if (_status !== 'idle' && _status !== 'error') return;
    _useEmbed = !!val;
    emit();
  },

  async loadModels() {
    if (_status !== 'idle' && _status !== 'error') return;
    try {
      if (_useEmbed) {
        _status = 'loading-embed'; _progress = 0; emit();
        _embed = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
        await loadWithCache(_embed, EMBED_URL, {
          embeddings: true,
          progressCallback({ loaded, total }) {
            _progress = total > 0 ? Math.round(loaded / total * 100) : 0; emit();
          },
        });
      }

      _status = 'loading-chat'; _progress = 0; emit();
      _chat = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });

      const loadParams = {
        n_ctx: 2048,
        progressCallback({ loaded, total }) {
          _progress = total > 0 ? Math.round(loaded / total * 100) : 0; emit();
        },
      };

      if (!_gpuFailed) {
        // GPU attempt: load directly (no cache-clear on failure — GPU errors aren't cache corruption).
        // The CPU fallback still uses loadWithCache so genuine cache corruption is handled there.
        try {
          await _chat.loadModelFromUrl(CHAT_URL, { ...loadParams, useCache: true });
          await _chat.createCompletion({ prompt: 'hi', max_tokens: 1, stream: false });
          console.log('[pagechat] GPU warm-up OK');
        } catch (gpuErr) {
          console.warn('[pagechat] GPU failed — falling back to CPU:', gpuErr);
          _gpuFailed = true;
          try { await _chat.exit(); } catch {}
          _chat = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
          // loadWithCache here handles real cache corruption on the CPU path
          await loadWithCache(_chat, CHAT_URL, { ...loadParams, n_gpu_layers: 0 });
        }
      } else {
        await loadWithCache(_chat, CHAT_URL, { ...loadParams, n_gpu_layers: 0 });
      }

      _status = 'ready-no-index'; _progress = 100; emit();
    } catch (err) {
      console.error('[pagechat]', err);
      _status = 'error'; emit();
    }
  },

  async indexPage(text, url = '') {
    if (!_chat) throw new Error('Models not loaded');
    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error('No text found on page');
    _status = 'indexing'; _store = []; _progress = 0; _currentUrl = url; emit();

    if (_useEmbed && _embed) {
      for (let i = 0; i < chunks.length; i++) {
        const emb = await _embed.createEmbedding('search_document: ' + chunks[i]);
        _store.push({ text: chunks[i], emb: Array.from(emb) });
        _progress = Math.round((i + 1) / chunks.length * 100); emit();
      }
    } else {
      for (let i = 0; i < chunks.length; i++) {
        _store.push({ text: chunks[i], emb: null });
        _progress = Math.round((i + 1) / chunks.length * 100); emit();
      }
    }

    // Save to cache
    if (url) {
      if (_cache.size >= CACHE_MAX) {
        _cache.delete(_cache.keys().next().value); // evict oldest
      }
      _cache.set(url, { store: [..._store] });
    }

    _status = 'ready'; emit();
  },

  /** Restore index from cache. Returns true if hit, false if miss. */
  restoreFromCache(url) {
    const entry = _cache.get(url);
    if (!entry || _status === 'idle' || _status === 'loading-embed' || _status === 'loading-chat') return false;
    _store = [...entry.store];
    _currentUrl = url;
    _status = 'ready'; emit();
    return true;
  },

  /** Generate 3 suggested questions about the indexed page. */
  async suggestQuestions() {
    if (!_chat || _store.length === 0) return [];
    const sample = _store.slice(0, 5).map(i => i.text).join('\n\n');
    const prompt = `<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\nBased on this page content, write exactly 3 short questions a reader might want to ask. One question per line. No numbering, no bullets, no extra text.\n\nContent:\n${sample}<|im_end|>\n<|im_start|>assistant\n`;
    let raw = '';
    const filter = makeFilter();
    await _chat.createCompletion({
      prompt, stream: true, max_tokens: 700, temperature: 0.8,
      stop: ['<|im_end|>', '<|im_start|>'],
      onData(chunk) { raw += filter(chunk?.choices?.[0]?.text ?? chunk?.content ?? ''); },
    });
    return raw.trim().split('\n')
      .map(l => l.replace(/^[\d\.\-\*)\s]+/, '').trim())
      .filter(l => l.length > 8)
      .slice(0, 3);
  },

  /** Index personal knowledge for form autofill. Each line becomes a chunk. */
  async indexKnowledge(text) {
    if (!_chat) return;
    const chunks = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    _knowledgeStore = [];
    if (_useEmbed && _embed) {
      for (const chunk of chunks) {
        const emb = await _embed.createEmbedding('search_document: ' + chunk);
        _knowledgeStore.push({ text: chunk, emb: Array.from(emb) });
      }
    } else {
      _knowledgeStore = chunks.map(t => ({ text: t, emb: null }));
    }
  },

  /** Fill form fields. Returns { fieldIndex: value } JSON object. */
  async fillForm(fields, rawKnowledge) {
    if (!_chat) throw new Error('Models not loaded');
    const fieldList = fields.map(f =>
      `${f.idx}: ${[f.label, f.placeholder, f.name, f.type].filter(Boolean).join(' / ')}`
    ).join('\n');
    // Retrieve relevant knowledge for these fields (embed or BM25), fall back to raw text
    let knowledge;
    if (_knowledgeStore.length > 0) {
      const fieldQuery = fields.map(f => [f.label, f.placeholder, f.name].filter(Boolean).join(' ')).join(' ');
      const k = Math.min(15, _knowledgeStore.length);
      if (_useEmbed && _embed) {
        const queryEmb = Array.from(await _embed.createEmbedding('search_query: ' + fieldQuery));
        knowledge = retrieveEmbed(queryEmb, k, _knowledgeStore).join('\n');
      } else {
        knowledge = retrieveBM25(fieldQuery, k, _knowledgeStore).join('\n');
      }
    } else {
      knowledge = rawKnowledge;
    }
    const prompt = `<|im_start|>system\nYou are a form-filling assistant. Given form fields and personal information, output ONLY a raw JSON object mapping field index (as string key) to the best matching value from the personal info. Only include fields that have a clear match. No explanation, no markdown, no code fences — raw JSON only.\n<|im_end|>\n<|im_start|>user\nFields:\n${fieldList}\n\nPersonal information:\n${knowledge}\n<|im_end|>\n<|im_start|>assistant\n`;
    let raw = '';
    const filter = makeFilter();
    await _chat.createCompletion({
      prompt, stream: true, max_tokens: 300, temperature: 0.1,
      stop: ['<|im_end|>', '<|im_start|>'],
      onData(chunk) { raw += filter(chunk?.choices?.[0]?.text ?? chunk?.content ?? ''); },
    });
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try { return JSON.parse(match[0]); } catch { return {}; }
  },

  async chat(messages, onToken, { customPrompt = null, maxTokens = 400, k = 3 } = {}) {
    if (!_chat) throw new Error('Models not loaded');
    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

    let topChunks;
    if (_useEmbed && _embed) {
      const queryEmb = Array.from(await _embed.createEmbedding('search_query: ' + lastUser));
      topChunks = retrieveEmbed(queryEmb, k);
    } else {
      topChunks = retrieveBM25(lastUser, k);
    }

    const context = topChunks.join('\n\n---\n\n');
    const sysPrompt = customPrompt
      ? `${customPrompt}\n\nContext from the page:\n${context}`
      : `You are a helpful assistant answering questions about a webpage the user is reading. Answer based only on the context below. Be concise.\n\nContext:\n${context}`;

    let prompt = `<|im_start|>system\n${sysPrompt}<|im_end|>\n`;
    for (const { role, content } of messages) {
      prompt += `<|im_start|>${role === 'assistant' ? 'assistant' : 'user'}\n${content}<|im_end|>\n`;
    }
    // Let Qwen3 think freely — the filter strips <think>…</think> from display.
    // Do NOT pre-fill an empty think block; that suppresses thinking but wastes tokens on re-opening it.
    prompt += '<|im_start|>assistant\n';

    await _chat.createCompletion({
      prompt,
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      stop: ['<|im_end|>', '<|im_start|>'],
      onData(chunk) {
        const raw = chunk?.choices?.[0]?.text ?? chunk?.content ?? '';
        if (raw) onToken(raw);
      },
    });
  },
};
