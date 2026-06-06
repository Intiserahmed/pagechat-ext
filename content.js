// content.js — Page text extraction + FAB overlay injection

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

function isVisible(el) {
  if (el.hidden) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.offsetParent === null && el.tagName !== 'BODY') return false;
  return true;
}

function sectionLabel(el) {
  const tag  = el.tagName.toLowerCase();
  const role = el.getAttribute('role') || '';
  const aria = el.getAttribute('aria-label') ||
    (el.getAttribute('aria-labelledby')
      ? document.getElementById(el.getAttribute('aria-labelledby'))?.textContent || ''
      : '');
  const id = el.id ? `#${el.id}` : '';
  return [aria || role || tag, id].filter(Boolean).join(' ').trim();
}

function extractSections() {
  const landmarks = Array.from(document.querySelectorAll(LANDMARK_SEL));
  const topLevel = landmarks.filter(el =>
    !landmarks.some(other => other !== el && other.contains(el))
  );
  if (topLevel.length === 0) return '';
  return topLevel
    .filter(isVisible)
    .map(el => {
      const text = el.innerText?.replace(/\s+/g, ' ').trim() || '';
      if (!text || text.length < 30) return '';
      return `[${sectionLabel(el)}]\n${text}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function extractPage() {
  const parts = [];
  const jsonld = extractJsonLd();
  if (jsonld) parts.push(jsonld);
  const meta = extractMeta();
  if (meta) parts.push(meta);
  const sections = extractSections();
  parts.push(sections || document.body.innerText?.replace(/\s+/g, ' ').trim() || '');
  return parts.join('\n\n').slice(0, 120_000);
}

// ── Form field detection ───────────────────────────────────────────────────
const SKIP_INPUT_TYPES = new Set(['hidden','submit','button','reset','file','image','checkbox','radio']);

function detectFormFields() {
  const inputs = Array.from(document.querySelectorAll('input,textarea,select'))
    .filter(el => !SKIP_INPUT_TYPES.has(el.type) && isVisible(el));
  return inputs.map((el, idx) => {
    let label = '';
    if (el.id) {
      try { label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText?.trim() || ''; } catch {}
    }
    if (!label) label = el.closest('label')?.innerText?.replace(el.value, '').trim() || '';
    if (!label) label = el.getAttribute('aria-label') || '';
    if (!label && el.getAttribute('aria-labelledby'))
      label = document.getElementById(el.getAttribute('aria-labelledby'))?.innerText?.trim() || '';
    return { idx, label, name: el.name || '', type: el.type || el.tagName.toLowerCase(), placeholder: el.placeholder || '', id: el.id || '' };
  });
}

function fillFields(fills) {
  const inputs = Array.from(document.querySelectorAll('input,textarea,select'))
    .filter(el => !SKIP_INPUT_TYPES.has(el.type) && isVisible(el));

  // Build name/id/label → index lookup for when AI uses non-numeric keys
  const byKey = {};
  inputs.forEach((el, idx) => {
    if (el.name) byKey[el.name.toLowerCase()] = idx;
    if (el.id)   byKey[el.id.toLowerCase()]   = idx;
    if (el.placeholder) byKey[el.placeholder.toLowerCase()] = idx;
  });

  let count = 0;
  Object.entries(fills).forEach(([key, value]) => {
    if (!value) return;
    // Try numeric index first, then name/id/label fallback
    let idx = Number(key);
    if (isNaN(idx)) idx = byKey[key.toLowerCase()] ?? -1;
    const el = inputs[idx];
    if (!el || value == null) return;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
                : el instanceof HTMLSelectElement   ? HTMLSelectElement.prototype
                                                    : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, String(value)); else el.value = String(value);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    count++;
  });
  return count;
}

// ── Message listener ───────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === 'GET_PAGE_CONTENT') {
    const doExtract = () => {
      reply({ title: document.title, url: location.href, text: extractPage() });
    };
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      doExtract();
    } else {
      document.addEventListener('DOMContentLoaded', doExtract, { once: true });
    }
    return true;
  }
  if (msg.type === 'GET_FORM_FIELDS') {
    reply({ fields: detectFormFields() });
    return true;
  }
  if (msg.type === 'FILL_FIELDS') {
    reply({ count: fillFields(msg.fills) });
    return true;
  }
});

// ── FAB overlay injection ──────────────────────────────────────────────────
(function injectFAB() {
  if (document.getElementById('pagechat-host')) return;

  const host = document.createElement('div');
  host.id = 'pagechat-host';
  const shadow = host.attachShadow({ mode: 'open' });
  const frameUrl = chrome.runtime.getURL('sidepanel/index.html');

  shadow.innerHTML = `
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #c8f24e;
        color: #0c0e0b;
        border: none;
        cursor: pointer;
        display: grid;
        place-items: center;
        box-shadow: 0 4px 20px rgba(0,0,0,.4);
        transition: transform .15s ease, box-shadow .15s ease;
        z-index: 2147483646;
      }
      .fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,.5); }
      .fab.open  { background: #1c1f19; color: #c8f24e; box-shadow: 0 4px 20px rgba(200,242,78,.2); }
      .fab.processing { animation: fabRing 1.6s ease-out infinite; }
      @keyframes fabRing {
        0%   { box-shadow: 0 4px 20px rgba(0,0,0,.4), 0 0 0 0   rgba(200,242,78,.5); }
        70%  { box-shadow: 0 4px 20px rgba(0,0,0,.4), 0 0 0 9px rgba(200,242,78,0); }
        100% { box-shadow: 0 4px 20px rgba(0,0,0,.4), 0 0 0 0   rgba(200,242,78,0); }
      }
      .fab svg   { transition: transform .2s ease; }
      .fab.open svg { transform: rotate(90deg); }

      .chat-wrap {
        position: fixed;
        bottom: 86px;
        right: 24px;
        width: 360px;
        height: 540px;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 12px 48px rgba(0,0,0,.55);
        z-index: 2147483645;
        opacity: 0;
        pointer-events: none;
        transform: scale(0.94) translateY(10px);
        transform-origin: bottom right;
        transition: opacity .2s ease, transform .2s cubic-bezier(.34,1.4,.64,1);
      }
      .chat-wrap.open {
        opacity: 1;
        pointer-events: all;
        transform: scale(1) translateY(0);
      }

      iframe {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
        border-radius: 14px;
      }
    </style>

    <button class="fab" id="fab" title="PageChat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <div class="chat-wrap" id="chat-wrap">
      <iframe id="chat-frame" src="${frameUrl}"></iframe>
    </div>
  `;

  const fab       = shadow.getElementById('fab');
  const chatWrap  = shadow.getElementById('chat-wrap');
  let open = false;

  fab.addEventListener('click', () => {
    open = !open;
    fab.classList.toggle('open', open);
    chatWrap.classList.toggle('open', open);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) {
      open = false;
      fab.classList.remove('open');
      chatWrap.classList.remove('open');
    }
  });

  // Show pulsing ring on FAB while model is loading or indexing
  const PROCESSING = new Set(['loading-embed', 'loading-chat', 'indexing']);
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type !== 'PC_STATE') return;
    fab.classList.toggle('processing', PROCESSING.has(msg.status));
  });

  document.documentElement.appendChild(host);
})();
