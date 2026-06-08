const { useState, useEffect, useRef, createElement: h } = React;

// ── Default settings ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  systemPrompt:    '',           // empty = use built-in default
  responseStyle:   'balanced',   // concise | balanced | detailed
  chunkK:          3,            // chunks to retrieve (2–6)
  autoIndex:       true,         // auto-index on load in BM25 mode
  showSuggestions: true,         // generate 3 starter questions after indexing
  fillKnowledge:   '',           // personal info used for form autofill
  useEmbed:        false,        // disabled: embed model fix pending
};
const STYLE_TOKENS = { concise: 300, balanced: 600, detailed: 1200 };

// Reload panel if extension context is invalidated (SW update/reload)
window.addEventListener('error', (e) => {
  if (e.message?.includes('Extension context invalidated')) window.location.reload();
});
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('Extension context invalidated')) window.location.reload();
});

// ── Proxy to offscreen model host ────────────────────────────────────────────
// All AI operations are routed as chrome.runtime messages to model-host.js.
// Responses stream back as PC_STATE / PC_TOKEN / PC_CHAT_DONE / PC_ERROR /
// PC_SUGGESTIONS broadcasts from the offscreen document.
const __pc = (() => {
  let _state   = { status: 'idle', progress: 0, useEmbed: false, chunkCount: 0, cachedPages: 0 };
  let _myTabId = null;
  const _subs  = new Set();
  let _chatCbs           = null;  // { onToken, resolve, reject }
  let _suggestResolve    = null;
  let _fillResolve       = null;
  let _knowledgeResolve  = null;
  let _agentCbs               = null;  // { resolve, reject }
  let _embedFilterCbs         = null;  // { resolve, reject }
  let _embedStatusCb          = null;
  let _remainingGoalCbs       = null;  // { resolve, reject }
  let _stopped                = false;
  let _modelBusy              = false;

  // Cache this iframe's tab ID so we can filter tab-targeted messages.
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    _myTabId = tab?.id ?? null;
  });

  // Central incoming-message router (offscreen → all extension pages)
  chrome.runtime.onMessage.addListener((msg) => {
    switch (msg.type) {
      case 'PC_STATE':
        _state = {
          status:      msg.status,
          progress:    msg.progress,
          useEmbed:    msg.useEmbed,
          chunkCount:  msg.chunkCount,
          cachedPages: msg.cachedPages,
        };
        _subs.forEach(fn => fn({ ..._state }));
        break;

      case 'PC_TOKEN':
        if (msg.tabId === _myTabId && _chatCbs && !_stopped) _chatCbs.onToken(msg.token);
        break;

      case 'PC_CHAT_DONE':
        if (msg.tabId === _myTabId) {
          _stopped = false;
          if (_chatCbs) { _chatCbs.resolve(); _chatCbs = null; }
        }
        break;

      case 'PC_ERROR':
        if (msg.tabId === _myTabId && _chatCbs) {
          _chatCbs.reject(new Error(msg.message));
          _chatCbs = null;
        }
        break;

      case 'PC_SUGGESTIONS':
        if (msg.tabId === _myTabId && _suggestResolve) {
          _suggestResolve(msg.questions ?? []);
          _suggestResolve = null;
        }
        break;

      case 'PC_FILL_RESULT':
        if (msg.tabId === _myTabId && _fillResolve) {
          _fillResolve(msg.fills ?? {});
          _fillResolve = null;
        }
        break;

      case 'PC_KNOWLEDGE_DONE':
        if (msg.tabId === _myTabId && _knowledgeResolve) {
          _knowledgeResolve();
          _knowledgeResolve = null;
        }
        break;

      case 'PC_AGENT_RESULT':
        if (msg.tabId === _myTabId && _agentCbs) {
          _agentCbs.resolve(msg.action);
          _agentCbs = null;
        }
        break;

      case 'PC_REMAINING_GOAL_RESULT':
        if (msg.tabId === _myTabId && _remainingGoalCbs) {
          _remainingGoalCbs.resolve(msg.remaining);
          _remainingGoalCbs = null;
        }
        break;

      case 'PC_EMBED_STATUS':
        if (msg.tabId === _myTabId && _embedStatusCb) _embedStatusCb(msg.status);
        break;

      case 'PC_EMBED_FILTER_RESULT':
        if (msg.tabId === _myTabId && _embedFilterCbs) {
          _embedFilterCbs.resolve({ text: msg.text, indexMap: msg.indexMap });
          _embedFilterCbs = null;
        }
        break;
    }
  });

  return {
    // ── Read-only state ──────────────────────────────────────────────────────
    get status()     { return _state.status; },
    get progress()   { return _state.progress; },
    get useEmbed()   { return _state.useEmbed; },
    get chunkCount() { return _state.chunkCount; },
    get cachedPages(){ return _state.cachedPages; },

    /** Subscribe to state changes. Returns unsubscribe function. */
    subscribe(fn) {
      _subs.add(fn);
      return () => _subs.delete(fn);
    },

    // ── Commands (fire-and-forget or response via broadcast) ─────────────────
    loadModels() {
      chrome.runtime.sendMessage({ type: 'PC_CMD_LOAD' }).catch(() => {});
    },

    setUseEmbed(val) {
      chrome.runtime.sendMessage({ type: 'PC_CMD_SET_EMBED', val }).catch(() => {});
    },

    /** Trigger indexing — progress arrives via PC_STATE broadcasts. */
    indexPage(text, url) {
      chrome.runtime.sendMessage({ type: 'PC_CMD_INDEX', text, url }).catch(() => {});
      return Promise.resolve();
    },

    /** Returns true if index was restored from cache, false on cache miss. */
    restoreFromCache(url) {
      return new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'PC_CMD_RESTORE', url }, resp => {
          void chrome.runtime.lastError;
          resolve(resp?.hit ?? false);
        });
      });
    },

    /** Returns Promise<string[]> of 3 suggested questions. */
    suggestQuestions() {
      return new Promise((resolve, reject) => {
        _suggestResolve = resolve;
        chrome.runtime.sendMessage({ type: 'PC_CMD_SUGGEST', tabId: _myTabId }).catch(err => {
          _suggestResolve = null;
          reject(err);
        });
      });
    },

    /** Stream a chat response. onToken called per token; resolves on done. */
    chat(messages, onToken, opts = {}) {
      if (_modelBusy) return Promise.reject(new Error('Model is busy — please wait'));
      _modelBusy = true;
      return new Promise((resolve, reject) => {
        _stopped = false;
        _chatCbs = {
          onToken,
          resolve: () => { _modelBusy = false; resolve(); _chatCbs = null; },
          reject:  (e) => { _modelBusy = false; reject(e); _chatCbs = null; },
        };
        chrome.runtime.sendMessage({ type: 'PC_CMD_CHAT', messages, tabId: _myTabId, opts }).catch(err => {
          _modelBusy = false; _chatCbs = null; reject(err);
        });
      });
    },

    /** Clear wllama model cache. Resolves when done. */
    clearModelCache() {
      return new Promise(resolve => {
        const handler = (msg) => {
          if (msg.type === 'PC_CACHE_CLEARED') {
            chrome.runtime.onMessage.removeListener(handler);
            resolve();
          }
        };
        chrome.runtime.onMessage.addListener(handler);
        chrome.runtime.sendMessage({ type: 'PC_CMD_CLEAR_CACHE' }).catch(() => { resolve(); });
      });
    },

    /** Index personal knowledge base. Returns Promise that resolves when done. */
    indexKnowledge(text) {
      return new Promise((resolve) => {
        _knowledgeResolve = resolve;
        chrome.runtime.sendMessage({ type: 'PC_CMD_INDEX_KNOWLEDGE', text, tabId: _myTabId })
          .catch(() => { _knowledgeResolve = null; resolve(); });
      });
    },

    /** Fill form fields. Returns Promise<{ idx: value }> */
    fillForm(fields, request) {
      return new Promise((resolve, reject) => {
        _fillResolve = resolve;
        chrome.runtime.sendMessage({ type: 'PC_CMD_FILL', fields, request, tabId: _myTabId }).catch(err => {
          _fillResolve = null;
          reject(err);
        });
      });
    },

    /** Map-reduce page summarization. onToken streams final summary, onProgress shows section progress. */
    summarize(onToken, onProgress) {
      return new Promise((resolve, reject) => {
        _stopped = false;

        const progressHandler = (msg) => {
          if (msg.type === 'PC_SUMMARIZE_PROGRESS' && msg.tabId === _myTabId) {
            if (onProgress) onProgress(msg.progress);
          }
        };
        chrome.runtime.onMessage.addListener(progressHandler);

        _modelBusy = true;
        _chatCbs = {
          onToken,
          resolve: () => { _modelBusy = false; chrome.runtime.onMessage.removeListener(progressHandler); _chatCbs = null; resolve(); },
          reject:  (e) => { _modelBusy = false; chrome.runtime.onMessage.removeListener(progressHandler); _chatCbs = null; reject(e); },
        };

        chrome.runtime.sendMessage({ type: 'PC_CMD_SUMMARIZE', tabId: _myTabId })
          .catch(err => {
            _modelBusy = false;
            chrome.runtime.onMessage.removeListener(progressHandler);
            _chatCbs = null;
            reject(err);
          });
      });
    },

    /** After an action, ask model what goal remains. Returns remaining goal string or "done". */
    remainingGoal(goal, actionTaken) {
      return new Promise((resolve, reject) => {
        _remainingGoalCbs = { resolve, reject };
        chrome.runtime.sendMessage({ type: 'PC_CMD_REMAINING_GOAL', goal, actionTaken, tabId: _myTabId })
          .catch(err => { _remainingGoalCbs = null; reject(err); });
      });
    },

    /** Filter DOM elements by nomic-embed cosine similarity. Returns { text, indexMap }. */
    embedFilter(goal, domText, topK = 5, onStatus) {
      return new Promise((resolve, reject) => {
        _embedFilterCbs = { resolve, reject };
        _embedStatusCb = onStatus ?? null;
        chrome.runtime.sendMessage({ type: 'PC_CMD_EMBED_FILTER', goal, domText, topK, tabId: _myTabId })
          .catch(err => { _embedFilterCbs = null; _embedStatusCb = null; reject(err); });
      });
    },

    /** Single agent reasoning step. Returns Promise<string> action line. */
    agentStep(goal, domTree, history) {
      return new Promise((resolve, reject) => {
        _agentCbs = { resolve, reject };
        chrome.runtime.sendMessage({ type: 'PC_CMD_AGENT_STEP', goal, domTree, history, tabId: _myTabId })
          .catch(err => { _agentCbs = null; reject(err); });
      });
    },

    /** Stop streaming chat immediately. */
    stop() {
      if (!_chatCbs) return;
      _stopped = true;
      _chatCbs.resolve();
      // resolve() already clears _chatCbs and _modelBusy via the wrapper above
    },

    /** Abort all pending AI operations (chat, agent step, embed filter). */
    abort() {
      _stopped = true;
      _modelBusy = false;
      if (_chatCbs) { _chatCbs.reject(new Error('Aborted')); _chatCbs = null; }
      if (_agentCbs) { _agentCbs.reject(new Error('Aborted')); _agentCbs = null; }
      if (_embedFilterCbs) { _embedFilterCbs.reject(new Error('Aborted')); _embedFilterCbs = null; }
      if (_remainingGoalCbs) { _remainingGoalCbs.reject(new Error('Aborted')); _remainingGoalCbs = null; }
    },
  };
})();

// ── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  send: () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    h('path', { d: 'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z' })),
  index: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' },
    h('path', { d: 'M12 3v12m0 0l-4-4m4 4l4-4M5 21h14' })),
  gear: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' },
    h('circle', { cx: 12, cy: 12, r: 3 }),
    h('path', { d: 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' })),
  stop: () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'currentColor' },
    h('rect', { x: 4, y: 4, width: 16, height: 16, rx: 2 })),
  fill: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M12 20h9' }),
    h('path', { d: 'M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' })),
  summarize: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
    h('line', { x1: 3, y1: 12, x2: 15, y2: 12 }),
    h('line', { x1: 3, y1: 18, x2: 18, y2: 18 }),
  ),
  trash: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('polyline', { points: '3 6 5 6 21 6' }),
    h('path', { d: 'M19 6l-1 14H6L5 6' }),
    h('path', { d: 'M10 11v6M14 11v6' }),
    h('path', { d: 'M9 6V4h6v2' }),
  ),
  dot: (live) => h('span', {
    className: 'led' + (live ? ' pulse' : ''),
    style: { '--c': live ? 'var(--green)' : 'var(--muted)' },
  }),
};

// ── Status label ─────────────────────────────────────────────────────────────
function statusLabel(status, progress, reconnecting) {
  if (reconnecting && (status === 'idle' || status === 'loading-embed' || status === 'loading-chat')) {
    return progress > 0 ? `Reconnecting… ${progress}%` : 'Reconnecting…';
  }
  switch (status) {
    case 'idle':           return 'Loading models…';
    case 'loading-embed':  return progress > 0 ? `Loading embed model… ${progress}%` : 'Loading embed model…';
    case 'loading-chat':   return progress > 0 ? `Loading model… ${progress}%` : 'Loading model…';
    case 'indexing':       return `Indexing page… ${progress}%`;
    case 'ready-no-index': return 'Models ready — index the current page';
    case 'ready':          return 'Ready';
    case 'error':          return 'Error — check console';
    default:               return status;
  }
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ progress, pulse }) {
  return h('div', { className: 'prog-wrap' },
    h('div', { className: 'prog-bar' },
      h('div', { className: 'prog-fill', style: {
        width: pulse ? '100%' : progress + '%',
        animation: pulse ? 'progPulse 1.2s ease-in-out infinite' : 'none',
      }}),
    ),
    !pulse && h('span', { className: 'prog-pct' }, progress + '%'),
  );
}

