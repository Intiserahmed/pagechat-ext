const { useState, useEffect, useRef, createElement: h } = React;

// ── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  send: () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
    h('path', { d: 'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z' })),
  index: () => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' },
    h('path', { d: 'M12 3v12m0 0l-4-4m4 4l4-4M5 21h14' })),
  dot: (live) => h('span', {
    className: 'led' + (live ? ' pulse' : ''),
    style: { '--c': live ? 'var(--green)' : 'var(--muted)' },
  }),
};

// ── Status label ───────────────────────────────────────────────────────────
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

// ── Progress bar ───────────────────────────────────────────────────────────
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

// ── Main app ───────────────────────────────────────────────────────────────
function App() {
  const [state, setState]       = useState({ status: 'idle', progress: 0, useEmbed: false });
  const [pageInfo, setPageInfo] = useState({ title: '', url: '' });
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState('');
  const [busy, setBusy]         = useState(false);
  const bottomRef = useRef(null);

  const { status, progress, useEmbed } = state;
  const isReady   = status === 'ready';
  const isLoading = ['loading-embed', 'loading-chat', 'indexing'].includes(status);
  const canToggle = status === 'idle' || status === 'error';

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

  const handleLoad = () => window.__pagechat?.loadModels();

  const handleIndex = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_CONTENT' }, (resp) => {
        if (!resp) { alert('Could not read page. Try refreshing.'); return; }
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
        setMsgs(m => { const n = [...m]; n[n.length - 1] = { role: 'assistant', content: n[n.length - 1].content + token }; return n; });
      });
      setMsgs(m => {
        const last = m[m.length - 1];
        if (last?.role === 'assistant' && !last.content.trim()) {
          const n = [...m]; n[n.length - 1] = { role: 'assistant', content: "Couldn't generate a response — try again." }; return n;
        }
        return m;
      });
    } catch (e) {
      setMsgs(m => { const n = [...m]; n[n.length - 1] = { role: 'assistant', content: 'Error: ' + e.message }; return n; });
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
      isReady && h('button', { className: 'btn-ghost btn-sm', onClick: handleIndex, title: 'Re-index current page' },
        Ic.index(), ' re-index',
      ),
    ),

    // Page pill
    pageInfo.url && h('div', { className: 'page-pill', title: pageInfo.url },
      h('span', { className: 'page-domain' }, hostname),
      h('span', { className: 'page-title' }, pageInfo.title),
    ),

    // Idle / error
    (status === 'idle' || status === 'error') && h('div', { className: 'setup' },
      h('div', { className: 'setup-icon' }, '⬡'),
      h('p', { className: 'setup-msg' }, status === 'error' ? 'Something went wrong.' : 'Local LLM — no data leaves your device.'),
      h('p', { className: 'setup-sub' }, useEmbed ? 'Downloads chat (~400MB) + embed (~80MB) models.' : 'Downloads chat model (~400MB). BM25 keyword retrieval.'),
      h('label', { className: 'embed-toggle' },
        h('input', {
          type: 'checkbox',
          checked: useEmbed,
          disabled: !canToggle,
          onChange: e => window.__pagechat?.setUseEmbed(e.target.checked),
        }),
        h('span', null, 'AI embeddings (+80MB, semantic search)'),
      ),
      h('button', { className: 'btn-primary', onClick: handleLoad },
        status === 'error' ? 'Retry' : 'Load models', ' ', Ic.index(),
      ),
    ),

    // Loading
    isLoading && status !== 'indexing' && h('div', { className: 'setup' },
      h('p', { className: 'setup-msg' }, statusLabel(status, progress)),
      h(ProgressBar, { progress, pulse: false }),
      h('p', { className: 'setup-sub' }, 'Cached after this — instant on next open.'),
    ),

    // Ready no index
    status === 'ready-no-index' && h('div', { className: 'setup' },
      h('div', { className: 'setup-icon' }, '◎'),
      h('p', { className: 'setup-msg' }, 'Models loaded. Index the current page to start chatting.'),
      h('button', { className: 'btn-primary', onClick: handleIndex },
        Ic.index(), ' Index this page',
      ),
    ),

    // Indexing
    status === 'indexing' && h('div', { className: 'setup' },
      h('p', { className: 'setup-msg' }, 'Embedding page chunks…'),
      h(ProgressBar, { progress, pulse: false }),
      h('p', { className: 'setup-sub' }, (window.__pagechat?.chunkCount || 0) + ' chunks indexed so far'),
    ),

    // Chat
    isReady && h(React.Fragment, null,
      h('div', { className: 'msgs' },
        msgs.length === 0 && h('div', { className: 'empty-hint' }, 'Ask anything about this page.'),
        msgs.map((m, i) =>
          h('div', { key: i, className: 'msg msg-' + (m.role === 'user' ? 'user' : 'ai') },
            m.content,
            m.role === 'assistant' && i === msgs.length - 1 && busy && h('span', { className: 'cur' }, '▌'),
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
