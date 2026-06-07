// background.js — Service worker: owns the host tab and routes messages.

let _hostTabId          = null;
let _pendingReturnTabId = null;   // tab to restore focus to after model loads
let _ensurePromise      = null;   // deduplicates concurrent ensureModelHost calls
let _cachedState = { status: 'idle', progress: 0, useEmbed: false, chunkCount: 0, cachedPages: 0 };

// ── Persistent port to sidepanel ──────────────────────────────────────────────
// chrome.runtime.sendMessage has no delivery guarantee to sidepanels.
// A persistent port established by the sidepanel on open is reliable.
let _sidepanelPort = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'sidepanel') return;
  _sidepanelPort = port;
  port.onDisconnect.addListener(() => { _sidepanelPort = null; });
});

function notifySidepanel(msg) {
  if (_sidepanelPort) _sidepanelPort.postMessage(msg);
}

async function ensureModelHost() {
  // If already in progress, wait for the same promise — prevents multiple tabs on concurrent calls
  if (_ensurePromise) return _ensurePromise;
  _ensurePromise = _doEnsureModelHost().finally(() => { _ensurePromise = null; });
  return _ensurePromise;
}

async function _doEnsureModelHost() {
  // SW may have been killed and restarted — restore persisted tab ID first
  if (_hostTabId === null) {
    const stored = await chrome.storage.session.get('hostTabId');
    if (stored.hostTabId) _hostTabId = stored.hostTabId;
  }

  // Verify the tab is still alive
  if (_hostTabId !== null) {
    try { await chrome.tabs.get(_hostTabId); return; }
    catch {
      _hostTabId = null;
      chrome.storage.session.remove('hostTabId');
    }
  }

  // Remember which tab the user is on so we can return to it after model loads
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  _pendingReturnTabId = activeTab?.id ?? null;

  // Open active so Chrome grants a real WebGPU context — we switch back once the model is ready
  const tab = await chrome.tabs.create({
    url:    chrome.runtime.getURL('model-host.html'),
    active: true,
    pinned: true,
  });
  _hostTabId = tab.id;
  chrome.storage.session.set({ hostTabId: tab.id });
}

// When the host tab is closed, clear state so next command recreates it
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === _hostTabId) {
    _hostTabId   = null;
    _cachedState = { status: 'idle', progress: 0, useEmbed: false, chunkCount: 0, cachedPages: 0 };
    chrome.storage.session.remove('hostTabId');
  }
});

// ── Tab tracking — notify sidepanel via port ──────────────────────────────────
chrome.tabs.onActivated.addListener(({ tabId }) => {
  if (tabId === _hostTabId) return;
  notifySidepanel({ type: 'TAB_CHANGED' });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === _hostTabId) return;
  if (changeInfo.status === 'complete' && tab.url) {
    notifySidepanel({ type: 'TAB_UPDATED', url: tab.url });
  }
});

// ── Message handling ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  // Content script relay: YouTube SPA navigation — push to sidepanel via port
  if (msg.type === 'YT_NAVIGATE') {
    notifySidepanel({ type: 'TAB_UPDATED', url: msg.url });
    return;
  }

  // Cache state broadcasts from the host tab
  if (msg.type === 'PC_STATE') {
    _cachedState = {
      status:      msg.status,
      progress:    msg.progress,
      useEmbed:    msg.useEmbed,
      chunkCount:  msg.chunkCount,
      cachedPages: msg.cachedPages,
    };
    // Model finished loading — return focus to the user's original tab
    if (msg.status === 'ready-no-index' && _pendingReturnTabId !== null) {
      chrome.tabs.update(_pendingReturnTabId, { active: true }).catch(() => {});
      _pendingReturnTabId = null;
    }
    return;
  }

  // Sidepanel asking for current state on open
  if (msg.type === 'PC_CMD_STATE') {
    sendResponse(_cachedState);
    return true;
  }

  // Any command — ensure the host tab is alive (lazy creation)
  // PC_CMD_RESTORE response comes from the host tab's own listener; don't interfere.
  if (msg.type?.startsWith('PC_CMD_')) {
    ensureModelHost().catch(console.error);
  }
});