// ── Settings panel ───────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange, knowledgeStatus, useEmbed, modelLoaded }) {
  const set = (key, val) => {
    const next = { ...settings, [key]: val };
    onChange(next);
    chrome.storage.sync.set(next);
  };

  return h('div', { className: 'settings' },
    /* Retrieval mode — re-enable when embed model is fixed
    h('p', { className: 'set-section' }, 'Retrieval mode'),
    h('label', { className: 'embed-toggle' },
      h('input', {
        type: 'checkbox',
        checked: useEmbed,
        disabled: modelLoaded,
        onChange: e => {
          const val = e.target.checked;
          set('useEmbed', val);
          __pc.setUseEmbed(val);
        },
      }),
      h('span', null, 'AI embeddings for form fill (nomic-embed-text, +80 MB)'),
    ),
    modelLoaded && h('p', { className: 'set-note' }, 'Takes effect after reloading the extension.'),
    */

    h('p', { className: 'set-section' }, 'Response style'),
    h('div', { className: 'set-trio' },
      ['concise', 'balanced', 'detailed'].map(s =>
        h('button', {
          key: s,
          className: 'set-trio-btn' + (settings.responseStyle === s ? ' active' : ''),
          onClick: () => set('responseStyle', s),
        }, s)
      ),
    ),

    h('p', { className: 'set-section' }, `Retrieved chunks — ${settings.chunkK}`),
    h('input', {
      type: 'range', min: 2, max: 6, step: 1,
      value: settings.chunkK,
      className: 'set-slider',
      onChange: e => set('chunkK', Number(e.target.value)),
    }),
    h('div', { className: 'set-slider-labels' },
      h('span', null, '2 precise'), h('span', null, '6 broad'),
    ),

    h('p', { className: 'set-section' }, 'Auto-index on page load'),
    h('label', { className: 'embed-toggle' },
      h('input', {
        type: 'checkbox',
        checked: settings.autoIndex,
        onChange: e => set('autoIndex', e.target.checked),
      }),
      h('span', null, 'Index automatically when models are ready'),
    ),

    h('p', { className: 'set-section' }, 'Suggested questions'),
    h('label', { className: 'embed-toggle' },
      h('input', {
        type: 'checkbox',
        checked: settings.showSuggestions,
        onChange: e => set('showSuggestions', e.target.checked),
      }),
      h('span', null, 'Show 3 starter questions after indexing'),
    ),

    /* Knowledge base / autofill — re-enable when embed model is fixed
    h('div', { className: 'set-section-row' },
      h('p', { className: 'set-section', style: { margin: 0 } }, 'Knowledge base (for form autofill)'),
      knowledgeStatus === 'indexing' && h('span', { className: 'know-status' }, '⊙ indexing…'),
      knowledgeStatus === 'ready'    && h('span', { className: 'know-status ready' }, '✓ ready'),
    ),
    h('textarea', {
      className: 'set-prompt',
      value: settings.fillKnowledge,
      onChange: e => set('fillKnowledge', e.target.value),
      placeholder: 'Name: John Doe\nEmail: john@example.com\nPhone: +1 555 1234\nAddress: 123 Main St\n\nAdd any info you want auto-filled into forms.',
      rows: 6,
    }),
    settings.fillKnowledge && h('button', {
      className: 'btn-ghost btn-sm set-clear',
      onClick: () => set('fillKnowledge', ''),
    }, 'Clear'),
    */

    h('p', { className: 'set-section' }, 'Custom system prompt'),
    h('textarea', {
      className: 'set-prompt',
      value: settings.systemPrompt,
      onChange: e => set('systemPrompt', e.target.value),
      placeholder: 'Leave blank to use the default prompt.\n\nExample: Always respond in bullet points. Be very detailed.',
      rows: 5,
    }),
    settings.systemPrompt && h('button', {
      className: 'btn-ghost btn-sm set-clear',
      onClick: () => set('systemPrompt', ''),
    }, 'Reset to default'),

    h('p', { className: 'set-section', style: { marginTop: '10px' } }, 'Model cache'),
    h('button', {
      className: 'btn-ghost btn-sm',
      onClick: () => __pc.clearModelCache(),
      title: 'Clears cached model files — fixes corrupted cache errors. Model will re-download on next load.',
    }, 'Clear model cache'),
  );
}

// ── Markdown renderer (minimal: headers, bullets, bold, italic, code) ────────
function parseInline(text) {
  const parts = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0, key = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] != null) parts.push(h('strong', { key: key++ }, m[1]));
    else if (m[2] != null) parts.push(h('em', { key: key++ }, m[2]));
    else if (m[3] != null) parts.push(h('code', { key: key++ }, m[3]));
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 0 ? null : parts.length === 1 ? parts[0] : parts;
}

