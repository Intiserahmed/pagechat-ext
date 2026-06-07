/**
 * buildDomTree.js — browser-use DOM extraction ported to pure JS
 *
 * Matches browser-use's DOMTreeSerializer + ClickableElementDetector logic:
 * - Shadow DOM traversal (pierces all shadow roots)
 * - Scrollable container detection
 * - Viewport threshold filtering (1000px below fold)
 * - Compound component descriptions (date/file/range/select/video)
 * - Framework JS click handler fingerprinting (React/Vue/Angular/Svelte/Alpine)
 * - Rich attribute output (name, id, type, placeholder, value)
 *
 * Usage:
 *   const { text, map } = buildDomTree();
 *   // text → "[0] button: Sign in\n[1] input[text] name=q placeholder=Search"
 *   // map  → { 0: Element, 1: Element, ... }
 */

function buildDomTree() {
  // ── Constants (mirrors browser-use) ──────────────────────────────────────
  const SKIP_TAGS = new Set([
    'script', 'style', 'noscript', 'head', 'meta', 'link', 'title',
    'template', 'path', 'defs', 'clippath', 'mask', 'pattern',
    'use', 'symbol', 'lineargradient', 'radialgradient',
  ]);

  const SVG_SKIP = new Set([
    'path', 'rect', 'g', 'circle', 'ellipse', 'line', 'polyline',
    'polygon', 'use', 'defs', 'clippath', 'mask', 'pattern', 'image',
    'text', 'tspan',
  ]);

  const INTERACTIVE_TAGS = new Set([
    'a', 'button', 'input', 'select', 'textarea', 'details', 'summary',
    'option', 'optgroup',
  ]);

  const INTERACTIVE_ROLES = new Set([
    'button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
    'option', 'radio', 'checkbox', 'tab', 'textbox', 'combobox',
    'slider', 'spinbutton', 'search', 'searchbox', 'switch',
    'row', 'cell', 'gridcell', 'treeitem', 'listbox',
  ]);

  const SEARCH_INDICATORS = [
    'search', 'magnify', 'glass', 'lookup', 'find', 'query',
    'search-icon', 'search-btn', 'search-button', 'searchbox',
  ];

  // Elements that propagate interactivity to children (browser-use PROPAGATING_ELEMENTS)
  const PROPAGATING_TAGS = new Set(['a', 'button', 'label']);

  // Only include elements within the viewport + small buffer below
  const VIEWPORT_BUFFER = 200;

  const viewportHeight = window.innerHeight;

  // ── Visibility ────────────────────────────────────────────────────────────
  function isVisible(el) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none') return false;
    if (style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) === 0) return false;

    const rect = el.getBoundingClientRect();
    if (rect.width < 0 || rect.height < 0) return false;
    // Only include elements actually on screen + small buffer
    if (rect.bottom < -50) return false; // above viewport
    if (rect.top > viewportHeight + VIEWPORT_BUFFER) return false; // below viewport

    return true;
  }

  function isScrollable(el) {
    const style = window.getComputedStyle(el);
    const overflow = style.overflow + style.overflowX + style.overflowY;
    if (!/auto|scroll/.test(overflow)) return false;
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  }

  // ── Framework JS click handler fingerprinting ─────────────────────────────
  function hasFrameworkClickHandler(el) {
    // React 16+ — __reactProps$xxx
    const reactPropsKey = Object.keys(el).find(
      k => k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers'),
    );
    if (reactPropsKey) {
      const p = el[reactPropsKey];
      if (p && (p.onClick || p.onMouseDown || p.onPointerDown)) return true;
    }
    // React 15 — __reactInternalInstance$xxx
    const reactIntKey = Object.keys(el).find(k => k.startsWith('__reactInternalInstance'));
    if (reactIntKey) {
      try {
        const props = el[reactIntKey]?._currentElement?.props;
        if (props && (props.onClick || props.onMouseDown)) return true;
      } catch { /* ignore */ }
    }
    // Vue 3
    if (el.__vueParentComponent) {
      try {
        const props = el.__vueParentComponent?.vnode?.props;
        if (props && (props.onClick || props.onMousedown)) return true;
      } catch { /* ignore */ }
    }
    // Vue 2
    if (el.__vue__) {
      try {
        const listeners = el.__vue__.$listeners || el.__vue__.$vnode?.data?.on;
        if (listeners && (listeners.click || listeners.mousedown)) return true;
      } catch { /* ignore */ }
    }
    // Angular Zone.js
    const zoneKey = Object.keys(el).find(k => k === '__zone_symbol__eventNames');
    if (zoneKey) {
      const events = el[zoneKey];
      if (Array.isArray(events) && (events.includes('click') || events.includes('mousedown'))) return true;
    }
    if (el.getAttribute?.('ng-click') || el.getAttribute?.('(click)')) return true;
    // Svelte dev mode
    if (el.__svelte_meta) return true;
    // Alpine.js
    if (el._x_dataStack !== undefined) return true;
    if (el.getAttribute?.('x-on:click') || el.getAttribute?.('@click')) return true;

    return false;
  }

  // ── Form control descendant check (label/span wrappers) ───────────────────
  function hasFormControlDescendant(el, depth = 2) {
    if (depth <= 0) return false;
    for (const child of el.children) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return true;
      if (hasFormControlDescendant(child, depth - 1)) return true;
    }
    return false;
  }

  function hasSearchIndicator(el) {
    const cls = (el.getAttribute('class') || '').toLowerCase();
    const id  = (el.id || '').toLowerCase();
    for (const ind of SEARCH_INDICATORS) {
      if (cls.includes(ind) || id.includes(ind)) return true;
    }
    return false;
  }

  // ── Interactivity detection ───────────────────────────────────────────────
  function isInteractive(el) {
    const tag  = el.tagName.toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();

    if (tag === 'html' || tag === 'body') return false;
    if (SKIP_TAGS.has(tag)) return false;
    if (SVG_SKIP.has(tag)) return false;

    if (el.disabled) return false;
    if (el.getAttribute('aria-disabled') === 'true') return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;

    if (INTERACTIVE_TAGS.has(tag)) {
      if (tag === 'a' && !el.href && !el.getAttribute('onclick')) return false;
      if (tag === 'label' && el.getAttribute('for')) return false;
      return true;
    }

    if ((tag === 'label' || tag === 'span') && hasFormControlDescendant(el)) return true;
    if (role && INTERACTIVE_ROLES.has(role)) return true;
    if (hasFrameworkClickHandler(el)) return true;
    if (el.onclick || el.getAttribute('onclick')) return true;
    if (el.getAttribute('onmousedown') || el.getAttribute('onkeydown')) return true;

    const tabindex = el.getAttribute('tabindex');
    if (tabindex !== null && tabindex !== '-1') return true;

    if (window.getComputedStyle(el).cursor === 'pointer') return true;
    if (hasSearchIndicator(el)) return true;
    if (el.getAttribute('contenteditable') === 'true') return true;

    return false;
  }

  // ── Compound component descriptions (browser-use _add_compound_components) ─
  function getCompoundDescription(el) {
    const tag  = el.tagName.toLowerCase();
    const type = (el.getAttribute('type') || '').toLowerCase();

    if (tag === 'input') {
      if (type === 'range') {
        return `slider min=${el.min || 0} max=${el.max || 100} value=${el.value}`;
      }
      if (type === 'color') {
        return `color-picker value=${el.value}`;
      }
      if (type === 'file') {
        const filename = el.files?.[0]?.name || 'None';
        return `file-upload value=${filename}`;
      }
      if (type === 'date')     return `input[date] placeholder=YYYY-MM-DD value=${el.value || ''}`;
      if (type === 'time')     return `input[time] placeholder=HH:MM value=${el.value || ''}`;
      if (type === 'datetime-local') return `input[datetime] placeholder=YYYY-MM-DDTHH:MM value=${el.value || ''}`;
      if (type === 'month')    return `input[month] placeholder=YYYY-MM value=${el.value || ''}`;
      if (type === 'week')     return `input[week] placeholder=YYYY-W## value=${el.value || ''}`;
      if (type === 'tel')      return `input[tel] placeholder=123-456-7890 value=${el.value || ''}`;
    }

    if (tag === 'select') {
      const opts = [...el.options].map(o => o.text.trim()).filter(Boolean).slice(0, 8);
      const more = el.options.length > 8 ? ` +${el.options.length - 8} more` : '';
      const cur  = el.options[el.selectedIndex]?.text.trim() || '';
      return `select value="${cur}" options=[${opts.join(', ')}${more}]`;
    }

    if (tag === 'video' || tag === 'audio') {
      const state = el.paused ? 'paused' : 'playing';
      return `${tag} ${state} ${Math.round(el.currentTime)}s/${Math.round(el.duration || 0)}s`;
    }

    if (tag === 'details') {
      return `details ${el.open ? 'open' : 'closed'}`;
    }

    return null;
  }

  // ── Label / text extraction ───────────────────────────────────────────────
  function getLabel(el) {
    const tag  = el.tagName.toLowerCase();
    const type = (el.getAttribute('type') || '').toLowerCase();

    // Compound component overrides
    const compound = getCompoundDescription(el);
    if (compound) return compound;

    // aria-label first
    const aria = el.getAttribute('aria-label');
    if (aria?.trim()) return aria.trim();

    // aria-labelledby
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const ref = document.getElementById(labelledBy);
      if (ref?.textContent?.trim()) return ref.textContent.trim();
    }

    // <input> / <textarea>
    if (tag === 'input' || tag === 'textarea') {
      const parts = [];
      if (type && type !== 'text' && type !== 'submit' && type !== 'button') parts.push(`[${type}]`);
      const name = el.getAttribute('name');
      if (name) parts.push(`name=${name}`);
      const ph = el.placeholder;
      if (ph) parts.push(`placeholder=${ph}`);
      const val = el.value;
      if (val) parts.push(`value=${val.slice(0, 40)}`);
      return parts.join(' ') || type || 'input';
    }

    // alt for images inside buttons/links
    const img = el.querySelector('img[alt]');
    if (img?.alt) return img.alt.trim();

    // title attribute fallback
    const title = el.getAttribute('title');
    if (title?.trim()) return title.trim();

    // text content
    const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
    return text.slice(0, 80);
  }

  function getType(el) {
    const tag  = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    const type = el.getAttribute('type');
    if (role) return role;
    if (tag === 'input') return `input[${type || 'text'}]`;
    return tag;
  }

  // ── Shadow DOM-aware traversal ────────────────────────────────────────────
  // browser-use traverses children_and_shadow_roots — we replicate by recursing
  // into shadowRoot whenever one exists.
  const MAX_ELEMENTS = 120;
  const map   = {};
  const lines = [];
  let   idx   = 0;

  function processElement(el) {
    if (idx >= MAX_ELEMENTS) return;
    const tag = (el.tagName || '').toLowerCase();
    if (SKIP_TAGS.has(tag)) return;

    const interactive  = isInteractive(el);
    const scrollable   = !interactive && isScrollable(el);
    const visible      = isVisible(el);

    if ((interactive || scrollable) && visible) {
      const type  = scrollable ? 'scrollable' : getType(el);
      const label = scrollable
        ? `${tag} scrollH=${el.scrollHeight} scrollW=${el.scrollWidth}`
        : getLabel(el);

      const line = label ? `[${idx}] ${type}: ${label}` : `[${idx}] ${type}`;
      lines.push(line);
      map[idx] = el;
      idx++;
    }

    // Recurse into children
    for (const child of el.children) {
      processElement(child);
    }

    // Pierce shadow DOM (browser-use: children_and_shadow_roots)
    if (el.shadowRoot) {
      for (const child of el.shadowRoot.children) {
        processElement(child);
      }
    }
  }

  // Start from body
  for (const child of document.body.children) {
    processElement(child);
  }

  // Also handle body's own shadow root (rare but possible)
  if (document.body.shadowRoot) {
    for (const child of document.body.shadowRoot.children) {
      processElement(child);
    }
  }

  return { text: lines.join('\n'), map, count: idx };
}

