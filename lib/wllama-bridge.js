// wllama-bridge.js — Extension version
// Chat: Gemma 3 1B (~700MB), Embed: nomic-embed-text (~80MB, optional)

import { Wllama, CacheManager } from './wllama.js';

const EMBED_URL = 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf';
const CHAT_URL  = 'https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf';

const WASM_URL = () => chrome.runtime.getURL('lib/wllama.wasm');

// ── State ──────────────────────────────────────────────────────────────────────
let _embed          = null;
let _embedPromise   = null;   // lazy-load dedup — resolves to the Wllama embed instance
let _embedDead      = false;  // set true after first createEmbedding crash — skip model permanently
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
    console.warn('[arkhon] Load failed — clearing cache and retrying fresh download…', err);
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

// ── Lazy embed model loader ────────────────────────────────────────────────────
// Loaded on first use (after chat model is ready) so the two models don't conflict.
async function ensureEmbed() {
  if (_embed) return _embed;
  if (_embedPromise) return _embedPromise;

  _embedPromise = (async () => {
    console.log('[arkhon] loading embed model lazily…');
    const params = { embeddings: true, n_ctx: 512 };
    let inst = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
    try {
      await loadWithCache(inst, EMBED_URL, params);
    } catch (gpuErr) {
      console.warn('[arkhon] embed GPU failed — retrying CPU:', gpuErr.message);
      try { await inst.exit(); } catch {}
      inst = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
      await loadWithCache(inst, EMBED_URL, { ...params, n_gpu_layers: 0 });
    }
    _embed = inst;
    console.log('[arkhon] embed model ready');
    return _embed;
  })();

  // Reset on failure so a future call can retry once memory is available
  _embedPromise = _embedPromise.catch(err => {
    _embedPromise = null;
    throw err;
  });

  return _embedPromise;
}

