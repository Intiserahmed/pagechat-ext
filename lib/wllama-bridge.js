// wllama-bridge.js — Extension version
// Chat: Gemma 3 1B (~700MB), Embed: bge-small-en-v1.5 (~33MB, CPU)

import { Wllama, CacheManager } from './wllama.js';
import { ensureEmbed as ortEnsureEmbed, embed as ortEmbed, cosine as ortCosine } from './embed-ort.js';

const EMBED_URL = 'https://huggingface.co/CompendiumLabs/bge-small-en-v1.5-gguf/resolve/main/bge-small-en-v1.5-q4_k_m.gguf';
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
let _modelBusy  = false;   // true while model is generating (chat/summarize)
let _busyTabId  = null;    // which tab triggered the current generation
const _subs     = new Set();
const _cache    = new Map(); // url → { store, title }
const CACHE_MAX = 10;

function emit() {
  _subs.forEach(fn => fn({ status: _status, progress: _progress, useEmbed: _useEmbed, modelBusy: _modelBusy, busyTabId: _busyTabId }));
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
    console.log('[arkhon] loading embed model on CPU (chat model owns the GPU)…');
    // Always load on CPU — the chat model (Gemma) already occupies the GPU WASM worker.
    // pooling_type: 'mean' is required for nomic-embed-text (BERT mean-pooling architecture).
    // Without it wllama passes LLAMA_POOLING_TYPE_UNSPECIFIED and llama_get_embeddings()
    // reads from the wrong memory offset → RangeError: Invalid typed array length.
    const params = { embeddings: true, n_ctx: 512, n_gpu_layers: 0, pooling_type: 'cls' };
    const inst = new Wllama({ 'default': WASM_URL() }, { suppressNativeLog: true });
    await loadWithCache(inst, EMBED_URL, params);
    _embed = inst;
    console.log('[arkhon] embed model ready (CPU)');
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

  setBusy(busy, tabId) {
    _modelBusy = busy;
    _busyTabId = busy ? tabId : null;
    emit();
  },

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
    console.log(`[arkhon] indexKnowledge: ${chunks.length} chunks`);
    try {
      await ortEnsureEmbed();
      for (const chunk of chunks) {
        const emb = await ortEmbed('search_document: ' + chunk);
        _knowledgeStore.push({ text: chunk, emb });
      }
      console.log(`[arkhon] indexKnowledge done: ${_knowledgeStore.length} entries (ORT embed)`);
    } catch (err) {
      console.warn('[arkhon] indexKnowledge embed failed — storing text only for BM25:', err.message);
      _knowledgeStore = chunks.map(t => ({ text: t, emb: null }));
    }
  },

  /** Retrieve relevant knowledge chunks for a set of fields. */
  async _retrieveForFields(fields) {
    if (_knowledgeStore.length === 0) return null; // signal: caller will use BM25 on raw text
    if (_knowledgeStore.length <= 8) return _knowledgeStore.map(c => c.text).join('\n');

    const fieldQuery = fields.map(f => [f.label, f.placeholder, f.name].filter(Boolean).join(' ')).join(' ');

    const hasEmb = _knowledgeStore[0]?.emb != null;
    if (hasEmb) {
      try {
        await ortEnsureEmbed();
        const queryEmb = await ortEmbed('search_query: ' + fieldQuery);
        const retrieved = [..._knowledgeStore]
          .map(item => ({ text: item.text, score: ortCosine(queryEmb, item.emb) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(item => item.text);
        return retrieved.join('\n');
      } catch (err) {
        console.warn('[arkhon] _retrieveForFields embed failed — falling back to BM25:', err.message);
      }
    }

    return retrieveBM25(fieldQuery, 5, _knowledgeStore).join('\n');
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
   * Returns { text: filteredDomText } — original [N] indices preserved, no remapping needed.
   */
  async embedFilter(goal, domText, topK = 5, onStatus) {
    const lines = domText.split('\n').filter(Boolean);
    if (lines.length <= topK) {
      console.log(`[arkhon] embedFilter: ${lines.length} elements ≤ topK=${topK}, skipping embed`);
      return { text: domText };
    }

    let kept;

    try {
      onStatus?.('Loading embed model…');
      await ortEnsureEmbed();
      onStatus?.(`Embedding ${lines.length} elements…`);
      console.log(`[arkhon] embedFilter: ORT embedding goal + ${lines.length} elements`);

      const goalEmb = await ortEmbed('search_query: ' + goal);
      const scored  = [];
      for (const line of lines) {
        const label   = line.replace(/^\[\d+\]\s*/, '').slice(0, 120);
        const emb     = await ortEmbed('search_document: ' + label);
        const origIdx = parseInt(line.match(/^\[(\d+)\]/)?.[1] ?? scored.length);
        scored.push({ line, origIdx, score: ortCosine(goalEmb, emb) });
      }
      // Keep top-K by score, restore original order so LLM sees them top-to-bottom
      kept = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .sort((a, b) => a.origIdx - b.origIdx);

      const topScores = kept.map(k => `[${k.origIdx}]=${k.score.toFixed(3)}`).join(', ');
      console.log(`[arkhon] embedFilter: kept ${kept.length} — ${topScores}`);
      onStatus?.(`Top ${kept.length} elements`);
    } catch (embedErr) {
      console.warn(`[arkhon] embedFilter: ORT embed failed (${embedErr.message}) — keyword fallback`);
      onStatus?.('Keyword filter');
      kept = keywordFilter(goal, lines, topK);
    }

    // Sort best-match first so LLM position bias works in our favour.
    // Renumber 1-N so the model sees clean ordinals, not confusing original CDP indices.
    // indexMap maps LLM position (1-based) → real origIdx for CDP execution.
    kept.sort((a, b) => b.score - a.score);
    const indexMap = {};
    const newLines = kept.map(({ line, origIdx }, i) => {
      const pos = i + 1;
      indexMap[pos] = origIdx;
      return `${pos}. ${line.replace(/^\[\d+\]\s*/, '')}`;
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

    const historyStr = history.length > 0
      ? `\nCompleted steps: ${history.join(' → ')}.\nDo the next step only.\n`
      : '\n';

    const prompt = `<start_of_turn>user\n\
You control a web browser. You will be given a goal and a numbered list of interactive elements on the current page.

Your job: output exactly ONE action to move closer to the goal.

Available actions (output as JSON):
- Click a link or button:      {"action":"click","index":1}
- Type text into a field:      {"action":"fill","index":1,"value":"text to type"}
- Scroll an element:           {"action":"scroll","index":1,"direction":"down"}
- Go to a URL directly:        {"action":"navigate","url":"https://..."}
- Goal is fully complete:      {"action":"done","answer":"brief answer"}

Rules:
- Elements are numbered 1, 2, 3… — use the number shown. Never invent a number.
- Element 1 is the most relevant to the goal — prefer it unless it clearly does not fit.
- Pick the element that best matches the next step toward the goal.
- If the goal needs multiple steps, do only the immediate next one.
- If the completed steps already achieved the goal, output done immediately.
Goal: ${goal}
${historyStr}
Page elements:
${domTree}

Output one JSON action now.<end_of_turn>
<start_of_turn>model
{"action":"`;

    console.log('[arkhon] prompt:\n' + prompt);

    // GBNF grammar — constrains the model's CONTINUATION after the primed '{"action":"'.
    // Each action rule starts from the bare word (e.g. "click") and closes the opening
    // quote already in the prompt with \", then adds the remaining fields.
    // Model output: click","index":28}  →  assembled: {"action":"click","index":28}
    const AGENT_GRAMMAR = `\
root   ::= act ws "}"
act    ::= click | fill | scroll | nav | done
click  ::= "click\\"," ws "\\"index\\"" ws ":" ws num
fill   ::= "fill\\"," ws "\\"index\\"" ws ":" ws num ws "," ws "\\"value\\"" ws ":" ws str
scroll ::= "scroll\\"," ws "\\"index\\"" ws ":" ws num ws "," ws "\\"direction\\"" ws ":" ws dir
nav    ::= "navigate\\"," ws "\\"url\\"" ws ":" ws str
done   ::= "done\\"," ws "\\"answer\\"" ws ":" ws str
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

    const trimmed = raw.trim();
    console.log('[arkhon] LLM raw output: {"action":"' + trimmed);

    // Parse strategy — the prompt primes with '{"action":"' so the grammar/model
    // outputs only the continuation, e.g. 'click","index":3}'.
    // But without grammar the model may output a full JSON object or malformed variants.

    // (a) Continuation mode (grammar path) — reconstruct and parse
    try { return JSON.parse('{"action":"' + trimmed); } catch {}

    // (b) Full JSON object — model ignored the prime and output complete JSON
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        // (c) Nested case: action field is itself a JSON string
        if (typeof parsed.action === 'string' && parsed.action.startsWith('{')) {
          try { return JSON.parse(parsed.action); } catch {}
        }
        return parsed;
      } catch {}
      // Partial object — missing closing brace or index
      const partial = trimmed.replace(/}?\s*$/, '');
      try { return JSON.parse(partial + ',"index":0}'); } catch {}
    }

    // (d) Continuation with no trailing — model output just e.g. 'click"'
    try { return JSON.parse('{"action":"' + trimmed.replace(/"?\s*$/, '') + '","index":0}'); } catch {}

    // (e) Extract ANY valid {...} blob anywhere in the full reconstructed string
    const fullRaw = '{"action":"' + trimmed;
    const allBlobs = fullRaw.match(/\{[^{}]*\}/g) ?? [];
    for (const blob of allBlobs) {
      try { const p = JSON.parse(blob); if (p.action) return p; } catch {}
    }

    return { action: 'done', answer: 'Could not parse response: ' + raw };
  },
};
