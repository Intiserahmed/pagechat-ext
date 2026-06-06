// Notify content script when active tab changes so page pill updates
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.sendMessage(tabId, { type: 'TAB_CHANGED' }).catch(() => {});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.tabs.sendMessage(tabId, { type: 'TAB_UPDATED', url: tab.url }).catch(() => {});
  }
});
