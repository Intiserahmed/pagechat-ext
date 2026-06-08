// background.js — Service worker: owns the host tab and routes messages.

let _hostTabId          = null;
let _pendingReturnTabId = null;   // tab to restore focus to after model loads
let _ensurePromise      = null;   // deduplicates concurrent ensureModelHost calls
let _cachedState = { status: 'idle', progress: 0, useEmbed: false, chunkCount: 0, cachedPages: 0 };
let _reconnecting       = false;  // true when recreating after tab was closed — skip focus steal

// CDP state (agent loop)
let _cdpTabId   = null;
let _cdpNodeMap = {};  // element index → backendDOMNodeId

// ── Persistent port to sidepanel ──────────────────────────────────────────────
// chrome.runtime.sendMessage has no delivery guarantee to sidepanels.
// A persistent port established by the sidepanel on open is reliable.
let _sidepanelPort = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'sidepanel') return;
  _sidepanelPort = port;
  port.onDisconnect.addListener(() => {
    _sidepanelPort = null;
    // Side panel closed — clear flag so FAB reappears on next page load
    chrome.storage.session.remove('sidebarOpen');
  });
});

function notifySidepanel(msg) {
  if (!_sidepanelPort) return;
  try { _sidepanelPort.postMessage(msg); }
  catch { _sidepanelPort = null; } // port moved to bfcache or otherwise dead
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

  // Open active so Chrome grants a real WebGPU context — we switch back once the model is ready.
  // On reconnect (tab was dismissed), open in background to avoid stealing focus.
  const needsFocus = !_reconnecting;
  _reconnecting = false;

  // Only track return tab on first load — reconnect opens inactive so no focus to restore
  if (needsFocus) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    _pendingReturnTabId = activeTab?.id ?? null;
  }
  const tab = await chrome.tabs.create({
    url:    chrome.runtime.getURL('model-host.html'),
    active: needsFocus,
    pinned: true,
  });
  _hostTabId = tab.id;
  chrome.storage.session.set({ hostTabId: tab.id });
}

// When the host tab is closed, auto-recreate it immediately so model stays warm
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === _hostTabId) {
    _hostTabId   = null;
    _cachedState = { status: 'idle', progress: 0, useEmbed: false, chunkCount: 0, cachedPages: 0 };
    chrome.storage.session.remove('hostTabId');
    // Notify sidepanel so it can show reconnecting state
    notifySidepanel({ type: 'PC_STATE', ..._cachedState });
    // Auto-recreate immediately so model stays warm, but don't steal focus
    _reconnecting = true;
    ensureModelHost().catch(console.error);
  }
  if (tabId === _cdpTabId) {
    _cdpTabId  = null;
    _cdpNodeMap = {};
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
    // If sidebar is open, suppress FAB on newly loaded page
    chrome.storage.session.get('sidebarOpen', ({ sidebarOpen }) => {
      if (sidebarOpen) chrome.tabs.sendMessage(tabId, { type: 'HIDE_FAB' }).catch(() => {});
    });
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

  // Ensure host tab alive for commands that actually need the model.
  // PC_CMD_STATE_REQ and PC_CMD_RESTORE don't need a live model tab.
  const NEEDS_HOST = new Set([
    'PC_CMD_LOAD', 'PC_CMD_INDEX', 'PC_CMD_CHAT', 'PC_CMD_SUMMARIZE',
    'PC_CMD_SUGGEST', 'PC_CMD_FILL', 'PC_CMD_EMBED_FILTER',
    'PC_CMD_AGENT_STEP', 'PC_CMD_REMAINING_GOAL', 'PC_CMD_INDEX_KNOWLEDGE',
  ]);
  if (NEEDS_HOST.has(msg.type)) {
    ensureModelHost().catch(console.error);
  }
});

// ── CDP (chrome.debugger) — agent loop: AX tree + reliable click/type ────────
function cdpSend(tabId, method, params = {}, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), timeoutMs);
    chrome.debugger.sendCommand({ tabId }, method, params, result => {
      clearTimeout(timer);
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve(result);
    });
  });
}

async function cdpAttach(tabId) {
  if (_cdpTabId === tabId) return;
  if (_cdpTabId !== null) {
    chrome.debugger.detach({ tabId: _cdpTabId }).catch(() => {});
    _cdpTabId = null;
    _cdpNodeMap = {};
  }
  // Detach any stale session on this tab (e.g. from a previous SW lifetime)
  await new Promise(r => chrome.debugger.detach({ tabId }, () => { void chrome.runtime.lastError; r(); }));
  await new Promise((resolve, reject) => {
    chrome.debugger.attach({ tabId }, '1.3', () => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve();
    });
  });
  _cdpTabId = tabId;
  // Enable required CDP domains (needed for DOM.resolveNode, Runtime.callFunctionOn, AX tree)
  await Promise.all([
    cdpSend(tabId, 'DOM.enable', {}),
    cdpSend(tabId, 'Runtime.enable', {}),
    cdpSend(tabId, 'Accessibility.enable', {}),
  ]);
}

async function cdpDetach() {
  if (_cdpTabId === null) return;
  chrome.debugger.detach({ tabId: _cdpTabId }).catch(() => {});
  _cdpTabId  = null;
  _cdpNodeMap = {};
}