// ── Keyword fallback filter (used when embed model unavailable) ─────────────
// Scores each DOM element by how many goal keywords appear in its label.
// Action words (click, press, find…) are stripped so intent words drive scoring.
function keywordFilter(goal, lines, topK) {
  const ACTION_WORDS = new Set(['click','press','tap','find','go','open','navigate','search','type','fill','enter','select','button','text','box','field','input','the','a','an','to','on','in','at','for','and','or','it','is']);
  const keywords = goal.toLowerCase().split(/\W+/).filter(w => w.length > 1 && !ACTION_WORDS.has(w));

  const scored = lines.map(line => {
    // Match against element NAME only — strip "[N] role: " so role words don't pollute scoring.
    // e.g. "textbox: First Name" → match against "first name", not "textbox first name"
    // (otherwise "text box" in goal hits "textbox" on every input element)
    const nameOnly = line.replace(/^\[\d+\]\s*\S+:\s*/, '').toLowerCase();
    const origIdx  = parseInt(line.match(/^\[(\d+)\]/)?.[1] ?? 0);
    const score    = keywords.reduce((s, w) => s + (nameOnly.includes(w) ? 1 : 0), 0);
    return { line, origIdx, score };
  });

  const positive = scored.filter(s => s.score > 0);
  const pool     = positive.length > 0 ? positive : scored;

  // Deduplicate by label — keep only the first (topmost) occurrence of each unique label.
  // Prevents e.g. 3 identical "link: Docs" entries that confuse the LLM.
  const seenLabels = new Set();
  const deduped = pool
    .sort((a, b) => b.score - a.score || a.origIdx - b.origIdx)
    .filter(({ line }) => {
      const label = line.replace(/^\[\d+\]\s*/, '');
      if (seenLabels.has(label)) return false;
      seenLabels.add(label);
      return true;
    })
    .slice(0, topK)
    .sort((a, b) => a.origIdx - b.origIdx);

  return deduped;
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
window.__arkhon = {
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
          console.warn('[arkhon] embed load failed on GPU — retrying on CPU:', loadErr.message);
          _embedGpuFailed = true;
          try { await _embed.exit(); } catch {}
          _embed = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
          try {
            await loadWithCache(_embed, EMBED_URL, { ...embedParams, n_gpu_layers: 0 });
          } catch (cpuLoadErr) {
            console.warn('[arkhon] embed model cannot load on this machine — disabling:', cpuLoadErr.message);
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
          console.log('[arkhon] GPU warm-up OK');
        } catch (gpuErr) {
          console.warn('[arkhon] GPU failed — falling back to CPU:', gpuErr.message);
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
      console.error('[arkhon]', err);
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
    if (!_chat) { console.warn('[arkhon] indexKnowledge skipped — chat model not loaded'); return; }
    const chunks = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    _knowledgeStore = [];
    console.log(`[arkhon] indexKnowledge: ${chunks.length} chunks, embed=${!!_embed}`);
    if (_embed) {
      // Use embed model for knowledge — enables semantic fill matching
      try {
        for (const chunk of chunks) {
          const emb = await _embed.createEmbedding('search_document: ' + chunk);
          _knowledgeStore.push({ text: chunk, emb: Array.from(emb) });
        }
      } catch (gpuErr) {
        console.warn('[arkhon] embed GPU failed — reloading embed model on CPU and retrying…', gpuErr.message);
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
          console.log('[arkhon] embed CPU retry succeeded');
        } catch (cpuErr) {
          console.warn('[arkhon] embed CPU also failed — falling back to BM25:', cpuErr.message);
          _embed = null;
          _knowledgeStore = chunks.map(t => ({ text: t, emb: null }));
        }
      }
    } else {
      _knowledgeStore = chunks.map(t => ({ text: t, emb: null }));
    }
    console.log(`[arkhon] indexKnowledge done: ${_knowledgeStore.length} entries, embed=${!!_embed}`);
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
        console.warn('[arkhon] embed GPU failed during fill query — reloading on CPU…', gpuErr.message);
        _embedGpuFailed = true;
        try { await _embed.exit(); } catch {}
        _embed = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
        try {
          await loadWithCache(_embed, EMBED_URL, { embeddings: true, n_gpu_layers: 0 });
          const queryEmb = Array.from(await _embed.createEmbedding('search_query: ' + fieldQuery));
          retrieved = retrieveEmbed(queryEmb, 5, _knowledgeStore);
        } catch (cpuErr) {
          console.warn('[arkhon] embed CPU also failed — falling back to BM25:', cpuErr.message);
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
    console.log(`[arkhon] fillForm: ${fields.length} fields, knowledgeStore=${_knowledgeStore.length} chunks, embed=${!!_embed}`);

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
      console.log(`[arkhon] batch ${i}–${i + batch.length - 1}: knowledge=${knowledge.length} chars`);

      const prompt = `<start_of_turn>user\nYou fill web forms. Given numbered fields and personal info, output a JSON object mapping field index numbers (as strings) to matching values. Only include fields with a clear match. Output raw JSON only.\nExample: {"0":"Alex Smith","1":"alex@work.io"}\n\nFields:\n${fieldList}\n\nPersonal info:\n${knowledge}<end_of_turn>\n<start_of_turn>model\n{"`;

      let raw = '';
      await _chat.createCompletion({
        prompt, stream: true, max_tokens: 300, temperature: 0.1,
        stop: ['<end_of_turn>', '<start_of_turn>'],
        onData(chunk) { raw += chunk?.choices?.[0]?.text ?? chunk?.content ?? ''; },
      });

      console.log(`[arkhon] batch ${i} raw output:`, raw);
      const json = '{"' + raw;
      const match = json.match(/\{[\s\S]*\}/);
      if (match) {
        try { Object.assign(allFills, JSON.parse(match[0])); } catch {}
      }
    }

    console.log(`[arkhon] fillForm done: ${Object.keys(allFills).length} fills`);
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

  /**
   * Single agent step using tool-calling style:
   * - Semantically filtered DOM via nomic-embed (see embedFilter)
   * - GBNF grammar forces valid JSON output — no regex parsing
   * - Returns parsed action object { action, index?, value?, direction?, url?, answer? }
   */

  /**
   * Embed-based DOM filter using nomic-embed-text.
   * Loads the embed model lazily on first call (after chat model is ready — no conflict).
   * Returns { text: filteredDomText, indexMap: { newIdx: origIdx } }
   */
  async embedFilter(goal, domText, topK = 15, onStatus) {
    const lines = domText.split('\n').filter(Boolean);
    if (lines.length <= topK) {
      const indexMap = Object.fromEntries(lines.map((l, i) => {
        const origIdx = parseInt(l.match(/^\[(\d+)\]/)?.[1] ?? i);
        return [i, origIdx];
      }));
      console.log(`[arkhon] embedFilter: ${lines.length} elements ≤ topK=${topK}, skipping embed`);
      return { text: domText, indexMap };
    }

    let kept;

    if (_embedDead) {
      // Embed model crashed previously — skip it for the rest of this session
      onStatus?.('Keyword filter');
      kept = keywordFilter(goal, lines, topK);
      console.log(`[arkhon] embedFilter: embed dead, keyword filter kept ${kept.length}`);
    } else {
      try {
        const embedReady = !!_embed;
        if (!embedReady) {
          console.log('[arkhon] embedFilter: nomic-embed not loaded yet — loading now…');
          onStatus?.('Loading nomic-embed model…');
        }

        const embed = await ensureEmbed();

        if (!embedReady) {
          console.log('[arkhon] embedFilter: nomic-embed ready');
          onStatus?.('Embed model ready');
        }

        console.log(`[arkhon] embedFilter: embedding goal + ${lines.length} elements`);
        onStatus?.(`Embedding ${lines.length} elements…`);

        // nomic-embed-text uses task prefixes for best retrieval accuracy
        const goalEmb = await embed.createEmbedding('search_query: ' + goal);

        const scored = [];
        for (const line of lines) {
          const label   = line.replace(/^\[\d+\]\s*/, '').slice(0, 120);
          const emb     = await embed.createEmbedding('search_document: ' + label);
          const origIdx = parseInt(line.match(/^\[(\d+)\]/)?.[1] ?? scored.length);
          scored.push({ line, origIdx, score: cosine(goalEmb, emb) });
        }

        kept = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, topK)
          .sort((a, b) => a.origIdx - b.origIdx);  // restore document order

        const topScores = kept.slice(0, 3).map(k => k.score.toFixed(3)).join(', ');
        console.log(`[arkhon] embedFilter: kept top ${kept.length} (scores: ${topScores})`);
        onStatus?.(`Ranked — top ${kept.length} selected (scores: ${topScores})`);
      } catch (embedErr) {
        // Mark embed as permanently unavailable — avoid repeated crash attempts
        _embedDead = true;
        _embed = null;
        _embedPromise = null;
        console.warn(`[arkhon] embedFilter: embed crashed (${embedErr.message}) — keyword fallback (permanent)`);
        onStatus?.('Keyword filter (embed unavailable)');
        kept = keywordFilter(goal, lines, topK);
        const topLabels = kept.slice(0, 3).map(k => k.line.replace(/^\[\d+\]\s*/, '').slice(0, 30)).join(', ');
        console.log(`[arkhon] embedFilter keyword fallback: kept ${kept.length} (top: ${topLabels})`);
      }
    }

    const indexMap = {};
    const newLines = kept.map(({ line, origIdx }, newIdx) => {
      indexMap[newIdx] = origIdx;
      return line.replace(/^\[\d+\]/, `[${newIdx}]`);
    });

    return { text: newLines.join('\n'), indexMap };
  },

  /** After an action is executed, ask the model what goal remains. Returns remaining goal string or "done". */
  async remainingGoal(goal, actionTaken) {
    if (!_chat) throw new Error('Models not loaded');
    const prompt = `<start_of_turn>user\nGoal: "${goal}"\nAction taken: ${actionTaken}\nIs the goal achieved? If yes, reply "done". If not, reply with only what still needs to be done (be brief).<end_of_turn>\n<start_of_turn>model\n`;
    let raw = '';
    await _chat.createCompletion({
      prompt,
      stream: true,
      max_tokens: 60,
      temperature: 0.1,
      stop: ['<end_of_turn>', '<start_of_turn>', '\n'],
      onData(c) { raw += c?.choices?.[0]?.text ?? c?.content ?? ''; },
    });
    const result = raw.trim();
    console.log(`[arkhon] remainingGoal: "${result}"`);
    return result;
  },

  async agentStep(goal, domTree, history = []) {
    if (!_chat) throw new Error('Models not loaded');

    console.log('[arkhon] DOM elements:\n' + domTree);

    const prompt = `<start_of_turn>user\nYou are a web agent. Complete the goal step by step — one action per turn.\nGoal: ${goal}\n\nPage elements:\n${domTree}\n\nRespond with exactly one JSON action. Use {"action":"done"} only when the goal is fully complete.<end_of_turn>\n<start_of_turn>model\n{"action":"`;

    console.log('[arkhon] prompt:\n' + prompt);

    // GBNF grammar — forces llama.cpp to emit valid JSON matching our action schema.
    // Physically impossible for the model to output malformed JSON or wrong keys.
    const AGENT_GRAMMAR = `\
root   ::= "{" ws "\\"action\\"" ws ":" ws act ws "}"
act    ::= click | fill | scroll | nav | done
click  ::= "\\"click\\""    ws "," ws "\\"index\\""     ws ":" ws num
fill   ::= "\\"fill\\""     ws "," ws "\\"index\\""     ws ":" ws num ws "," ws "\\"value\\""     ws ":" ws str
scroll ::= "\\"scroll\\""   ws "," ws "\\"index\\""     ws ":" ws num ws "," ws "\\"direction\\"" ws ":" ws dir
nav    ::= "\\"navigate\\""  ws "," ws "\\"url\\""       ws ":" ws str
done   ::= "\\"done\\""     ws "," ws "\\"answer\\""    ws ":" ws str
dir    ::= "\\"up\\"" | "\\"down\\""
num    ::= [0-9]+
str    ::= "\\"" ([^"\\\\] | "\\\\" .)* "\\""
ws     ::= [ \\t\\n\\r]*`;

    let raw = '';
    try {
      await _chat.createCompletion({
        prompt,
        stream: true,
        max_tokens: 80,
        temperature: 0.1,
        grammar: AGENT_GRAMMAR,
        stop: ['<end_of_turn>', '<start_of_turn>'],
        onData(c) { raw += c?.choices?.[0]?.text ?? c?.content ?? ''; },
      });
    } catch {
      // Grammar not supported by this wllama build — retry without it
      raw = '';
      await _chat.createCompletion({
        prompt,
        stream: true,
        max_tokens: 80,
        temperature: 0.1,
        stop: ['<end_of_turn>', '<start_of_turn>', '\n'],
        onData(c) { raw += c?.choices?.[0]?.text ?? c?.content ?? ''; },
      });
    }

    console.log('[arkhon] LLM raw output: {"action":"' + raw.trim() + '"');

    // Try to parse the JSON action object.
    // The model may output: (a) full JSON, (b) continuation from the primed '{"action":"'
    const trimmed = raw.trim();

    // (a) Looks like a full JSON object — try as-is first
    if (trimmed.startsWith('{')) {
      try { return JSON.parse(trimmed); } catch {}
      // Object is valid up to the action verb but missing index (e.g. {"action":"click" ) — add default index
      const partial = trimmed.replace(/}?\s*$/, '');
      try { return JSON.parse(partial + ',"index":0}'); } catch {}
    }

    // (b) Continuation mode — model output just e.g. 'click", "index": 0}'
    try { return JSON.parse('{"action":"' + trimmed); } catch {}
    // Continuation with no index — model output just e.g. 'click"'
    try { return JSON.parse('{"action":"' + trimmed.replace(/"?\s*$/, '') + '","index":0}'); } catch {}

    // (c) Extract first {...} blob in case there's surrounding text
    const m = trimmed.match(/\{[\s\S]*?\}/);
    if (m) { try { return JSON.parse(m[0]); } catch {} }

    return { action: 'done', answer: 'Could not parse response: ' + raw };
  },
};
