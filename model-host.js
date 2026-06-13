// model-host.js — Offscreen document: loads wllama ONCE for the entire browser session.
// All tabs communicate with this via chrome.runtime messages.

// Warn before closing — closing unloads the model and triggers a reload
window.addEventListener('beforeunload', e => { e.preventDefault(); e.returnValue = ''; });

import './lib/wllama-bridge.js';

const pc = window.__arkhon;

function broadcast() {
  chrome.runtime.sendMessage({
    type:      'PC_STATE',
    status:    pc.status,
    progress:  pc.progress,
    useEmbed:  pc.useEmbed,
    modelBusy: pc._modelBusy ?? false,
    busyTabId: pc._busyTabId ?? null,
  }).catch(() => {});
}

function broadcastTabState(tabId, status, progress) {
  chrome.runtime.sendMessage({
    type: 'PC_TAB_STATE',
    tabId,
    status,
    progress,
  }).catch(() => {});
}

// Push state to all iframes on every model state change
pc.subscribe(() => broadcast());

// Push initial state so any open iframes sync immediately
broadcast();

// Auto-start model load with retry on failure
(async () => {
  const MAX_ATTEMPTS = 3;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      await pc.loadModels();
      return;
    } catch (e) {
      console.warn(`[arkhon] loadModels attempt ${i + 1} failed:`, e);
      if (i < MAX_ATTEMPTS - 1) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      } else {
        chrome.runtime.sendMessage({
          type: 'PC_STATE', status: 'error', progress: 0,
          useEmbed: false, modelBusy: false, busyTabId: null,
        }).catch(() => {});
      }
    }
  }
})();

let _lastKnowledgeText = '';   // dedup: skip re-index if text unchanged
let _indexingKnowledge = false; // dedup: skip concurrent calls