const CDP_INTERACTIVE_ROLES = new Set([
  'button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'option', 'radio', 'checkbox', 'tab', 'textbox', 'combobox',
  'slider', 'spinbutton', 'searchbox', 'switch', 'treeitem',
]);

async function cdpGetDOMTree(tabId) {
  const { nodes } = await cdpSend(tabId, 'Accessibility.getFullAXTree', {});
  const lines   = [];
  const nodeMap = {};

  for (const node of nodes) {
    const role = node.role?.value;
    if (!role || node.ignored) continue;
    if (!CDP_INTERACTIVE_ROLES.has(role)) continue;

    // Skip explicitly hidden nodes
    const hiddenProp = node.properties?.find(p => p.name === 'hidden');
    if (hiddenProp?.value?.value === true) continue;

    // Nodes without a backendDOMNodeId can't be targeted by CDP actions — skip them
    if (!node.backendDOMNodeId) continue;

    const rawName = node.name?.value?.trim() || '';
    // Nameless non-inputs carry no useful info for the LLM
    if (!rawName && role !== 'textbox' && role !== 'searchbox' && role !== 'combobox') continue;

    // Truncate to 80 chars — prevents embed model crash on long link descriptions
    const name = rawName.length > 80 ? rawName.slice(0, 80) + '…' : rawName;

    const idx = lines.length;
    lines.push(name ? `[${idx}] ${role}: ${name}` : `[${idx}] ${role}`);
    nodeMap[idx] = node.backendDOMNodeId;
  }

  _cdpNodeMap = nodeMap;
  console.log(`[arkhon-bg] cdpGetDOMTree: ${lines.length} interactive nodes`);
  return { text: lines.join('\n'), count: lines.length };
}

async function cdpExecuteAction(tabId, action, index, value, direction) {
  const backendNodeId = _cdpNodeMap[index];
  if (backendNodeId == null) throw new Error(`No node for index ${index}`);

  // Resolve backendNodeId → Runtime.RemoteObject so we can call JS on it
  const { object } = await cdpSend(tabId, 'DOM.resolveNode', { backendNodeId });

  // Helper: run a function on the element
  const callOn = (fn, returnByValue = true) =>
    cdpSend(tabId, 'Runtime.callFunctionOn', {
      objectId: object.objectId,
      functionDeclaration: fn,
      returnByValue,
    });

  // Scroll element into view and get its viewport rect
  const getRect = async () => {
    const res = await callOn('function() { this.scrollIntoView({block:"center",behavior:"instant"}); const r=this.getBoundingClientRect(); return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height}); }');
    return JSON.parse(res.result.value);
  };

  if (action === 'click') {
    // element.click() triggers browser navigation for <a> links and fires all event
    // listeners — more reliable than coordinate-based mouse events for any element type.
    await callOn('function() { this.scrollIntoView({block:"center",behavior:"instant"}); this.click(); }');
  } else if (action === 'fill') {
    await callOn('function() { this.scrollIntoView({block:"center",behavior:"instant"}); this.focus(); this.select(); }');
    await new Promise(res => setTimeout(res, 80));
    // Clear then type
    await callOn('function() { const s=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this),"value")?.set; if(s)s.call(this,"");else this.value=""; this.dispatchEvent(new Event("input",{bubbles:true})); }');
    await cdpSend(tabId, 'Input.insertText', { text: String(value ?? '') });
    await callOn('function() { this.dispatchEvent(new Event("change",{bubbles:true})); }');
  } else if (action === 'scroll') {
    const r = await getRect();
    await cdpSend(tabId, 'Input.dispatchMouseEvent', {
      type: 'mouseWheel', x: r.x + r.w / 2, y: r.y + r.h / 2,
      deltaX: 0, deltaY: direction === 'up' ? -400 : 400,
    });
  }
}

// ── CDP message handlers ───────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_MY_TAB_ID') {
    sendResponse(sender.tab?.id ?? null);
    return true;
  }

  if (msg.type === 'OPEN_SIDE_PANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab) return;
      chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
      chrome.storage.session.set({ sidebarOpen: true });
      chrome.tabs.sendMessage(tab.id, { type: 'HIDE_FAB' }).catch(() => {});
    });
    return;
  }

  if (msg.type === 'RESTORE_CHAT') {
    chrome.storage.session.remove('sidebarOpen');
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab) chrome.tabs.sendMessage(tab.id, { type: 'SHOW_FAB' }).catch(() => {});
    });
    return;
  }

  if (msg.type === 'AGENT_START') {
    cdpAttach(msg.tabId)
      .then(() => sendResponse({ ok: true }))
      .catch(e => sendResponse({ ok: false, error: e.message }));
    return true;
  }
  if (msg.type === 'AGENT_STOP') {
    cdpDetach()
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'GET_DOM_TREE_CDP') {
    cdpGetDOMTree(msg.tabId)
      .then(result => sendResponse(result))
      .catch(e => sendResponse({ text: '', count: 0, error: e.message }));
    return true;
  }
  if (msg.type === 'EXECUTE_ACTION_CDP') {
    cdpExecuteAction(msg.tabId, msg.action, msg.index, msg.value, msg.direction)
      .then(() => sendResponse({ ok: true }))
      .catch(e => sendResponse({ ok: false, error: e.message }));
    return true;
  }
});
