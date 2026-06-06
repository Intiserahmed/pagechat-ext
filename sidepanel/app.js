const { useState, useEffect, useRef, createElement: h } = React;

// ── Default settings ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  systemPrompt:  '',           // empty = use built-in default
  responseStyle: 'balanced',   // concise | balanced | detailed
  chunkK:        3,            // chunks to retrieve (2–6)
  autoIndex:     true,         // auto-index on load in BM25 mode
};
const STYLE_TOKENS = { concise: 150, balanced: 400, detailed: 800 };

// ── Icons ───────────────────────────────────────────────────────────────────
const Ic = {
  send: () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    h('path', { d: 'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z' })),
  index: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' },
    h('path', { d: 'M12 3v12m0 0l-4-4m4 4l4-4M5 21h14' })),
  gear: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' },
    h('circle', { cx: 12, cy: 12, r: 3 }),
    h('path', { d: 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' })),
  dot: (live) => h('span', {
    className: 'led' + (live ? ' pulse' : ''),
    style: { '--c': live ? 'var(--green)' : 'var(--muted)' },
  }),
};

// ── Status label ────────────────────────────────────────────────────────────
function statusLabel(status, progress) {
  switch (status) {
    case 'idle':           return 'Click "Load models" to start';
    case 'loading-embed':  return `Downloading embed model… ${progress}%`;
    case 'loading-chat':   return `Downloading chat model… ${progress}%`;
    case 'indexing':       return `Indexing page… ${progress}%`;
    case 'ready-no-index': return 'Models ready — index the current page';
    case 'ready':          return 'Ready';
    case 'error':          return 'Error — check console';
    default:               return status;
  }
}

// ── Progress bar ────────────────────────────────────────────────────────────
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

// ── Settings panel ──────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange }) {
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
  );
}

// ── Main app ────────────────────────────────────────────────────────────────
function App() {
  const [state, setState]       = useState({ status: 'idle', progress: 0, useEmbed: false });
  const [pageInfo, setPageInfo] = useState({ title: '', url: '' });
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);

  const { status, progress, useEmbed } = state;
  const isReady   = status === 'ready';
  const isLoading = ['loading-embed', 'loading-chat', 'indexing'].includes(status);
  const canToggle = status === 'idle' || status === 'error';

  // Load settings from storage
  useEffect(() => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, stored => setSettings(stored));
  }, []);

  useEffect(() => {
    const pc = window.__pagechat;
    if (!pc) return;
    setState({ status: pc.status, progress: pc.progress, useEmbed: pc.useEmbed });
    return pc.subscribe(s => setState({ ...s }));
  }, []);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) setPageInfo({ title: tab.title || '', url: tab.url || '' });
    });
    const handler = (msg) => {
      if (msg.type === 'TAB_CHANGED' || msg.type === 'TAB_UPDATED') {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          if (tab) setPageInfo({ title: tab.title || '', url: tab.url || '' });
        });
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Generate suggested questions once page is indexed
  useEffect(() => {
    if (status === 'ready' && msgs.length === 0) {
      setSuggestions([]);
      window.__pagechat?.suggestQuestions()
        .then(qs => setSuggestions(qs))
        .catch(() => {});
    }
  }, [status]);

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

  const handleLoad = () => window.__pagechat?.loadModels();

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
        setPageInfo({ title: resp.title, url: resp.url });
        setMsgs([]);
        window.__pagechat.indexPage(resp.text).catch(console.error);
      });
    });
  };

  const send = async (text) => {
    text = text.trim();
    if (!text || busy || !isReady) return;
    setInput('');
    const history = [...msgs, { role: 'user', content: text }];
    setMsgs([...history, { role: 'assistant', content: '' }]);
    setBusy(true);
    try {
      await window.__pagechat.chat(history, (token) => {
        setMsgs(m => { const n = [...m]; n[n.length-1] = { role:'assistant', content: n[n.length-1].content + token }; return n; });
      }, {
        customPrompt: settings.systemPrompt || null,
        maxTokens:    STYLE_TOKENS[settings.responseStyle] ?? 400,
        k:            settings.chunkK,
      });
      setMsgs(m => {
        const last = m[m.length-1];
        if (last?.role === 'assistant' && !last.content.trim()) {
          const n = [...m]; n[n.length-1] = { role:'assistant', content:"Couldn't generate a response — try again." }; return n;
        }
        return m;
      });
    } catch(e) {
      setMsgs(m => { const n=[...m]; n[n.length-1]={ role:'assistant', content:'Error: '+e.message }; return n; });
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
      h(SettingsPanel, { settings, onChange: setSettings }),
    ),

    // ── Main states (hidden when settings open) ──
    !showSettings && (status === 'idle' || status === 'error') && h('div', { className: 'setup' },
      h('div', { className: 'setup-icon' }, '⬡'),
      h('p', { className: 'setup-msg' }, status === 'error' ? 'Something went wrong.' : 'Local LLM — no data leaves your device.'),
      h('p', { className: 'setup-sub' }, useEmbed ? 'Downloads chat (~400MB) + embed (~80MB) models.' : 'Downloads chat model (~400MB). BM25 keyword retrieval.'),
      h('label', { className: 'embed-toggle' },
        h('input', {
          type: 'checkbox', checked: useEmbed, disabled: !canToggle,
          onChange: e => window.__pagechat?.setUseEmbed(e.target.checked),
        }),
        h('span', null, 'AI embeddings (+80MB, semantic search)'),
      ),
      h('button', { className: 'btn-primary', onClick: handleLoad },
        status === 'error' ? 'Retry' : 'Load models', ' ', Ic.index(),
      ),
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
      h('p', { className: 'setup-sub' }, (window.__pagechat?.chunkCount || 0) + ' chunks indexed so far'),
    ),

    !showSettings && isReady && h(React.Fragment, null,
      h('div', { className: 'msgs' },
        msgs.length === 0 && h(React.Fragment, null,
          h('div', { className: 'empty-hint' }, 'Ask anything about this page.'),
          suggestions.length > 0 && h('div', { className: 'suggestions' },
            suggestions.map((q, i) =>
              h('button', { key: i, className: 'suggestion-chip', onClick: () => send(q) }, q)
            ),
          ),
          suggestions.length === 0 && isReady && h('div', { className: 'suggestions-loading' }, '…'),
        ),
        msgs.map((m, i) =>
          h('div', { key: i, className: 'msg msg-' + (m.role === 'user' ? 'user' : 'ai') },
            m.content,
            m.role === 'assistant' && i === msgs.length-1 && busy && h('span', { className: 'cur' }, '▌'),
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
        h('button', { className: 'btn-send', onClick: () => send(input), disabled: busy || !input.trim() },
          Ic.send(),
        ),
      ),
    ),

    // Footer
    h('div', { className: 'footer' },
      '⊗ 0 bytes egress · runs locally · ' + (window.__pagechat?.chunkCount || 0) + ' chunks indexed',
    ),
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App, null));
