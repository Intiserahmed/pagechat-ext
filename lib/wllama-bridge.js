// wllama-bridge.js — Extension version
// Chat: Gemma 3 1B (~700MB), Embed: nomic-embed-text (~80MB, optional)

import { Wllama, CacheManager } from './wllama.js';

// const EMBED_URL = 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf'; // disabled: fix pending
const CHAT_URL  = 'https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf';

const WASM_URL = () => chrome.runtime.getURL('lib/wllama.wasm');

// ── State ──────────────────────────────────────────────────────────────────────
let _embed          = null;
let _chat           = null;
let _store          = [];      // [{ text: string, emb: number[]|null }] — page index
let _knowledgeStore = [];      // [{ text: string, emb: number[]|null }] — personal knowledge
let _status     = 'idle';
let _progress   = 0;
let _useEmbed   = false;   // disabled: embed model fix pending
let _currentUrl = '';
let _gpuFailed      = false;   // set true after first chat GPU compatibility failure
let _embedGpuFailed = false;   // set true after first embed GPU compatibility failure
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
      /* Embed model loading — disabled until compatibility is fixed
      if (_useEmbed) {
        _status = 'loading-embed'; _progress = 0; emit();
        _embed = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
        const embedParams = {
          embeddings: true,
          progressCallback({ loaded, total }) {
            _progress = total > 0 ? Math.round(loaded / total * 100) : 0; emit();
          },
        };
        try {
          await loadWithCache(_embed, EMBED_URL, _embedGpuFailed ? { ...embedParams, n_gpu_layers: 0 } : embedParams);
        } catch (loadErr) {
          console.warn('[pagechat] embed load failed on GPU — retrying on CPU:', loadErr.message);
          _embedGpuFailed = true;
          try { await _embed.exit(); } catch {}
          _embed = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
          try {
            await loadWithCache(_embed, EMBED_URL, { ...embedParams, n_gpu_layers: 0 });
          } catch (cpuLoadErr) {
            console.warn('[pagechat] embed model cannot load on this machine — disabling:', cpuLoadErr.message);
            _embed = null;
            _useEmbed = false;
            emit();
          }
        }
      }
      */

      _status = 'loading-chat'; _progress = 0; emit();
      _chat = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });

      const loadParams = {
        n_ctx: 4096,  // Gemma 3 supports 32K; 4096 fits most pages without excessive RAM
        progressCallback({ loaded, total }) {
          _progress = total > 0 ? Math.round(loaded / total * 100) : 0; emit();
        },
      };

      if (!_gpuFailed) {
        try {
          await _chat.loadModelFromUrl(CHAT_URL, { ...loadParams, useCache: true });
          await _chat.createCompletion({ prompt: 'hi', max_tokens: 1, stream: false });
          console.log('[pagechat] GPU warm-up OK');
        } catch (gpuErr) {
          console.warn('[pagechat] GPU failed — falling back to CPU:', gpuErr.message);
          _gpuFailed = true;
          try { await _chat.exit(); } catch {}
          _chat = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
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

    // Page chat always uses BM25 — embed model is reserved for form fill (knowledge base)
    for (let i = 0; i < chunks.length; i++) {
      _store.push({ text: chunks[i], emb: null });
      _progress = Math.round((i + 1) / chunks.length * 100); emit();
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
    const prompt = `<start_of_turn>user\nBased on this page content, write exactly 3 short questions a reader might want to ask. One question per line. No numbering, no bullets, no extra text.\n\nContent:\n${sample}<end_of_turn>\n<start_of_turn>model\n`;
    let raw = '';
    await _chat.createCompletion({
      prompt, stream: true, max_tokens: 700, temperature: 0.8,
      stop: ['<end_of_turn>', '<start_of_turn>'],
      onData(chunk) { raw += chunk?.choices?.[0]?.text ?? chunk?.content ?? ''; },
    });
    return raw.trim().split('\n')
      .map(l => l.replace(/^[\d\.\-\*)\s]+/, '').trim())
      .filter(l => l.length > 8)
      .slice(0, 3);
  },

  /** Index personal knowledge for form autofill. Each line becomes a chunk. */
  async indexKnowledge(text) {
    if (!_chat) { console.warn('[pagechat] indexKnowledge skipped — chat model not loaded'); return; }
    const chunks = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    _knowledgeStore = [];
    console.log(`[pagechat] indexKnowledge: ${chunks.length} chunks, embed=${!!_embed}`);
    if (_embed) {
      // Use embed model for knowledge — enables semantic fill matching
      try {
        for (const chunk of chunks) {
          const emb = await _embed.createEmbedding('search_document: ' + chunk);
          _knowledgeStore.push({ text: chunk, emb: Array.from(emb) });
        }
      } catch (gpuErr) {
        console.warn('[pagechat] embed GPU failed — reloading embed model on CPU and retrying…', gpuErr.message);
        _embedGpuFailed = true;
        try { await _embed.exit(); } catch {}
        _embed = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
        try {
          await loadWithCache(_embed, EMBED_URL, { embeddings: true, n_gpu_layers: 0 });
          _knowledgeStore = [];
          for (const chunk of chunks) {
            const emb = await _embed.createEmbedding('search_document: ' + chunk);
            _knowledgeStore.push({ text: chunk, emb: Array.from(emb) });
          }
          console.log('[pagechat] embed CPU retry succeeded');
        } catch (cpuErr) {
          console.warn('[pagechat] embed CPU also failed — falling back to BM25:', cpuErr.message);
          _embed = null;
          _knowledgeStore = chunks.map(t => ({ text: t, emb: null }));
        }
      }
    } else {
      _knowledgeStore = chunks.map(t => ({ text: t, emb: null }));
    }
    console.log(`[pagechat] indexKnowledge done: ${_knowledgeStore.length} entries, embed=${!!_embed}`);
  },

  /** Retrieve relevant knowledge chunks for a set of fields. */
  async _retrieveForFields(fields) {
    if (_knowledgeStore.length === 0) return null; // signal: caller will use BM25 on raw text
    if (_knowledgeStore.length <= 8) return _knowledgeStore.map(c => c.text).join('\n');

    const fieldQuery = fields.map(f => [f.label, f.placeholder, f.name].filter(Boolean).join(' ')).join(' ');
    let retrieved;
    if (_embed) {
      try {
        const queryEmb = Array.from(await _embed.createEmbedding('search_query: ' + fieldQuery));
        retrieved = retrieveEmbed(queryEmb, 5, _knowledgeStore);
      } catch (gpuErr) {
        console.warn('[pagechat] embed GPU failed during fill query — reloading on CPU…', gpuErr.message);
        _embedGpuFailed = true;
        try { await _embed.exit(); } catch {}
        _embed = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
        try {
          await loadWithCache(_embed, EMBED_URL, { embeddings: true, n_gpu_layers: 0 });
          const queryEmb = Array.from(await _embed.createEmbedding('search_query: ' + fieldQuery));
          retrieved = retrieveEmbed(queryEmb, 5, _knowledgeStore);
        } catch (cpuErr) {
          console.warn('[pagechat] embed CPU also failed — falling back to BM25:', cpuErr.message);
          _embed = null;
          retrieved = retrieveBM25(fieldQuery, 5, _knowledgeStore);
        }
      }
    } else {
      retrieved = retrieveBM25(fieldQuery, 5, _knowledgeStore);
    }
    return retrieved.join('\n');
  },

  /** Fill form fields in batches of 5. Returns { fieldIndex: value } JSON object. */
  async fillForm(fields, rawKnowledge) {
    if (!_chat) throw new Error('Models not loaded');
    console.log(`[pagechat] fillForm: ${fields.length} fields, knowledgeStore=${_knowledgeStore.length} chunks, embed=${!!_embed}`);

    const BATCH = 5;
    const allFills = {};

    for (let i = 0; i < fields.length; i += BATCH) {
      const batch = fields.slice(i, i + BATCH);
      const fieldList = batch.map(f =>
        `${f.idx}: ${[f.label, f.placeholder, f.name, f.type].filter(Boolean).join(' / ')}`
      ).join('\n');

      // Per-batch retrieval — query tailored to just these fields
      // If knowledgeStore is empty, chunk rawKnowledge on-the-fly and use BM25
      let knowledge;
      const retrieved = await this._retrieveForFields(batch);
      if (retrieved !== null) {
        knowledge = retrieved;
      } else {
        const fieldQuery = batch.map(f => [f.label, f.placeholder, f.name].filter(Boolean).join(' ')).join(' ');
        const rawChunks = chunkText(rawKnowledge);
        const avg = rawChunks.reduce((s, c) => s + c.split(/\s+/).length, 0) / (rawChunks.length || 1);
        knowledge = rawChunks
          .map(c => ({ text: c, score: bm25Score(fieldQuery, c, avg) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(c => c.text)
          .join('\n');
      }
      console.log(`[pagechat] batch ${i}–${i + batch.length - 1}: knowledge=${knowledge.length} chars`);

      const prompt = `<start_of_turn>user\nYou fill web forms. Given numbered fields and personal info, output a JSON object mapping field index numbers (as strings) to matching values. Only include fields with a clear match. Output raw JSON only.\nExample: {"0":"Alex Smith","1":"alex@work.io"}\n\nFields:\n${fieldList}\n\nPersonal info:\n${knowledge}<end_of_turn>\n<start_of_turn>model\n{"`;

      let raw = '';
      await _chat.createCompletion({
        prompt, stream: true, max_tokens: 300, temperature: 0.1,
        stop: ['<end_of_turn>', '<start_of_turn>'],
        onData(chunk) { raw += chunk?.choices?.[0]?.text ?? chunk?.content ?? ''; },
      });

      console.log(`[pagechat] batch ${i} raw output:`, raw);
      const json = '{"' + raw;
      const match = json.match(/\{[\s\S]*\}/);
      if (match) {
        try { Object.assign(allFills, JSON.parse(match[0])); } catch {}
      }
    }

    console.log(`[pagechat] fillForm done: ${Object.keys(allFills).length} fills`);
    return allFills;
  },

  /** Streaming map-reduce summarization: stream each section summary as it's generated. */
  async summarize(onToken, onProgress) {
    if (!_chat) throw new Error('Models not loaded');
    if (_store.length === 0) throw new Error('Page not indexed');

    const chunks = _store.map(i => i.text);
    const BATCH = 5;
    let firstBatch = true;

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH).join('\n\n');
      if (onProgress && firstBatch) onProgress('Summarizing…');

      // Separator between sections (not before the first)
      if (!firstBatch) onToken('\n\n');
      firstBatch = false;

      // Emit the primed bullet so the model continues from it
      onToken('• ');
      await _chat.createCompletion({
        prompt: `<start_of_turn>user\nList the key points from this text as bullet points. Start each point with "•":\n\n${batch}<end_of_turn>\n<start_of_turn>model\n•`,
        stream: true, max_tokens: 150, temperature: 0.3,
        stop: ['<end_of_turn>', '<start_of_turn>'],
        onData(c) {
          const raw = c?.choices?.[0]?.text ?? c?.content ?? '';
          if (raw) onToken(raw);
        },
      });
    }
  },

  async chat(messages, onToken, { customPrompt = null, maxTokens = 400, k = 4 } = {}) {
    if (!_chat) throw new Error('Models not loaded');
    if (_store.length === 0) throw new Error('Page not indexed — click the index button first.');

    const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';

    // Retrieve chunks relevant to the latest question.
    // Always include the first 2 chunks (page intro/summary) + BM25 top-k,
    // deduped — covers vague queries like "summarize" where BM25 finds nothing useful.
    const bm25Chunks = retrieveBM25(lastUser, k);
    const introChunks = _store.slice(0, 2).map(i => i.text).filter(c => !bm25Chunks.includes(c));
    const topChunks = [...introChunks, ...bm25Chunks];
    const context = topChunks.join('\n\n---\n\n');

    const baseInstruction = customPrompt
      ? customPrompt
      : `You are a helpful assistant. Answer questions using only the provided page text. Be concise and direct.`;

    // Gemma chat template:
    // - System instruction goes into the very first user turn
    // - Retrieved context injected right before the LAST user message so it's always relevant
    const lastIdx = messages.length - 1;
    let prompt = '';
    for (let i = 0; i < messages.length; i++) {
      const { role, content } = messages[i];
      const isFirst = prompt === '';
      const isLastUser = role === 'user' && i === lastIdx;

      if (role === 'user') {
        let text = content;
        if (isFirst) text = `${baseInstruction}\n\n${text}`;
        if (isLastUser) text = `Page text:\n${context}\n\n${text}`;
        prompt += `<start_of_turn>user\n${text}<end_of_turn>\n<start_of_turn>model\n`;
      } else {
        prompt += `${content}<end_of_turn>\n`;
      }
    }

    const doComplete = () => _chat.createCompletion({
      prompt,
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      stop: ['<end_of_turn>', '<start_of_turn>'],
      onData(chunk) {
        const raw = chunk?.choices?.[0]?.text ?? chunk?.content ?? '';
        if (raw) onToken(raw);
      },
    });

    try {
      await doComplete();
    } catch (e) {
      // After a user-initiated stop, wllama's KV cache has a partial sequence.
      // Retry once — the second call overwrites the bad state cleanly.
      if (e?.message?.includes('Invalid input batch') || e?.message?.includes('invalid')) {
        await doComplete();
      } else {
        throw e;
      }
    }
  },
};
