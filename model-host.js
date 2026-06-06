// model-host.js — Offscreen document: loads wllama ONCE for the entire browser session.
// All tabs communicate with this via chrome.runtime messages.

import './lib/wllama-bridge.js';

const pc = window.__pagechat;

function broadcast() {
  chrome.runtime.sendMessage({
    type:        'PC_STATE',
    status:      pc.status,
    progress:    pc.progress,
    useEmbed:    pc.useEmbed,
    chunkCount:  pc.chunkCount,
    cachedPages: pc.cachedPages,
  }).catch(() => {});
}

// Push state to all iframes on every change
pc.subscribe(() => broadcast());

// Push initial state so any open iframes sync immediately
broadcast();

// Auto-start model load when this tab is created
pc.loadModels();

// Handle commands from iframes (relayed via background or direct runtime messages)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg.type?.startsWith('PC_CMD_')) return;

  switch (msg.type) {
    case 'PC_CMD_LOAD':
      pc.loadModels();
      break;

    case 'PC_CMD_INDEX':
      pc.indexPage(msg.text, msg.url).catch(console.error);
      break;

    case 'PC_CMD_SET_EMBED':
      pc.setUseEmbed(msg.val);
      break;

    case 'PC_CMD_STATE_REQ':
      broadcast();
      break;

    case 'PC_CMD_RESTORE': {
      const hit = pc.restoreFromCache(msg.url);
      sendResponse({ hit });
      return true;
    }

    case 'PC_CMD_SUGGEST':
      pc.suggestQuestions()
        .then(questions => {
          chrome.runtime.sendMessage({ type: 'PC_SUGGESTIONS', tabId: msg.tabId, questions }).catch(() => {});
        })
        .catch(() => {
          chrome.runtime.sendMessage({ type: 'PC_SUGGESTIONS', tabId: msg.tabId, questions: [] }).catch(() => {});
        });
      break;

    case 'PC_CMD_CHAT':
      pc.chat(
        msg.messages,
        token => chrome.runtime.sendMessage({ type: 'PC_TOKEN', tabId: msg.tabId, token }).catch(() => {}),
        msg.opts,
      )
        .then(() => {
          chrome.runtime.sendMessage({ type: 'PC_CHAT_DONE', tabId: msg.tabId }).catch(() => {});
        })
        .catch(e => {
          chrome.runtime.sendMessage({ type: 'PC_ERROR', tabId: msg.tabId, message: e.message }).catch(() => {});
        });
      break;
  }
});