function renderMd(text) {
  if (!text) return [];
  return text.split('\n').map((line, i) => {
    const hm = line.match(/^#{1,3}\s+(.+)/);
    if (hm) return h('p', { key: i, className: 'md-h' }, parseInline(hm[1]));
    const bm = line.match(/^[-*]\s+(.+)/);
    if (bm) return h('p', { key: i, className: 'md-li' }, parseInline(bm[1]));
    if (!line.trim()) return h('p', { key: i, className: 'md-gap' });
    return h('p', { key: i, className: 'md-p' }, parseInline(line));
  });
}

// ── Main app ─────────────────────────────────────────────────────────────────
// True when running as Chrome side panel (extension page), false when in FAB iframe
const IS_SIDEBAR = window === window.top;

function App() {
  const [state, setState]       = useState({ status: 'idle', progress: 0, useEmbed: false });
  const [pageInfo, setPageInfo] = useState({ title: '', url: '' });
  const [msgs, setMsgs]         = useState([]);
  const [agentMsgs, setAgentMsgs] = useState([]); // isolated agent messages — never reset by loadTab
  const [input, setInput]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [agentBusy, setAgentBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [suggestions, setSuggestions]         = useState([]);
  const [knowledgeStatus, setKnowledgeStatus] = useState('idle'); // idle | indexing | ready
  const bottomRef     = useRef(null);
  const settingsRef   = useRef(settings);
  const currentUrlRef = useRef('');
  const loadTabRef    = useRef(null);   // lets status effect re-trigger loadTab
  const prevStatusRef  = useRef('idle'); // tracks previous status for transition detection
  const wasReadyRef    = useRef(false);  // true once model has been ready — used for reconnecting label
  const agentAbortRef  = useRef(false);  // set true to abort current agent run
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const { status, progress, useEmbed } = state;
  const isReady      = status === 'ready';
  const modelLoaded  = status === 'ready' || status === 'ready-no-index'; // model loaded, page may not be indexed
  const isLoading    = ['loading-embed', 'loading-chat', 'indexing'].includes(status);
  const reconnecting = wasReadyRef.current && (status === 'idle' || isLoading);

  // Track when model has ever been ready so we can show "Reconnecting" on reload
  if (modelLoaded) wasReadyRef.current = true;

  // Load persisted settings
  useEffect(() => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, stored => setSettings(stored));
  }, []);

  // Save chat history to session storage whenever msgs change
  useEffect(() => {
    const url = currentUrlRef.current;
    if (!url || msgs.length === 0) return;
    chrome.storage.session.set({ [`arkhon_msgs_${url}`]: msgs });
  }, [msgs]);

  // Bootstrap: get state from background cache, subscribe to future state changes
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'PC_CMD_STATE' }, cached => {
      void chrome.runtime.lastError;
      if (cached) {
        setState({ status: cached.status, progress: cached.progress, useEmbed: cached.useEmbed });
        if (cached.status === 'idle') {
          // Apply persisted embed preference before starting the load
          chrome.storage.sync.get({ useEmbed: false }, ({ useEmbed }) => {
            if (useEmbed) __pc.setUseEmbed(true);
            __pc.loadModels();
          });
        }
      } else {
        chrome.storage.sync.get({ useEmbed: false }, ({ useEmbed }) => {
          if (useEmbed) __pc.setUseEmbed(true);
          __pc.loadModels();
        });
      }
    });
    return __pc.subscribe(s => setState({ status: s.status, progress: s.progress, useEmbed: s.useEmbed }));
  }, []);

  // Tab change listener — update page pill, restore history, re-index / restore cache
  useEffect(() => {
    let debounce = null;

    const loadTab = (tab, immediate = false) => {
      if (!tab) return;
      const url   = tab.url || '';
      const title = tab.title || '';
      setPageInfo({ title, url });
      currentUrlRef.current = url;

      // Always restore chat history for this URL
      chrome.storage.session.get(`arkhon_msgs_${url}`, stored => {
        setMsgs(stored[`arkhon_msgs_${url}`] ?? []);
      });

      if (!url.startsWith('http://') && !url.startsWith('https://')) return;
      const s = __pc.status;
      if (s === 'idle' || s === 'loading-embed' || s === 'loading-chat') return;

      const run = async () => {
        setSuggestions([]);
        if (isYouTubeVideo(url)) return; // YouTube: wait for user to trigger
        const hit = await __pc.restoreFromCache(url);
        if (!hit) {
          handleIndex();
        } else if (settingsRef.current.showSuggestions) {
          __pc.suggestQuestions().then(qs => setSuggestions(qs)).catch(() => {});
        }
      };

      clearTimeout(debounce);
      debounce = immediate ? (run(), null) : setTimeout(run, 400);
    };

    // Expose loadTab so the status-watching effect can re-trigger it when model becomes ready
    loadTabRef.current = loadTab;

    // Initial load — run immediately
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => loadTab(tab, true));

    // Persistent port — background pushes tab-change events reliably.
    // Auto-reconnects when the service worker is killed and restarts.
    let port;
    const connectPort = () => {
      try {
        port = chrome.runtime.connect({ name: 'sidepanel' });
      } catch (e) {
        // Extension context invalidated (SW reloaded) — reload the panel to restore context
        if (e.message?.includes('Extension context invalidated')) { window.location.reload(); return; }
        throw e;
      }
      port.onMessage.addListener((msg) => {
        if (msg.type === 'TAB_UPDATED' && msg.url) {
          chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            loadTab({ ...tab, url: msg.url });
          });
        } else if (msg.type === 'TAB_CHANGED') {
          chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => loadTab(tab));
        }
      });
      port.onDisconnect.addListener(() => {
        // SW was killed — reconnect and request fresh state so sidepanel un-grays
        setTimeout(() => {
          connectPort();
          try {
            chrome.runtime.sendMessage({ type: 'PC_CMD_STATE' }, cached => {
              void chrome.runtime.lastError;
              if (cached) setState({ status: cached.status, progress: cached.progress, useEmbed: cached.useEmbed });
            });
            chrome.runtime.sendMessage({ type: 'PC_CMD_STATE_REQ' }, () => void chrome.runtime.lastError);
          } catch { /* extension context not yet valid — connectPort will retry */ }
        }, 200);
      });
    };
    connectPort();

    return () => { port.disconnect(); clearTimeout(debounce); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Re-trigger loadTab when model transitions from loading → ready.
  // loadTab exits early while the model loads, so the page never indexes after first open.
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    const wasLoading = prev === 'idle' || prev === 'loading-embed' || prev === 'loading-chat';
    const isNowReady = status === 'ready' || status === 'ready-no-index';
    if (wasLoading && isNowReady) {
      if (loadTabRef.current) {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          if (tab) loadTabRef.current(tab);
        });
      }
      // Re-feed knowledge base after reconnect (model tab was closed and recreated)
      if (wasReadyRef.current && settingsRef.current.fillKnowledge?.trim()) {
        __pc.indexKnowledge(settingsRef.current.fillKnowledge).catch(() => {});
      }
    }
  }, [status]);

  // Generate suggestions once page is freshly indexed
  useEffect(() => {
    if (!settings.showSuggestions) { setSuggestions([]); return; }
    if (status === 'ready' && msgs.length === 0) {
      setSuggestions([]);
      __pc.suggestQuestions()
        .then(qs => setSuggestions(qs))
        .catch(() => {});
    }
  }, [status, settings.showSuggestions]);

  // Knowledge indexing only needed when embed model is active (for semantic fill matching)
  // With embed disabled, fillForm uses BM25 on raw text directly — no pre-indexing needed.

  // Auto-index: BM25 mode + autoIndex setting + real web page
  useEffect(() => {
    if (status === 'ready-no-index' && !useEmbed && settings.autoIndex) {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        const url = tab?.url || '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
          handleIndex();
        }
      });
    }
  }, [status, useEmbed, settings.autoIndex]);

  const isYouTubeVideo = (url) => /youtube\.com\/watch/.test(url);

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function parseAgentAction(raw) {
    const s = raw.trim();
    const clickM  = s.match(/^click\s+(\d+)/i);
    if (clickM)  return { type: 'click',    index: parseInt(clickM[1]) };
    const fillM   = s.match(/^fill\s+(\d+)\s+([\s\S]+)/i);
    if (fillM)   return { type: 'fill',     index: parseInt(fillM[1]), value: fillM[2].replace(/^["']|["']$/g, '') };
    const scrollM = s.match(/^scroll\s+(\d+)\s+(down|up)/i);
    if (scrollM) return { type: 'scroll',   index: parseInt(scrollM[1]), direction: scrollM[2].toLowerCase() };
    const navM    = s.match(/^navigate\s+(https?:\/\/\S+)/i);
    if (navM)    return { type: 'navigate', url: navM[1] };
    const doneM   = s.match(/^done\s*([\s\S]*)/i);
    if (doneM)   return { type: 'done',     answer: doneM[1].replace(/^["']|["']$/g, '').trim() };
    return { type: 'unknown', raw: s };
  }

  const runAgent = async (initialGoal) => {
    if (agentBusy || !initialGoal.trim()) return;
    agentAbortRef.current = false;
    setAgentBusy(true);
    setInput('');
    setAgentMsgs([{ role: 'user', content: initialGoal }]);

    const MAX_STEPS = 12;
    const [tab] = await new Promise(r => chrome.tabs.query({ active: true, currentWindow: true }, r));

    const getTabUrl = () => new Promise(r => chrome.tabs.get(tab.id, t => r(t?.url ?? '')));
    const reattach  = () => new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'AGENT_START', tabId: tab.id }, r => { void chrome.runtime.lastError; resolve(r); });
    });

    // Wait for the tab to finish loading (used after navigation/click that changes URL)
    const waitForPageLoad = (timeout = 10000) => new Promise(resolve => {
      const timer = setTimeout(resolve, timeout);
      const handler = (updatedTabId, changeInfo) => {
        if (updatedTabId === tab.id && changeInfo.status === 'complete') {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(handler);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(handler);
    });

    // Attach CDP debugger for the agent session
    const attachResult = await new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'AGENT_START', tabId: tab.id }, r => {
        void chrome.runtime.lastError;
        resolve(r ?? { ok: false, error: 'no response' });
      });
    });
    if (!attachResult.ok) {
      setAgentMsgs(m => [...m, { role: 'assistant', content: 'Agent error: ' + attachResult.error }]);
      setAgentBusy(false);
      return;
    }

    try {
      const actionHistory = []; // accumulates completed actions — passed to LLM each step

      for (let step = 0; step < MAX_STEPS; step++) {
        if (agentAbortRef.current) break;

        // Get semantic element list via CDP Accessibility tree
        const domResult = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: 'GET_DOM_TREE_CDP', tabId: tab.id }, resp => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else if (resp?.error) reject(new Error(resp.error));
            else resolve(resp);
          });
        });

        const updateStep = (content) => setAgentMsgs(m => { const n = [...m]; n[n.length-1] = { ...n[n.length-1], content }; return n; });
        setAgentMsgs(m => [...m, { role: 'assistant', content: `⟳ Filtering ${domResult.count} elements…`, isAgent: true }]);

        // Filter DOM to top-5 most relevant elements, sorted best-match first, renumbered 1-5
        const { text: filteredText, indexMap } = await __pc.embedFilter(
          initialGoal, domResult.text, 5,
          (status) => updateStep(`⟳ ${status}`),
        );

        const keptCount = filteredText.split('\n').filter(Boolean).length;
        updateStep(`⟳ Thinking… (${keptCount} elements)`);

        // Ask LLM what to do next
        const parsed = await __pc.agentStep(initialGoal, filteredText, actionHistory);
        const action = parsed.action;

        const elLabel = (idx) => {
          const line = filteredText.split('\n').find(l => l.startsWith(`${idx}.`));
          if (!line) return `element ${idx}`;
          return `"${line.replace(/^\d+\.\s*/, '').slice(0, 50)}"`;
        };

        let actionSummary;
        if (action === 'click')         actionSummary = `click ${elLabel(parsed.index)}`;
        else if (action === 'fill')     actionSummary = `fill ${elLabel(parsed.index)} → "${parsed.value}"`;
        else if (action === 'scroll')   actionSummary = `scroll ${elLabel(parsed.index)} ${parsed.direction}`;
        else if (action === 'navigate') actionSummary = `navigate ${parsed.url}`;
        else if (action === 'done')     actionSummary = `done`;
        else actionSummary = JSON.stringify(parsed);

        updateStep(`→ ${actionSummary}`);

        if (action === 'done') {
          if (parsed.answer) setAgentMsgs(m => [...m, { role: 'assistant', content: parsed.answer }]);
          break;
        }

        // Map LLM's 1-based position back to real CDP index
        const origIndex = (indexMap && parsed.index != null) ? (indexMap[parsed.index] ?? parsed.index) : parsed.index;

        if (action === 'navigate') {
          chrome.tabs.update(tab.id, { url: parsed.url });
          await waitForPageLoad();
          await reattach();
        } else {
          const urlBefore = await getTabUrl();
          const result = await new Promise(resolve => {
            chrome.runtime.sendMessage({
              type: 'EXECUTE_ACTION_CDP',
              tabId: tab.id, action, index: origIndex,
              value: parsed.value, direction: parsed.direction,
            }, resp => { void chrome.runtime.lastError; resolve(resp ?? { ok: false, error: 'no response' }); });
          });
          if (result && !result.ok) updateStep(`→ ${actionSummary} [failed: ${result.error}]`);

          // After a navigating click, wait for full page load then re-attach CDP
          if (action === 'click') {
            const urlAfter = await getTabUrl();
            if (urlAfter !== urlBefore) {
              await waitForPageLoad();
              await reattach();
            } else {
              await sleep(600); // same-page interaction — small settle delay
            }
          } else {
            await sleep(400);
          }
        }

        // Record what was done so the LLM knows on the next step
        actionHistory.push(actionSummary);

        // Stuck detection — same action repeated twice in a row means the agent is looping
        if (actionHistory.length >= 2 &&
            actionHistory[actionHistory.length - 1] === actionHistory[actionHistory.length - 2]) {
          setAgentMsgs(m => [...m, { role: 'assistant', content: '⚠ Agent stuck — same action repeated. Stopping.', isAgent: true }]);
          break;
        }

        await sleep(300);
      }

      setAgentMsgs(m => [...m, { role: 'assistant', content: '✓ Done', isAgent: true }]);
    } catch (e) {
      if (e.message?.includes('Extension context invalidated')) {
        window.location.reload();
        return;
      }
      if (e.message !== 'Aborted') {
        setAgentMsgs(m => [...m, { role: 'assistant', content: 'Agent error: ' + e.message }]);
      }
    } finally {
      agentAbortRef.current = false;
      chrome.runtime.sendMessage({ type: 'AGENT_STOP', tabId: tab.id }, () => void chrome.runtime.lastError);
      setAgentBusy(false);
    }
  };

  const handleLoad = () => __pc.loadModels();

  const handleIndex = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      const url = tab.url || '';
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setMsgs([{ role: 'assistant', content: "Arkhon can't access this page. Navigate to a regular website and try again." }]);
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' }, (resp) => {
        void chrome.runtime.lastError;
        if (!resp) {
          setMsgs([{ role: 'assistant', content: "Couldn't read this page. Try refreshing the tab, then re-index." }]);
          return;
        }
        if (!resp.text || resp.text.trim().length < 200) {
          setMsgs([{ role: 'assistant', content: "Very little text found on this page — it may be a PDF, a JS-rendered app, or a login wall. Try scrolling to load content, then re-index." }]);
          return;
        }
        setPageInfo({ title: resp.title, url: resp.url });
        setMsgs([]);
        __pc.indexPage(resp.text, resp.url);
      });
    });
  };

  // Helper: update the last assistant message in place
  const updateLastMsg = (content) =>
    setMsgs(m => { const n = [...m]; n[n.length - 1] = { ...n[n.length - 1], content }; return n; });

  const handleFill = () => {
    if (!settings.fillKnowledge?.trim()) {
      setMsgs(m => [...m, { role: 'assistant', content: 'Add your personal info in **Settings → Knowledge base** first, then click Fill.', thinking: '' }]);
      setShowSettings(true);
      return;
    }

    // Show initial status immediately
    setMsgs(m => [...m, { role: 'assistant', content: 'Scanning page for form fields…', thinking: '' }]);
    setBusy(true);

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) { setBusy(false); return; }
      chrome.tabs.sendMessage(tab.id, { type: 'GET_FORM_FIELDS' }, async (resp) => {
        void chrome.runtime.lastError;
        const fields = resp?.fields ?? [];
        if (fields.length === 0) {
          updateLastMsg('No fillable form fields found on this page.');
          setBusy(false);
          return;
        }

        updateLastMsg(`Found **${fields.length}** field${fields.length > 1 ? 's' : ''} — generating values from your knowledge base…`);

        try {
          const fills = await __pc.fillForm(fields, settings.fillKnowledge);
          const count = Object.keys(fills).length;
          if (count === 0) {
            updateLastMsg("Couldn't match any fields to your knowledge base — check your info in Settings.");
          } else {
            updateLastMsg(`Applying fills to **${count}** field${count > 1 ? 's' : ''}…`);
            chrome.tabs.sendMessage(tab.id, { type: 'FILL_FIELDS', fills }, () => void chrome.runtime.lastError);
            const filled = Object.entries(fills).map(([idx, val]) => {
              const f = fields[Number(idx)];
              return `· ${f?.label || f?.placeholder || f?.name || idx}: **${val}**`;
            }).join('\n');
            updateLastMsg(`Filled **${count}** field${count > 1 ? 's' : ''}:\n${filled}`);
          }
        } catch (e) {
          updateLastMsg('Fill error: ' + e.message);
        } finally {
          setBusy(false);
        }
      });
    });
  };

  const handleSummarize = async () => {
    if (busy || !isReady) return;
    setMsgs(m => [...m, { role: 'user', content: 'Summarize this page' }, { role: 'assistant', content: '', thinking: 'Starting…' }]);
    setBusy(true);
    const updateLast = (patch) => setMsgs(m => { const n = [...m]; n[n.length-1] = { ...n[n.length-1], ...patch }; return n; });
    try {
      await __pc.summarize(
        (token) => {
          setMsgs(m => { const n = [...m], last = n[n.length-1]; n[n.length-1] = { ...last, content: last.content + token }; return n; });
        },
        (progress) => { updateLast({ thinking: progress }); },
      );
      setMsgs(m => {
        const last = m[m.length-1];
        if (last?.role === 'assistant' && !last.content.trim()) {
          const n = [...m]; n[n.length-1] = { ...last, content: "Couldn't generate a summary — try again.", thinking: '' }; return n;
        }
        const n = [...m]; n[n.length-1] = { ...last, thinking: '' }; return n;
      });
    } catch (e) {
      updateLast({ content: 'Error: ' + e.message, thinking: '' });
    } finally {
      setBusy(false);
    }
  };

  const handleVideoSummarize = async () => {
    if (busy || !isReady) return;
    setBusy(true);
    setMsgs(m => [...m,
      { role: 'user', content: 'Summarize this video' },
      { role: 'assistant', content: '', thinking: 'Extracting transcript…' },
    ]);
    const updateLast = (patch) => setMsgs(m => { const n = [...m]; n[n.length-1] = { ...n[n.length-1], ...patch }; return n; });
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const result = await Promise.race([
        new Promise(res => chrome.tabs.sendMessage(tab.id, { type: 'GET_TRANSCRIPT' }, res)),
        new Promise(res => setTimeout(() => res(null), 8000)),
      ]);
      if (!result?.text) {
        updateLast({ content: 'No transcript found for this video. It may not have captions enabled.', thinking: '' });
        setBusy(false);
        return;
      }
      updateLast({ thinking: 'Indexing transcript…' });
      await new Promise(res => {
        __pc.indexPage(result.text, tab.url);
        // Wait for indexing to complete
        const unsub = __pc.subscribe(s => { if (s.status === 'ready') { unsub(); res(); } });
      });
      updateLast({ thinking: 'Summarizing…' });
      await __pc.summarize(
        token => setMsgs(m => { const n = [...m], last = n[n.length-1]; n[n.length-1] = { ...last, content: last.content + token }; return n; }),
        progress => updateLast({ thinking: progress }),
      );
      setMsgs(m => { const n = [...m]; n[n.length-1] = { ...n[n.length-1], thinking: '' }; return n; });
    } catch(e) {
      updateLast({ content: 'Error: ' + e.message, thinking: '' });
    } finally {
      setBusy(false);
    }
  };

  const send = async (text) => {
    text = text.trim();
    if (!text || busy || !isReady) return;

    const SUMMARIZE_RE = /\b(summarize|summary|tldr|tl;dr|overview|brief me|give me a summary|what is this( page| article| video| about)?)\b/i;
    if (SUMMARIZE_RE.test(text)) {
      setInput('');
      isYouTubeVideo(pageInfo.url) ? handleVideoSummarize() : handleSummarize();
      return;
    }

    setInput('');

    const MAX_CTX = 20; // keep last 10 turns to stay within model context window
    const rawHistory = [...msgs, { role: 'user', content: text }];
    const history = rawHistory.length > MAX_CTX ? rawHistory.slice(-MAX_CTX) : rawHistory;
    setMsgs([...rawHistory, { role: 'assistant', content: '', thinking: '' }]);
    setBusy(true);

    // Parse <think>…</think> out of the raw token stream
    let _inThink = false, _buf = '';
    const parseThinkToken = (token) => {
      _buf += token;
      let thinkDelta = '', contentDelta = '';
      while (_buf.length > 0) {
        if (!_inThink) {
          const s = _buf.indexOf('<think>');
          if (s === -1) { const safe = Math.max(0, _buf.length - 6); contentDelta += _buf.slice(0, safe); _buf = _buf.slice(safe); break; }
          contentDelta += _buf.slice(0, s); _buf = _buf.slice(s + 7); _inThink = true;
        } else {
          const e = _buf.indexOf('</think>');
          if (e === -1) { const safe = Math.max(0, _buf.length - 7); thinkDelta += _buf.slice(0, safe); _buf = _buf.slice(safe); break; }
          thinkDelta += _buf.slice(0, e); _buf = _buf.slice(e + 8); _inThink = false;
        }
      }
      return { thinkDelta, contentDelta };
    };

    try {
      await __pc.chat(history, (token) => {
        const { thinkDelta, contentDelta } = parseThinkToken(token);
        if (thinkDelta || contentDelta) {
          setMsgs(m => {
            const n = [...m], last = n[n.length - 1];
            n[n.length - 1] = { ...last, thinking: (last.thinking || '') + thinkDelta, content: last.content + contentDelta };
            return n;
          });
        }
      }, {
        customPrompt: settings.systemPrompt || null,
        maxTokens:    STYLE_TOKENS[settings.responseStyle] ?? 400,
        k:            settings.chunkK,
      });
      // Flush any remaining buffer (held back waiting for a <think> tag that never came)
      if (_buf) {
        setMsgs(m => {
          const n = [...m], last = n[n.length - 1];
          n[n.length - 1] = { ...last, content: last.content + _buf };
          return n;
        });
      }
      setMsgs(m => {
        const last = m[m.length-1];
        if (last?.role === 'assistant' && !last.content.trim()) {
          const n = [...m]; n[n.length-1] = { role: 'assistant', content: "Couldn't generate a response — try again." }; return n;
        }
        return m;
      });
    } catch (e) {
      const msg = e.message?.includes('not indexed')
        ? 'This page hasn\'t been indexed yet. Wait a moment for auto-indexing, or open Settings and check the page.'
        : 'Error: ' + e.message;
      setMsgs(m => { const n = [...m]; n[n.length-1] = { role: 'assistant', content: msg }; return n; });
    } finally {
      setBusy(false);
    }
  };

  const hostname = pageInfo.url ? (() => { try { return new URL(pageInfo.url).hostname; } catch { return ''; } })() : '';

  return h('div', { className: 'app' },

    // Header
    h('div', { className: 'hd' },
      h('div', { className: 'hd-l' },
        Ic.dot(isReady),
        h('span', { className: 'hd-title' }, 'Arkhon AI'),
      ),
      h('div', { className: 'hd-l', style: { gap: '8px' } },
        h('div', { className: 'mode-toggle' },
          h('button', {
            className: !IS_SIDEBAR ? 'active' : '',
            onClick: () => {
              if (IS_SIDEBAR) {
                // Switch back to chat — reinject FAB, clear flag, close this panel
                chrome.runtime.sendMessage({ type: 'RESTORE_CHAT' }).catch(() => {});
                window.close();
              }
            },
          }, 'Chat'),
          h('button', {
            className: IS_SIDEBAR ? 'active' : '',
            onClick: () => {
              if (!IS_SIDEBAR) {
                // Switch to agent — open sidebar, remove FAB
                chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }).catch(() => {});
              }
            },
          }, 'Agent'),
        ),
        msgs.length > 0 && !busy && !agentBusy && h('button', {
          className: 'btn-ghost btn-sm',
          onClick: () => { setMsgs([]); setAgentMsgs([]); setSuggestions([]); },
          title: 'Clear chat',
        }, Ic.trash()),
        h('button', {
          className: 'btn-ghost btn-sm' + (showSettings ? ' active' : ''),
          onClick: () => setShowSettings(s => !s),
          title: 'Settings',
        }, Ic.gear()),
      ),
    ),

    // Page pill
    !showSettings && pageInfo.url && h('div', { className: 'page-pill', title: pageInfo.url },
      h('span', { className: 'page-domain' }, hostname),
      h('span', { className: 'page-title' }, pageInfo.title),
    ),

    // Settings panel (replaces main area)
    showSettings && h('div', { className: 'msgs' },
      h(SettingsPanel, { settings, onChange: setSettings, knowledgeStatus, useEmbed, modelLoaded }),
    ),

    // ── Main states (hidden when settings open) ──
    !showSettings && status === 'error' && h('div', { className: 'setup' },
      h('div', { className: 'setup-icon' }, '⬡'),
      h('p', { className: 'setup-msg' }, 'Something went wrong loading the model.'),
      h('button', { className: 'btn-primary', onClick: handleLoad }, 'Retry ', Ic.index()),
    ),

    !showSettings && (isLoading || status === 'idle') && status !== 'indexing' && h('div', { className: 'setup' },
      h('p', { className: 'setup-msg' }, statusLabel(status, progress, reconnecting)),
      h(ProgressBar, { progress, pulse: status === 'idle' }),
      h('p', { className: 'setup-sub' }, reconnecting
        ? 'Model tab was closed — reloading in background…'
        : 'Cached after this — instant on next open.'),
    ),

    !showSettings && status === 'ready-no-index' && useEmbed && h('div', { className: 'setup' },
      h('div', { className: 'setup-icon' }, '◎'),
      h('p', { className: 'setup-msg' }, 'Models loaded. Index the current page to start chatting.'),
      h('button', { className: 'btn-primary', onClick: handleIndex }, Ic.index(), ' Index this page'),
    ),

    !showSettings && status === 'indexing' && h('div', { className: 'setup' },
      h('p', { className: 'setup-msg' }, 'Embedding page chunks…'),
      h(ProgressBar, { progress, pulse: false }),
      h('p', { className: 'setup-sub' }, __pc.chunkCount + ' chunks indexed so far'),
    ),

    !showSettings && (isReady || (modelLoaded && msgs.length > 0)) && h(React.Fragment, null,
      h('div', { className: 'msgs' },
        msgs.length === 0 && h(React.Fragment, null,
          h('div', { className: 'empty-hint' }, 'Ask anything about this page.'),
          settings.showSuggestions && suggestions.length > 0 && h('div', { className: 'suggestions' },
            suggestions.map((q, i) =>
              h('button', { key: i, className: 'suggestion-chip', onClick: () => send(q) }, q)
            ),
          ),
          settings.showSuggestions && suggestions.length === 0 && isReady && h('div', { className: 'suggestions-loading' }, '…'),
        ),
        (agentBusy ? agentMsgs : msgs).map((m, i) =>
          m.role === 'user'
            ? h('div', { key: i, className: 'msg msg-user' }, m.content)
            : m.isAgent
            ? h('div', { key: i, className: 'msg msg-agent' }, m.content)
            : h('div', { key: i, className: 'msg msg-ai' },
                m.thinking && h('details', { className: 'think-wrap', open: i === msgs.length - 1 && busy },
                  h('summary', { className: 'think-summary' }, 'Thinking'),
                  h('div', { className: 'think-body' }, m.thinking),
                ),
                ...renderMd(m.content),
                i === msgs.length - 1 && busy && h('span', { className: 'cur' }, '▌'),
              )
        ),
        h('div', { ref: bottomRef }),
      ),
      h('div', { className: 'input-row' },
        h('input', {
          className: 'input',
          value: input,
          onChange: e => setInput(e.target.value),
          onKeyDown: e => e.key === 'Enter' && !agentBusy && !busy && (IS_SIDEBAR ? runAgent(input) : send(input)),
          placeholder: agentBusy ? 'Agent running…' : IS_SIDEBAR ? 'What should the agent do?' : 'Ask about this page…',
          disabled: busy || agentBusy,
          autoFocus: true,
        }),
        isReady && !busy && !agentBusy && isYouTubeVideo(pageInfo.url)
          ? h('button', {
              className: 'btn-ghost btn-sm',
              onClick: handleVideoSummarize,
              title: 'Summarize this video',
              style: { flexShrink: 0 },
            }, '▶ Summarize')
          : isReady && !busy && !agentBusy && h('button', {
              className: 'btn-ghost btn-sm',
              onClick: handleSummarize,
              title: 'Summarize this page',
              style: { flexShrink: 0 },
            }, Ic.summarize()),
        busy || agentBusy
          ? h('button', {
              className: 'btn-stop',
              title: 'Stop',
              onClick: () => {
                agentAbortRef.current = true;
                __pc.abort();
                setBusy(false);
                setAgentBusy(false);
              },
            }, Ic.stop())
          : h('button', {
              className: 'btn-send',
              onClick: () => IS_SIDEBAR ? runAgent(input) : send(input),
              disabled: !input.trim(),
              title: IS_SIDEBAR ? 'Run agent' : 'Send',
            }, IS_SIDEBAR ? '⚡' : Ic.send()),
      ),
    ),

  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App, null));
