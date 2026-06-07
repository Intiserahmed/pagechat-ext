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

// ── Agent DOM map — persists element refs between GET_DOM_TREE and EXECUTE_ACTION ──
let _domMap = {};

function executeAgentAction(action, index, value, direction) {
  const el = _domMap[index];
  if (!el) return { ok: false, error: `element ${index} not found` };

  try {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });

    if (action === 'click') {
      el.focus();
      // Dispatch full mouse event sequence so React/Vue synthetic events fire
      ['mousedown', 'mouseup', 'click'].forEach(type => {
        el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      });
    } else if (action === 'fill') {
      el.focus();
      // Use native setter so React/Vue state updates fire correctly
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
                  : el instanceof HTMLSelectElement   ? HTMLSelectElement.prototype
                                                      : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(el, String(value)); else el.value = String(value);
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (action === 'scroll') {
      el.scrollBy(0, direction === 'up' ? -400 : 400);
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Message listener ───────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === 'GET_DOM_TREE') {
    let result = buildDomTree();
    // Semantic pre-filter: if a goal is provided, score elements and keep top 20
    if (msg.goal) result = filterByGoal(result, msg.goal, 20);
    _domMap = result.map;
    reply({ text: result.text, count: result.count });
    return true;
  }
  if (msg.type === 'EXECUTE_ACTION') {
    reply(executeAgentAction(msg.action, msg.index, msg.value, msg.direction));
    return true;
  }
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
  if (msg.type === 'GET_TRANSCRIPT') {
    extractYouTubeTranscript().then(result => reply(result)).catch(() => reply(null));
    return true;
  }
});


// ── YouTube SPA navigation ────────────────────────────────────────────────
// yt-navigate-finish fires after YouTube fully loads the new video — URL is settled.
// Content scripts are persistent (unlike the SW), so this is reliable.
if (location.hostname.includes('youtube.com')) {
  let _lastYtUrl = location.href;
  document.addEventListener('yt-navigate-finish', () => {
    if (location.href !== _lastYtUrl) {
      _lastYtUrl = location.href;
      chrome.runtime.sendMessage({ type: 'YT_NAVIGATE', url: location.href }).catch(() => {});
    }
  });
}

// ── YouTube transcript extraction via InnerTube API ───────────────────────
const YT_CLIENTS = [
  { clientName: 'IOS',        clientVersion: '20.10.4',          userAgent: 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X)' },
  { clientName: 'ANDROID_VR', clientVersion: '1.62.20',          userAgent: 'com.google.android.apps.youtube.vr.oculus/1.62.20 (Linux; U; Android 12L; eureka-user Build/SQ3A)' },
  { clientName: 'MWEB',       clientVersion: '2.20251209.01.00', userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/112 Mobile Safari/537.36' },
];

async function extractYouTubeTranscript() {
  const videoId = new URLSearchParams(location.search).get('v');
  if (!videoId) return null;

  // Try each client profile until one returns captions
  for (const client of YT_CLIENTS) {
    const result = await tryInnerTube(videoId, client);
    if (result) return result;
  }
  return null;
}

async function tryInnerTube(videoId, client) {
  const resp = await fetch(
    'https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false',
    {
      method: 'POST',
      headers: {
        'Content-Type':            'application/json',
        'X-YouTube-Client-Name':   client.clientName === 'IOS' ? '5' : client.clientName === 'ANDROID_VR' ? '28' : '2',
        'X-YouTube-Client-Version': client.clientVersion,
        'User-Agent':              client.userAgent,
        'Origin':                  'https://www.youtube.com',
      },
      body: JSON.stringify({
        context: {
          client: { clientName: client.clientName, clientVersion: client.clientVersion, hl: 'en', gl: 'US' },
          user:    { lockedSafetyMode: false },
          request: { useSsl: true },
        },
        videoId,
        contentCheckOk: true,
        racyCheckOk:    true,
      }),
    }
  ).catch(() => null);

  if (!resp?.ok) return null;
  const data = await resp.json().catch(() => null);
  if (!data) return null;

  const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!tracks?.length) return null;

  const track = tracks.find(t => t.languageCode === 'en')
             || tracks.find(t => t.languageCode?.startsWith('en'))
             || tracks[0];
  if (!track?.baseUrl) return null;

  // Fetch JSON3 captions
  const xml = await fetch(track.baseUrl + '&fmt=json3', {
    headers: { 'User-Agent': client.userAgent },
  }).then(r => r.text()).catch(() => null);
  if (!xml) return null;

  // Parse JSON3 format
  try {
    const json = JSON.parse(xml);
    const text = (json.events || [])
      .filter(e => e.segs && e.aAppend !== 1)
      .map(e => e.segs.map(s => s.utf8 || '').join(''))
      .join(' ').replace(/\s+/g, ' ').trim();
    if (text.length > 100) return { text, title: document.title };
  } catch {}

  // Fallback: parse XML captions
  const text = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
    .map(m => m[1]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, ''))
    .join(' ').replace(/\s+/g, ' ').trim();
  return text.length > 100 ? { text, title: document.title } : null;
}

// ── FAB overlay injection ──────────────────────────────────────────────────
(function injectFAB() {
  if (document.getElementById('arkhon-host')) return;

  const host = document.createElement('div');
  host.id = 'arkhon-host';
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
      .fab svg { transition: transform .2s ease; }
      .fab.open svg { transform: rotate(90deg); }

      /* tap burst — two expanding rings */
      .fab::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        pointer-events: none;
      }
      .fab.tapped::after { animation: fabBurst .6s ease-out forwards; }
      @keyframes fabBurst {
        0%   { box-shadow: 0 0 0 0   rgba(200,242,78,.8), 0 0 0 0   rgba(200,242,78,.4); }
        50%  { box-shadow: 0 0 0 14px rgba(200,242,78,.15),0 0 0 28px rgba(200,242,78,.08); }
        100% { box-shadow: 0 0 0 22px rgba(200,242,78,0),  0 0 0 44px rgba(200,242,78,0); }
      }
      /* icon squeeze + bounce on tap */
      .fab.tapped svg { animation: fabBounce .4s cubic-bezier(.36,.07,.19,.97) forwards; }
      @keyframes fabBounce {
        0%   { transform: scale(1); }
        25%  { transform: scale(.78) rotate(-10deg); }
        60%  { transform: scale(1.2) rotate(6deg); }
        100% { transform: scale(1)  rotate(0deg); }
      }


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

    <button class="fab" id="fab" title="Arkhon AI">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <!-- Mirrored chat bubble (tail bottom-right) -->
        <g transform="translate(24,0) scale(-1,1)">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </g>
        <!-- ✦ ✦ ✦ three sparkles like typing dots -->
        <path fill="currentColor" stroke="none" d="
          M9  7.8l.4 1.1 1.1.4-1.1.4L9  10.8l-.4-1.1-1.1-.4 1.1-.4z
          M12 7.8l.4 1.1 1.1.4-1.1.4L12 10.8l-.4-1.1-1.1-.4 1.1-.4z
          M15 7.8l.4 1.1 1.1.4-1.1.4L15 10.8l-.4-1.1-1.1-.4 1.1-.4z
        "/>
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
    // Tap burst animation
    fab.classList.remove('tapped');
    void fab.offsetWidth; // reflow to restart animation
    fab.classList.add('tapped');
    fab.addEventListener('animationend', () => fab.classList.remove('tapped'), { once: true });
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