// Handle commands from iframes (relayed via background or direct runtime messages)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg.type?.startsWith('PC_CMD_')) return;

  switch (msg.type) {
    case 'PC_CMD_LOAD':
      broadcast(); // announce real state immediately — fixes SW-restart stale-cache stuck-idle
      pc.loadModels().catch(console.error);
      break;

    case 'PC_CMD_CLEAR_CACHE':
      pc.clearModelCache()
        .then(() => chrome.runtime.sendMessage({ type: 'PC_CACHE_CLEARED' }).catch(() => {}))
        .catch(() => chrome.runtime.sendMessage({ type: 'PC_CACHE_CLEARED' }).catch(() => {}));
      break;

    case 'PC_CMD_INDEX':
      pc.indexPage(msg.text, msg.url, msg.tabId, ({ status, progress }) => {
        broadcastTabState(msg.tabId, status, progress);
      }).catch(e => {
        broadcastTabState(msg.tabId, 'error', 0);
        console.error('[arkhon] indexPage error:', e);
      });
      break;

    case 'PC_CMD_HAS_INDEX':
      sendResponse({ has: pc.hasIndex(msg.tabId) });
      return true;

    case 'PC_CMD_REMOVE_INDEX':
      pc.removeIndex(msg.tabId);
      break;

    case 'PC_CMD_SET_EMBED':
      pc.setUseEmbed(msg.val);
      break;

    case 'PC_CMD_STATE_REQ':
      broadcast();
      break;

    case 'PC_CMD_SUGGEST':
      pc.suggestQuestions(msg.tabId)
        .then(questions => {
          chrome.runtime.sendMessage({ type: 'PC_SUGGESTIONS', tabId: msg.tabId, questions }).catch(() => {});
        })
        .catch(() => {
          chrome.runtime.sendMessage({ type: 'PC_SUGGESTIONS', tabId: msg.tabId, questions: [] }).catch(() => {});
        });
      break;

    case 'PC_CMD_SUMMARIZE':
      pc.setBusy(true, msg.tabId);
      pc.summarize(
        msg.tabId,
        token => chrome.runtime.sendMessage({ type: 'PC_TOKEN', tabId: msg.tabId, token }).catch(() => {}),
        progress => chrome.runtime.sendMessage({ type: 'PC_SUMMARIZE_PROGRESS', tabId: msg.tabId, progress }).catch(() => {}),
      )
        .then(() => {
          pc.setBusy(false, null);
          chrome.runtime.sendMessage({ type: 'PC_CHAT_DONE', tabId: msg.tabId }).catch(() => {});
        })
        .catch(e => {
          pc.setBusy(false, null);
          chrome.runtime.sendMessage({ type: 'PC_ERROR', tabId: msg.tabId, message: e.message }).catch(() => {});
        });
      break;

    case 'PC_CMD_INDEX_KNOWLEDGE':
      if (_indexingKnowledge || msg.text === _lastKnowledgeText) break;
      _indexingKnowledge = true;
      _lastKnowledgeText = msg.text;
      pc.indexKnowledge(msg.text)
        .then(() => {
          _indexingKnowledge = false;
          chrome.runtime.sendMessage({ type: 'PC_KNOWLEDGE_DONE', tabId: msg.tabId }).catch(() => {});
        })
        .catch(() => {
          _indexingKnowledge = false;
          _lastKnowledgeText = ''; // reset so a retry with the same text isn't permanently skipped
          chrome.runtime.sendMessage({ type: 'PC_KNOWLEDGE_DONE', tabId: msg.tabId }).catch(() => {});
        });
      break;

    case 'PC_CMD_FILL':
      pc.fillForm(msg.fields, msg.request)
        .then(fills => {
          chrome.runtime.sendMessage({ type: 'PC_FILL_RESULT', tabId: msg.tabId, fills }).catch(() => {});
        })
        .catch(e => {
          chrome.runtime.sendMessage({ type: 'PC_ERROR', tabId: msg.tabId, message: e.message }).catch(() => {});
        });
      break;

    case 'PC_CMD_EMBED_FILTER':
      pc.embedFilter(msg.goal, msg.domText, msg.topK, (status) => {
        chrome.runtime.sendMessage({ type: 'PC_EMBED_STATUS', tabId: msg.tabId, status }).catch(() => {});
      })
        .then(result => {
          chrome.runtime.sendMessage({ type: 'PC_EMBED_FILTER_RESULT', tabId: msg.tabId, ...result }).catch(() => {});
        })
        .catch(() => {
          chrome.runtime.sendMessage({ type: 'PC_EMBED_FILTER_RESULT', tabId: msg.tabId, text: msg.domText }).catch(() => {});
        });
      break;

    case 'PC_CMD_REMAINING_GOAL':
      pc.remainingGoal(msg.goal, msg.actionTaken)
        .then(remaining => {
          chrome.runtime.sendMessage({ type: 'PC_REMAINING_GOAL_RESULT', tabId: msg.tabId, remaining }).catch(() => {});
        })
        .catch(() => {
          chrome.runtime.sendMessage({ type: 'PC_REMAINING_GOAL_RESULT', tabId: msg.tabId, remaining: 'done' }).catch(() => {});
        });
      break;

    case 'PC_CMD_AGENT_STEP':
      pc.agentStep(msg.goal, msg.domTree, msg.history)
        .then(action => {
          chrome.runtime.sendMessage({ type: 'PC_AGENT_RESULT', tabId: msg.tabId, action }).catch(() => {});
        })
        .catch(e => {
          chrome.runtime.sendMessage({ type: 'PC_ERROR', tabId: msg.tabId, message: e.message }).catch(() => {});
        });
      break;

    case 'PC_CMD_CHAT':
      pc.setBusy(true, msg.tabId);
      pc.chat(
        msg.messages,
        msg.tabId,
        token => chrome.runtime.sendMessage({ type: 'PC_TOKEN', tabId: msg.tabId, token }).catch(() => {}),
        msg.opts,
      )
        .then(() => {
          pc.setBusy(false, null);
          chrome.runtime.sendMessage({ type: 'PC_CHAT_DONE', tabId: msg.tabId }).catch(() => {});
        })
        .catch(e => {
          pc.setBusy(false, null);
          chrome.runtime.sendMessage({ type: 'PC_ERROR', tabId: msg.tabId, message: e.message }).catch(() => {});
        });
      break;
  }
});