/**
 * filterByGoal — semantic pre-filter matching browser-use's element relevance scoring.
 * Scores each element line against goal tokens (BM25-lite), keeps top K,
 * re-indexes so [0]…[K-1] map to _domMap correctly.
 *
 * @param {{ text: string, map: object, count: number }} result — from buildDomTree()
 * @param {string} goal — user's natural-language goal
 * @param {number} topK — max elements to keep (default 20)
 */
function filterByGoal(result, goal, topK = 20) {
  if (!goal || !result.text) return result;

  const lines = result.text.split('\n').filter(Boolean);

  // Tokenise goal — ignore stop words and short tokens
  const STOP = new Set(['the','a','an','is','to','in','on','at','for','of','and','or','that','this','it','be','by']);
  const goalTokens = goal.toLowerCase()
    .split(/\W+/)
    .filter(t => t.length > 2 && !STOP.has(t));

  if (goalTokens.length === 0) return result; // can't filter, return all

  // Intent signals — help boost the right element type
  const isInputIntent  = /type|enter|fill|write|search|input|query/i.test(goal);
  const isClickIntent  = /click|press|submit|open|go|tap|select|choose/i.test(goal);
  const isScrollIntent = /scroll|down|up|more|load/i.test(goal);

  const scored = lines.map(line => {
    const lower = line.toLowerCase();
    let score = 0;

    // Token overlap (BM25-lite)
    for (const tok of goalTokens) {
      if (lower.includes(tok)) score += 2;
    }

    // Element type boosting
    if (isInputIntent  && /input|textarea|textbox|search|combobox/.test(lower)) score += 3;
    if (isClickIntent  && /button|link|submit|checkbox|radio/.test(lower))       score += 2;
    if (isScrollIntent && /scrollable/.test(lower))                               score += 3;

    // Always boost submit/search buttons slightly — common targets
    if (/submit|search|go|find|login|sign.?in/.test(lower)) score += 1;

    return { line, score };
  });

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .sort((a, b) => {
      // Restore original document order
      const ia = parseInt(a.line.match(/^\[(\d+)\]/)?.[1] ?? 0);
      const ib = parseInt(b.line.match(/^\[(\d+)\]/)?.[1] ?? 0);
      return ia - ib;
    });

  // Re-index: new [0]…[K-1] → original element refs
  const newMap   = {};
  const newLines = top.map(({ line }, newIdx) => {
    const origIdx = parseInt(line.match(/^\[(\d+)\]/)?.[1] ?? -1);
    if (origIdx !== -1) newMap[newIdx] = result.map[origIdx];
    return line.replace(/^\[\d+\]/, `[${newIdx}]`);
  });

  return { text: newLines.join('\n'), map: newMap, count: newLines.length };
}

if (typeof module !== 'undefined') module.exports = { buildDomTree, filterByGoal };
