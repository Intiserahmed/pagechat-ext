// embed-ort.js — ONNX Runtime Web embeddings for nomic-embed-text-v1.5
// Replaces wllama embed which crashes on BERT models (llama.cpp WASM b9437 bug).
// Model (~70MB int8) is downloaded once and cached via Cache API.

const MODEL_URL = 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5/resolve/main/onnx/model_int8.onnx';
const VOCAB_URL  = chrome.runtime.getURL('lib/bge-vocab.txt');
const CACHE_NAME = 'arkhon-embed-v2';

let _session     = null;
let _vocab       = null;
let _initPromise = null;

// ── Vocab loader ───────────────────────────────────────────────────────────

async function loadVocab() {
  const resp = await fetch(VOCAB_URL);
  const text = await resp.text();
  const map  = new Map();
  text.split('\n').forEach((tok, i) => { const t = tok.trim(); if (t) map.set(t, i); });
  return map;
}

// ── WordPiece tokenizer ────────────────────────────────────────────────────

function basicTokenize(text) {
  const tokens = [];
  let cur = '';
  // NFD normalization strips accents (combining chars U+0300–U+036F)
  for (const ch of text.normalize('NFD')) {
    if (ch.charCodeAt(0) >= 0x0300 && ch.charCodeAt(0) <= 0x036F) continue;
    if (/\s/.test(ch)) {
      if (cur) { tokens.push(cur); cur = ''; }
    } else if (/[^\w]/.test(ch)) {
      if (cur) { tokens.push(cur); cur = ''; }
      tokens.push(ch);
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function wordpiece(word, vocab) {
  if (vocab.has(word)) return [word];
  const tokens = [];
  let start = 0;
  while (start < word.length) {
    let end = word.length, found = null;
    while (start < end) {
      const sub = (start === 0 ? '' : '##') + word.slice(start, end);
      if (vocab.has(sub)) { found = sub; break; }
      end--;
    }
    if (!found) return ['[UNK]'];
    tokens.push(found);
    start = end;
  }
  return tokens;
}

function tokenize(text, vocab, maxLen = 128) {
  const words  = basicTokenize(text.toLowerCase());
  const pieces = [];
  for (const word of words) {
    for (const p of wordpiece(word, vocab)) pieces.push(p);
    if (pieces.length >= maxLen - 2) break;
  }
  const ids = [101n, ...pieces.slice(0, maxLen - 2).map(p => BigInt(vocab.get(p) ?? 100)), 102n];
  const ones = ids.map(() => 1n);
  const zeros = ids.map(() => 0n);
  return {
    input_ids:      new BigInt64Array(ids),
    attention_mask: new BigInt64Array(ones),
    token_type_ids: new BigInt64Array(zeros),
  };
}

// ── ORT model loader ───────────────────────────────────────────────────────

async function loadModel() {
  // Lazy import ORT — it's a classic script, expose via importScripts or dynamic script tag
  if (!globalThis.ort) throw new Error('ort not loaded — import lib/ort.min.js first');

  const ort = globalThis.ort;
  ort.env.wasm.numThreads = 1; // disable threading — no SharedArrayBuffer needed
  ort.env.wasm.wasmPaths  = {
    'ort-wasm-simd-threaded.wasm': chrome.runtime.getURL('lib/ort-wasm-simd-threaded.wasm'),
    'ort-wasm-simd-threaded.mjs':  chrome.runtime.getURL('lib/ort-wasm-simd-threaded.mjs'),
  };

  // Cache model in browser Cache API
  const cache = await caches.open(CACHE_NAME);
  let resp    = await cache.match(MODEL_URL);
  if (!resp) {
    console.log('[arkhon-embed] downloading nomic-embed-text-v1.5 int8 ONNX (~70MB)…');
    resp = await fetch(MODEL_URL);
    if (!resp.ok) throw new Error(`Model fetch failed: ${resp.status}`);
    await cache.put(MODEL_URL, resp.clone());
  }
  const buf = await resp.arrayBuffer();
  return ort.InferenceSession.create(buf, { executionProviders: ['wasm'] });
}

// ── Mean pooling ───────────────────────────────────────────────────────────

function meanPool(hidden, mask, seq, dim) {
  const out = new Float32Array(dim);
  let count = 0;
  for (let i = 0; i < seq; i++) {
    if (mask[i] === 0n) continue;
    for (let d = 0; d < dim; d++) out[d] += hidden[i * dim + d];
    count++;
  }
  if (count > 0) for (let d = 0; d < dim; d++) out[d] /= count;
  return out;
}

// ── L2 normalise ──────────────────────────────────────────────────────────

function l2norm(vec) {
  let n = 0;
  for (const v of vec) n += v * v;
  n = Math.sqrt(n) || 1;
  const out = new Float32Array(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] / n;
  return out;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function ensureEmbed() {
  if (_session && _vocab) return;
  if (_initPromise) return _initPromise;
  _initPromise = Promise.all([loadModel(), loadVocab()])
    .then(([session, vocab]) => { _session = session; _vocab = vocab; console.log('[arkhon-embed] ready'); })
    .catch(err => { _initPromise = null; throw err; });
  return _initPromise;
}

export async function embed(text) {
  await ensureEmbed();
  const { input_ids, attention_mask, token_type_ids } = tokenize(text, _vocab);
  const seq  = input_ids.length;
  const ort  = globalThis.ort;
  const feeds = {
    input_ids:      new ort.Tensor('int64', input_ids,      [1, seq]),
    attention_mask: new ort.Tensor('int64', attention_mask, [1, seq]),
    token_type_ids: new ort.Tensor('int64', token_type_ids, [1, seq]),
  };
  const out    = await _session.run(feeds);
  // nomic-embed uses mean pooling over all non-padding tokens
  const hidden  = out.last_hidden_state.data;   // Float32Array [1, seq, dim]
  const dim     = out.last_hidden_state.dims[2];
  const pooled  = meanPool(hidden, attention_mask, seq, dim);
  return l2norm(pooled);
}

export function cosine(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // already L2-normalised so dot product = cosine
}
