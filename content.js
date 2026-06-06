// Runs in page context — extracts readable text when side panel asks

// ── 1. JSON-LD structured data ─────────────────────────────────────────────
function extractJsonLd() {
  const blocks = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => {
    try {
      const data = JSON.parse(el.textContent);
      const items = Array.isArray(data) ? data : [data];
      items.forEach(item => {
        const type = item['@type'] || '';
        const flat = flattenJsonLd(item);
        if (flat) blocks.push(`[${type}]\n${flat}`);
      });
    } catch {}
  });
  return blocks.join('\n\n');
}

function flattenJsonLd(obj, depth = 0) {
  if (depth > 3 || !obj || typeof obj !== 'object') return String(obj ?? '');
  const SKIP_KEYS = new Set(['@context','@type','@id','url','sameAs','logo','image','potentialAction']);
  return Object.entries(obj)
    .filter(([k, v]) => !SKIP_KEYS.has(k) && v !== null && v !== undefined && v !== '')
    .map(([k, v]) => {
      const val = typeof v === 'object' ? flattenJsonLd(v, depth + 1) : String(v);
      return val ? `${k}: ${val}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

// ── 2. Meta tags ───────────────────────────────────────────────────────────
function extractMeta() {
  const get = (sel) => document.querySelector(sel)?.getAttribute('content') || '';
  const parts = [
    get('meta[name="description"]'),
    get('meta[property="og:description"]'),
    get('meta[name="twitter:description"]'),
    get('meta[property="og:title"]'),
  ].filter(Boolean);
  return parts.length ? `[Page meta]\n${[...new Set(parts)].join('\n')}` : '';
}

// ── 3. innerText per semantic section ─────────────────────────────────────
const LANDMARK_SEL = 'main, [role="main"], article, [role="article"], section, aside, [role="complementary"], header, footer, nav, [role="navigation"], form';
const NOISE_ROLES  = new Set(['navigation','banner','contentinfo','dialog','alertdialog','menu','menubar','toolbar','search']);

function isVisible(el) {
  // Fast visibility check without getComputedStyle
  if (el.hidden) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.offsetParent === null && el.tagName !== 'BODY') return false;
  return true;
}

function sectionLabel(el) {
  const tag  = el.tagName.toLowerCase();
  const role = el.getAttribute('role') || '';
  const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
    ? (el.getAttribute('aria-label') || document.getElementById(el.getAttribute('aria-labelledby'))?.textContent || '')
    : '';
  const id   = el.id ? `#${el.id}` : '';
  return [aria || role || tag, id].filter(Boolean).join(' ').trim();
}

function extractSections() {
  const landmarks = Array.from(document.querySelectorAll(LANDMARK_SEL));

  // Remove nested landmarks — keep only top-level ones
  const topLevel = landmarks.filter(el =>
    !landmarks.some(other => other !== el && other.contains(el))
  );

  if (topLevel.length === 0) return '';

  return topLevel
    .filter(el => {
      if (!isVisible(el)) return false;
      const role = el.getAttribute('role') || '';
      // Keep nav/header/footer but mark them — don't discard, user may ask about them
      return true;
    })
    .map(el => {
      const text = el.innerText?.replace(/\s+/g, ' ').trim() || '';
      if (!text || text.length < 30) return '';
      const label = sectionLabel(el);
      return `[${label}]\n${text}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

// ── 4. Full body fallback ──────────────────────────────────────────────────
function extractFallback() {
  return document.body.innerText?.replace(/\s+/g, ' ').trim() || '';
}

// ── Assemble ───────────────────────────────────────────────────────────────
function extractPage() {
  const parts = [];

  const jsonld = extractJsonLd();
  if (jsonld) parts.push(jsonld);

  const meta = extractMeta();
  if (meta) parts.push(meta);

  const sections = extractSections();
  if (sections) {
    parts.push(sections);
  } else {
    // No landmark sections found — fall back to full body innerText
    parts.push(extractFallback());
  }

  return parts.join('\n\n').slice(0, 120_000);
}

// ── Message listener ───────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type !== 'GET_PAGE_CONTENT') return;

  const doExtract = () => {
    reply({
      title: document.title,
      url:   location.href,
      text:  extractPage(),
    });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    doExtract();
  } else {
    document.addEventListener('DOMContentLoaded', doExtract, { once: true });
  }

  return true;
});
