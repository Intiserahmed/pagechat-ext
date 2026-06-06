// Runs in page context — extracts readable text when side panel asks

const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','IFRAME','SVG','CANVAS','NAV','FOOTER','HEADER']);

function extractText(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (SKIP.has(node.tagName)) return '';
  if (node.tagName === 'IMG') return node.alt ? `[image: ${node.alt}]` : '';
  return Array.from(node.childNodes).map(extractText).join(' ');
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type !== 'GET_PAGE_CONTENT') return;
  const text = extractText(document.body).replace(/\s+/g, ' ').trim();
  reply({
    title: document.title,
    url:   location.href,
    text:  text.slice(0, 120_000), // cap to avoid OOM on huge pages
  });
  return true; // keep channel open for async reply
});
