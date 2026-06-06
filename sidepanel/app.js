const { useState, useEffect, useRef, createElement: h } = React;

// ── Default settings ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  systemPrompt:    '',           // empty = use built-in default
  responseStyle:   'balanced',   // concise | balanced | detailed
  chunkK:          3,            // chunks to retrieve (2–6)
  autoIndex:       true,         // auto-index on load in BM25 mode
  showSuggestions: true,         // generate 3 starter questions after indexing
  fillKnowledge:   '',           // personal info used for form autofill
};
// Qwen3 thinking uses ~300-600 tokens internally (stripped from display by the filter).
// These budgets include that overhead so the visible response isn't starved.
const STYLE_TOKENS = { concise: 600, balanced: 1000, detailed: 1800 };

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
  let _stopped           = false;

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
      return new Promise((resolve, reject) => {
        _stopped = false;
        _chatCbs = { onToken, resolve, reject };
        chrome.runtime.sendMessage({ type: 'PC_CMD_CHAT', messages, tabId: _myTabId, opts }).catch(err => {
          _chatCbs = null;
          reject(err);
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

    /** Stop the current streaming response immediately. */
    stop() {
      if (!_chatCbs) return;
      _stopped = true;
      _chatCbs.resolve();
      _chatCbs = null;
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
  dot: (live) => h('span', {
    className: 'led' + (live ? ' pulse' : ''),
    style: { '--c': live ? 'var(--green)' : 'var(--muted)' },
  }),
};

// ── Status label ─────────────────────────────────────────────────────────────
function statusLabel(status, progress) {
  switch (status) {
    case 'idle':           return 'Loading models…';
    case 'loading-embed':  return `Downloading embed model… ${progress}%`;
    case 'loading-chat':   return `Downloading chat model… ${progress}%`;
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
function SettingsPanel({ settings, onChange, knowledgeStatus }) {
  const set = (key, val) => {
    const next = { ...settings, [key]: val };
    onChange(next);
    chrome.storage.sync.set(next);
  };

  return h('div', { className: 'settings' },
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
function App() {
  const [state, setState]       = useState({ status: 'idle', progress: 0, useEmbed: false });
  const [pageInfo, setPageInfo] = useState({ title: '', url: '' });
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [suggestions, setSuggestions]         = useState([]);
  const [knowledgeStatus, setKnowledgeStatus] = useState('idle'); // idle | indexing | ready
  const bottomRef   = useRef(null);
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const { status, progress, useEmbed } = state;
  const isReady   = status === 'ready';
  const isLoading = ['loading-embed', 'loading-chat', 'indexing'].includes(status);

  // Load persisted settings
  useEffect(() => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, stored => setSettings(stored));
  }, []);

  // Bootstrap: get state from background cache, subscribe to future state changes
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'PC_CMD_STATE' }, cached => {
      void chrome.runtime.lastError;
      if (cached) {
        setState({ status: cached.status, progress: cached.progress, useEmbed: cached.useEmbed });
        // If offscreen was idle or unknown, trigger load (no-op if already running)
        if (cached.status === 'idle') __pc.loadModels();
      } else {
        __pc.loadModels();
      }
    });
    return __pc.subscribe(s => setState({ status: s.status, progress: s.progress, useEmbed: s.useEmbed }));
  }, []);

  // Tab change listener — update page pill and re-index / restore cache
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) setPageInfo({ title: tab.title || '', url: tab.url || '' });
    });

    let debounce = null;
    const handleTabChange = (tab) => {
      if (!tab) return;
      const url   = tab.url || '';
      const title = tab.title || '';
      setPageInfo({ title, url });
      if (!url.startsWith('http://') && !url.startsWith('https://')) return;
      const s = __pc.status;
      if (s === 'idle' || s === 'loading-embed' || s === 'loading-chat') return;

      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        setSuggestions([]);
        setMsgs([]);
        const hit = await __pc.restoreFromCache(url);
        if (!hit) {
          handleIndex();
        } else if (settingsRef.current.showSuggestions) {
          __pc.suggestQuestions().then(qs => setSuggestions(qs)).catch(() => {});
        }
      }, 400);
    };

    const handler = (msg) => {
      if (msg.type === 'TAB_CHANGED' || msg.type === 'TAB_UPDATED') {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => handleTabChange(tab));
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => { chrome.runtime.onMessage.removeListener(handler); clearTimeout(debounce); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

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

  // Auto-index knowledge base when it changes and model is ready
  useEffect(() => {
    if (!settings.fillKnowledge?.trim() || !isReady) return;
    setKnowledgeStatus('indexing');
    const t = setTimeout(() => {
      __pc.indexKnowledge(settings.fillKnowledge)
        .then(() => setKnowledgeStatus('ready'));
    }, 800);
    return () => clearTimeout(t);
  }, [settings.fillKnowledge, isReady]);

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

  const handleLoad = () => __pc.loadModels();

  const handleIndex = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      const url = tab.url || '';
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setMsgs([{ role: 'assistant', content: "PageChat can't access this page. Navigate to a regular website and try again." }]);
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

  const handleFill = () => {
    if (!settings.fillKnowledge?.trim()) {
      setMsgs(m => [...m, { role: 'assistant', content: 'Add your personal info in **Settings → Knowledge base** first, then click Fill.', thinking: '' }]);
      setShowSettings(true);
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { type: 'GET_FORM_FIELDS' }, async (resp) => {
        void chrome.runtime.lastError;
        const fields = resp?.fields ?? [];
        if (fields.length === 0) {
          setMsgs(m => [...m, { role: 'assistant', content: 'No fillable form fields found on this page.', thinking: '' }]);
          return;
        }
        setBusy(true);
        try {
          const fills = await __pc.fillForm(fields, settings.fillKnowledge);
          const count = Object.keys(fills).length;
          if (count === 0) {
            setMsgs(m => [...m, { role: 'assistant', content: "Couldn't match any fields to your knowledge base — check your info in Settings.", thinking: '' }]);
          } else {
            chrome.tabs.sendMessage(tab.id, { type: 'FILL_FIELDS', fills }, () => void chrome.runtime.lastError);
            const filled = Object.entries(fills).map(([idx, val]) => {
              const f = fields[Number(idx)];
              return `· ${f?.label || f?.placeholder || f?.name || idx}: **${val}**`;
            }).join('\n');
            setMsgs(m => [...m, { role: 'assistant', content: `Filled **${count}** field${count > 1 ? 's' : ''}:\n${filled}`, thinking: '' }]);
          }
        } catch (e) {
          setMsgs(m => [...m, { role: 'assistant', content: 'Fill error: ' + e.message, thinking: '' }]);
        } finally {
          setBusy(false);
        }
      });
    });
  };

  const send = async (text) => {
    text = text.trim();
    if (!text || busy || !isReady) return;
    setInput('');

    const history = [...msgs, { role: 'user', content: text }];
    setMsgs([...history, { role: 'assistant', content: '', thinking: '' }]);
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
      setMsgs(m => {
        const last = m[m.length-1];
        if (last?.role === 'assistant' && !last.content.trim()) {
          const n = [...m]; n[n.length-1] = { role: 'assistant', content: "Couldn't generate a response — try again." }; return n;
        }
        return m;
      });
    } catch (e) {
      setMsgs(m => { const n = [...m]; n[n.length-1] = { role: 'assistant', content: 'Error: ' + e.message }; return n; });
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
        h('span', { className: 'hd-title' }, 'PageChat'),
        h('span', { className: 'hd-sub' }, 'on-device RAG'),
      ),
      h('div', { className: 'hd-l', style: { gap: '6px' } },
        isReady && h('button', { className: 'btn-ghost btn-sm', onClick: handleIndex, title: 'Re-index current page' },
          Ic.index(), ' re-index',
        ),
        isReady && h('button', { className: 'btn-ghost btn-sm', onClick: handleFill, title: 'Fill form fields on this page' },
          Ic.fill(), ' fill',
        ),
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
      h(SettingsPanel, { settings, onChange: setSettings, knowledgeStatus }),
    ),

    // ── Main states (hidden when settings open) ──
    !showSettings && status === 'error' && h('div', { className: 'setup' },
      h('div', { className: 'setup-icon' }, '⬡'),
      h('p', { className: 'setup-msg' }, 'Something went wrong loading the model.'),
      h('button', { className: 'btn-primary', onClick: handleLoad }, 'Retry ', Ic.index()),
    ),

    !showSettings && isLoading && status !== 'indexing' && h('div', { className: 'setup' },
      h('p', { className: 'setup-msg' }, statusLabel(status, progress)),
      h(ProgressBar, { progress, pulse: false }),
      h('p', { className: 'setup-sub' }, 'Cached after this — instant on next open.'),
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

    !showSettings && isReady && h(React.Fragment, null,
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
        msgs.map((m, i) =>
          m.role === 'user'
            ? h('div', { key: i, className: 'msg msg-user' }, m.content)
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
          onKeyDown: e => e.key === 'Enter' && send(input),
          placeholder: 'Ask about this page…',
          disabled: busy,
          autoFocus: true,
        }),
        busy
          ? h('button', { className: 'btn-stop', onClick: () => __pc.stop(), title: 'Stop generating' }, Ic.stop())
          : h('button', { className: 'btn-send', onClick: () => send(input), disabled: !input.trim() }, Ic.send()),
      ),
    ),

    // Footer
    h('div', { className: 'footer' },
      '⊗ 0 bytes egress · ' + __pc.chunkCount + ' chunks · ' + __pc.cachedPages + ' pages cached',
    ),
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App, null));
