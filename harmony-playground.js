/* =====================================================================
   HARMONY PLAYGROUND app: router, pages, search, AI Studio.
   ===================================================================== */
(function () {
const H = window.H, { ic, esc, cap } = H, AI = H.AI;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const view = $('#view'), side = $('#side');
const TOK = window.HARMONY_TOKENS || [];
const COLOR_GROUPS = ['Primitives', 'Semantic'];
const resolved = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const isColor = (n, raw) => /^#|rgb|hsl|gradient/.test(raw) || (/^var\(--(teal|lime|ink|green|amber|red|orange|blue|violet|cyan|pink|indigo|mint|yellow|leaf)/.test(raw)) || /-(fg|bg|solid)$|^--(bg|text|border|action|viz|priority|brand)/.test(n);

/* ---------- Toasts + copy ---------- */
H.toast = (msg, undo) => { const t = document.createElement('div'); t.className = 'h-toast'; t.setAttribute('role', 'status'); t.innerHTML = `${ic('check')}${esc(msg)}${undo ? '<a href="#">Undo</a>' : ''}`; $('#toasts').appendChild(t); t.querySelector('a')?.addEventListener('click', e => { e.preventDefault(); t.remove(); H.toast('Undone'); }); setTimeout(() => { t.style.transition = 'opacity .2s'; t.style.opacity = 0; setTimeout(() => t.remove(), 220); }, 2600); };
H.copy = (text, label) => { const done = () => H.toast(`Copied ${label || text}`); if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallback()); else fallback(); function fallback() { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { H.toast('Copy failed'); } ta.remove(); } };
document.addEventListener('click', e => { const c = e.target.closest('[data-copy]'); if (c) { e.preventDefault(); H.copy(c.dataset.copy, c.dataset.copyLabel); } });

/* ---------- Code highlighting ---------- */
const hl = code => {
  const re = /("[^"\n]*"|'[^'\n]*'|`[^`]*`)|(\/\/[^\n]*)|(<\/?)([A-Za-z][\w.]*)|\b(import|from|const|return|export|function|npm)\b|(\s)([a-zA-Z-]+)(?==)/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    if (m[1]) out += `<span class="s">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="c">${esc(m[2])}</span>`;
    else if (m[4]) out += esc(m[3]) + `<span class="t">${esc(m[4])}</span>`;
    else if (m[5]) out += `<span class="k">${m[5]}</span>`;
    else out += m[6] + `<span class="a">${esc(m[7])}</span>`;
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
};
H.hl = hl;
const fmtHTML = html => { let d = 0; return html.replace(/>\s*</g, '>\n<').split('\n').map(l => { l = l.trim(); if (/^<\/\w/.test(l)) d = Math.max(0, d - 1); const out = '  '.repeat(d) + l; if (/^<\w[^>]*[^/]>$/.test(l) && !/^<(input|img|br|hr|use|i)\b/.test(l) && !/<\/\w+>$/.test(l)) d++; return out; }).join('\n'); };
const codeBlock = (id, tabs, active) => `<div class="code-wrap" id="${id}"><div class="code-bar"><div class="seg">${tabs.map(t => `<button data-ct="${t[0]}" class="${t[0] === active ? 'on' : ''}">${t[0]}</button>`).join('')}</div><button class="copy-btn" data-act="copy-code">${ic('copy')}Copy</button></div><pre class="code">${hl(tabs.find(t => t[0] === active)[1])}</pre></div>`;
const wireCode = (root, tabs, onTab) => { let cur = root.querySelector('.seg .on')?.dataset.ct; root.querySelectorAll('[data-ct]').forEach(b => b.addEventListener('click', () => { cur = b.dataset.ct; root.querySelectorAll('[data-ct]').forEach(x => x.classList.toggle('on', x === b)); root.querySelector('pre').innerHTML = hl(tabs().find(t => t[0] === cur)[1]); onTab && onTab(cur); })); root.querySelector('[data-act=copy-code]').addEventListener('click', () => H.copy(tabs().find(t => t[0] === cur)[1], cur + ' code')); };

/* ---------- Library of generated components ---------- */
let generated = AI.load();
const allComps = () => [...H.registry, ...generated];
const findComp = id => allComps().find(c => c.id === id);

/* ---------- Sidebar ---------- */
const FOUND = [['color', 'Color', 'palette'], ['typography', 'Typography', 'type'], ['spacing', 'Spacing & layout', 'grid'], ['radius', 'Radius & elevation', 'box'], ['icons', 'Icons', 'sparkle']];
const renderSide = () => {
  const r = location.hash || '#/';
  const link = (href, label, icon, cls = '') => `<a href="${href}" class="${cls}${r === href ? ' on' : ''}">${icon ? ic(icon) : ''}${label}</a>`;
  side.innerHTML = `<div class="pg-brand"><img src="orchestry-logo.png" alt=""><div><b>Harmony</b><span>Orchestry design system · v2.2</span></div></div>
<button class="pg-search-btn" data-act="search">${ic('search')}<span class="grow">Search</span><span class="kbd">⌘K</span></button>
<h6>Start</h6>${link('#/', 'Overview', 'home')}${link('#/ai', 'AI Studio', 'wand', 'ai')}
<h6>Foundations</h6>${FOUND.map(([k, l, i]) => link('#/foundations/' + k, l, i)).join('')}
${H.groups.map(g => { const cs = H.registry.filter(c => c.group === g); return cs.length ? `<h6>${g}<span>${cs.length}</span></h6>${cs.map(c => link('#/component/' + c.id, c.name, '', 'sub')).join('')}` : ''; }).join('')}
<h6>Made with AI<span>${generated.length}</span></h6>${generated.length ? generated.map(c => `<a href="#/generated/${c.id}" class="sub${r === '#/generated/' + c.id ? ' on' : ''}"><span class="gen-dot"></span>${esc(c.name)}</a>`).join('') : `<a href="#/ai" class="sub" style="color:var(--text-secondary)">Nothing yet: try AI Studio</a>`}`;
  side.querySelectorAll('a.sub').forEach(a => a.style.paddingLeft = '');
  $('[data-act=search]', side).addEventListener('click', openSearch);
  side.querySelector('a.on')?.scrollIntoView({ block: 'nearest' });
};

/* ---------- Router ---------- */
const routes = [];
const route = (re, fn) => routes.push([re, fn]);
const fitThumbs = root => root.querySelectorAll('.comp-tile .thumb > div').forEach(el => {
  const box = el.parentElement, wide = el.classList.contains('wide');
  el.style.zoom = 1;
  const w = wide ? 600 : el.scrollWidth, hgt = el.scrollHeight;
  el.style.zoom = Math.min(.78, (box.clientWidth - 24) / w, (box.clientHeight - 16) / hgt);
});
const go = () => {
  const h = location.hash.slice(1) || '/';
  renderSide();
  for (const [re, fn] of routes) { const m = h.match(re); if (m) { fn(...m.slice(1)); fitThumbs(view); window.scrollTo(0, 0); return; } }
  view.innerHTML = `<div class="pg-empty">Page not found. <a href="#/">Go to overview</a></div>`;
};
H.refreshSide = () => { generated = AI.load(); renderSide(); };
H.go = go;

/* ---------- Overview ---------- */
route(/^\/$/, () => {
  const total = H.registry.length;
  const featured = ['button', 'risk-badge', 'score-card', 'data-table', 'ai-insight', 'stat-card', 'tabs', 'select', 'callout', 'metric-card', 'empty-state', 'donut'];
  view.innerHTML = `<div class="ov-hero"><div style="font:var(--type-overline);letter-spacing:var(--track-overline);text-transform:uppercase;color:var(--teal-200);margin-bottom:12px">Orchestry · Harmony design system</div><h1>One source of truth, <em>built and kept alive with AI.</em></h1><p>Every color, size and component Orchestry ships, in one place. Play with each part, read its rules, copy the code, or describe something new and let AI build it from Harmony.</p><div style="display:flex;gap:8px;margin-top:24px"><a class="h-btn primary lg" href="#/ai" style="background:#fff;color:var(--ink-900)">${ic('wand')}Make a component with AI</a><a class="h-btn lg" href="#/component/button" style="color:#fff;border-color:rgba(255,255,255,.25)">Browse components</a></div>
<div class="ov-stats"><div><b>${TOK.length}</b><span>design tokens</span></div><div><b>${total}</b><span>live components</span></div><div><b>${TOK.filter(t => t[0].startsWith('--type-')).length}</b><span>type styles</span></div><div><b>0</b><span>hard-coded colors</span></div><div><b>AA</b><span>contrast, checked</span></div></div></div>
<div class="ov-cards">
  <a class="ov-card" href="#/foundations/color"><div class="h-tile" style="background:var(--teal-50);color:var(--teal-700)">${ic('palette', 'ic-lg')}</div><b>Foundations</b><p>Color, type, spacing, radius, layout and icons. Click any value to copy it.</p></a>
  <a class="ov-card" href="#/component/button"><div class="h-tile" style="background:var(--agent-studio-bg);color:var(--agent-studio-fg)">${ic('box', 'ic-lg')}</div><b>Components</b><p>Switch variants and states live, read the do’s and don’ts, copy React or HTML.</p></a>
  <a class="ov-card ai" href="#/ai"><div class="h-tile" style="background:var(--brand-gradient);color:#fff">${ic('sparkle', 'ic-lg')}</div><b>AI Studio</b><p>Describe a component in plain words. AI builds it from Harmony, writes its rules and checks contrast.</p></a>
</div>
<div class="sec"><h3>Components</h3><p>Every tile is the real component, rendered live from the same CSS developers use.</p>
<div class="comp-grid">${featured.map(id => { const c = findComp(id), p = defaults(c), html = c.render(p), wide = /class="[^"]*\bfit\b/.test(html); return `<a class="comp-tile" href="#/component/${id}"><div class="thumb"><div class="${wide ? 'wide' : ''}">${html}</div></div><div class="meta"><b>${c.name}</b><span>${c.group}</span></div></a>`; }).join('')}</div></div>
<div class="sec"><h3>How Harmony stays one source of truth</h3><p>The same tokens feed Figma variables, the Mantine theme and this site. Change a token once and every place updates.</p>
<div class="panel" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">${[['palette', 'Tokens', 'orchestry-tokens.json → CSS + Figma variables'], ['code', 'Code', 'Mantine theme + @orchestry/harmony'], ['book', 'Rules', 'harmony.rules.md: read by people and AI'], ['wand', 'AI', 'Builds new parts only from the above']].map(([i, t, s], n) => `<div style="display:flex;gap:12px;align-items:flex-start">${n ? `<span style="color:var(--text-disabled);margin-top:8px;margin-left:-12px">${ic('right')}</span>` : ''}<div class="h-tile sm" style="background:var(--teal-50);color:var(--teal-700)">${ic(i)}</div><div><b style="font:var(--type-heading-s)">${t}</b><div style="font:var(--type-caption);color:var(--text-secondary);margin-top:2px">${s}</div></div></div>`).join('')}</div></div>`;
});
const defaults = c => Object.fromEntries(c.controls.map(x => [x.k, x.d]));
H.defaults = defaults;

/* ---------- Workbench: stage + controls + live code (shared by components and AI) ---------- */
const lab = x => x.l || cap(x.k).replace(/([a-z])([A-Z])/g, '$1 $2');
const ctrlHTML = (x, v) => {
  if (x.t === 'seg') return `<div class="ctrl-row"><div class="lab">${lab(x)}<span>${x.k}</span></div><div class="seg full">${x.o.map(o => `<button data-k="${x.k}" data-v="${esc(o)}" class="${String(o) === String(v) ? 'on' : ''}">${esc(cap(String(o)))}</button>`).join('')}</div></div>`;
  if (x.t === 'select') return `<div class="ctrl-row"><label>${lab(x)}<span>${x.k}</span></label><select class="pg-input" data-k="${x.k}">${x.o.map(o => `<option value="${esc(o)}"${String(o) === String(v) ? ' selected' : ''}>${esc(cap(String(o)))}</option>`).join('')}</select></div>`;
  if (x.t === 'bool') return `<div class="ctrl-row inline"><label>${lab(x)}</label><button class="tgl${v ? ' on' : ''}" data-k="${x.k}" role="switch" aria-checked="${!!v}" aria-label="${lab(x)}"></button></div>`;
  if (x.t === 'range') return `<div class="ctrl-row"><label>${lab(x)}<span data-out="${x.k}">${v}</span></label><input type="range" data-k="${x.k}" min="${x.min ?? 0}" max="${x.max ?? 100}" value="${v}"></div>`;
  return `<div class="ctrl-row"><label>${lab(x)}<span>${x.k}</span></label><input class="pg-input" data-k="${x.k}" value="${esc(v)}"></div>`;
};
const workbench = (mount, c, opts = {}) => {
  let p = Object.assign(defaults(c), opts.params || {}), bg = 'dots', all = false;
  const mx = c.controls.find(x => x.t === 'seg' || x.t === 'select');
  mount.innerHTML = `<div class="play"><div><div class="stage"><div class="stage-bar"><div class="l"><span class="live-dot"></span>Live preview · click it, it works</div><div style="display:flex;gap:8px;align-items:center">${mx ? `<label class="engine" style="cursor:pointer"><button class="tgl" data-act="all" role="switch" aria-label="Show all ${lab(mx)} options"></button>All ${lab(mx).toLowerCase()}s</label>` : ''}<div class="seg">${['dots', 'plain', 'surface'].map(b => `<button data-bg="${b}" class="${b === bg ? 'on' : ''}">${cap(b)}</button>`).join('')}</div><button class="h-icon-btn ghost sm" data-act="reset" title="Reset">${ic('refresh')}</button></div></div><div class="canvas dots" data-canvas></div></div>
  <div data-code></div></div>
  <div class="ctrl"><div class="ctrl-h">Properties<span class="chip">${c.controls.length}</span></div><div class="ctrl-b">${c.controls.map(x => ctrlHTML(x, p[x.k])).join('') || '<div class="pg-empty">No properties</div>'}</div></div></div>`;
  const canvas = $('[data-canvas]', mount), ctrl = $('.ctrl-b', mount), codeEl = $('[data-code]', mount);
  let codeTab = 'React';
  const htmlNow = () => fmtHTML(c.render(p).replace(/\s*data-[a-z]+="[^"]*"/g, ''));
  const tabs = () => [['React', c.react(p)], ['HTML', htmlNow()]];
  const draw = () => {
    if (all && mx) {
      const n = mx.o.length, cols = c.render(p).includes('class="fit') ? Math.min(n, 2) : Math.min(n, 4);
      canvas.innerHTML = `<div class="matrix" style="grid-template-columns:repeat(${cols},1fr)">${mx.o.map(o => `<div class="cell"><span class="lbl">${mx.k}="${esc(o)}"</span>${c.render({ ...p, [mx.k]: o })}</div>`).join('')}</div>`;
    } else { canvas.innerHTML = c.render(p); c.wire && c.wire(canvas, p, set); }
    codeEl.innerHTML = codeBlock('cw', tabs(), codeTab);
    wireCode(codeEl.firstElementChild, tabs, t => codeTab = t);
    opts.onChange && opts.onChange(p, canvas);
  };
  const sync = () => c.controls.forEach(x => {
    const v = p[x.k];
    if (x.t === 'seg') $$(`[data-k="${x.k}"]`, ctrl).forEach(b => b.classList.toggle('on', b.dataset.v === String(v)));
    else if (x.t === 'bool') { const t = $(`[data-k="${x.k}"]`, ctrl); t.classList.toggle('on', !!v); t.setAttribute('aria-checked', !!v); }
    else { const i = $(`[data-k="${x.k}"]`, ctrl); if (i && document.activeElement !== i) i.value = v; const o = $(`[data-out="${x.k}"]`, ctrl); if (o) o.textContent = v; }
  });
  function set(part) { Object.assign(p, part); sync(); draw(); }
  const typed = (x, v) => x.t === 'range' ? +v : (typeof x.d === 'number' && !isNaN(+v) && v !== '' ? +v : v);
  ctrl.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b || b.tagName === 'SELECT' || b.tagName === 'INPUT') return; const x = c.controls.find(y => y.k === b.dataset.k); set({ [x.k]: x.t === 'bool' ? !p[x.k] : typed(x, b.dataset.v) }); });
  ctrl.addEventListener('input', e => { const i = e.target.closest('[data-k]'); if (!i) return; const x = c.controls.find(y => y.k === i.dataset.k); set({ [x.k]: typed(x, i.value) }); });
  $$('[data-bg]', mount).forEach(b => b.addEventListener('click', () => { bg = b.dataset.bg; $$('[data-bg]', mount).forEach(y => y.classList.toggle('on', y === b)); canvas.className = 'canvas ' + bg; }));
  $('[data-act=all]', mount)?.addEventListener('click', e => { all = !all; e.currentTarget.classList.toggle('on', all); draw(); });
  $('[data-act=reset]', mount).addEventListener('click', () => { p = defaults(c); sync(); draw(); H.toast('Reset to defaults'); });
  draw();
  return { get: () => p, set };
};
H.workbench = workbench;

/* ---------- Rules / tokens / code panels ---------- */
const li = a => (a || []).map(x => `<li>${esc(x).replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`).join('');
const rulesHTML = c => { const r = c.rules || {}; return `<div class="rules">
  <div class="rule-card"><h4><span class="badge-ic" style="background:var(--teal-50);color:var(--teal-700)">${ic('check', 'ic-sm')}</span>Use it when</h4><ul class="do">${li(r.when)}</ul></div>
  <div class="rule-card"><h4><span class="badge-ic" style="background:var(--bg-hover);color:var(--text-secondary)">${ic('x', 'ic-sm')}</span>Use something else when</h4><ul>${li(r.whenNot)}</ul></div>
  <div class="rule-card do"><h4>Do</h4><ul>${li(r.do)}</ul></div>
  <div class="rule-card dont"><h4>Don’t</h4><ul>${li(r.dont)}</ul></div>
  <div class="rule-card a11y full"><h4><span class="badge-ic" style="background:var(--status-info-bg);color:var(--status-info-fg)">${ic('eye', 'ic-sm')}</span>Accessibility</h4><ul>${li(r.a11y)}</ul></div>
  ${c.anatomy?.length ? `<div class="rule-card full"><h4><span class="badge-ic" style="background:var(--agent-studio-bg);color:var(--agent-studio-fg)">${ic('layers', 'ic-sm')}</span>Anatomy & specs</h4><div class="anat">${c.anatomy.map(([a, b]) => `<div>${esc(a)}<span>${esc(b)}</span></div>`).join('')}</div></div>` : ''}</div>`; };
const tokColor = (n, v) => /^(#|rgb|hsl|linear-gradient)/.test(v) && !/^--(shadow|font|type)/.test(n);
const tokRow = n => { n = n.startsWith('--') ? n : '--' + n; const v = resolved(n), raw = (TOK.find(t => t[0] === n) || [])[1] || v; return `<tr data-copy="var(${n})" data-copy-label="${n}"><td>${tokColor(n, v) ? `<span class="sw-mini" style="background:var(${n})"></span>` : ''}<code>${n}</code></td><td style="color:var(--text-secondary)">${esc(raw !== v ? raw : '')}</td><td class="mono" style="font-size:12px">${esc(v || '-')}</td></tr>`; };
const tokensHTML = c => `<table class="tok-table"><thead><tr><th>Token</th><th>Points to</th><th>Value</th></tr></thead><tbody>${(c.tokens || []).map(tokRow).join('')}</tbody></table><p style="font:var(--type-caption);color:var(--text-secondary);margin-top:8px">Click a row to copy <code>var(--token)</code>. Values are read live from <code>orchestry-tokens.css</code>.</p>`;
const figmaProps = c => `// Figma component properties: ${c.name}\n` + c.controls.map(x => x.t === 'bool' ? `${lab(x)}: Boolean = ${x.d}` : x.t === 'text' ? `${lab(x)}: Text = "${x.d}"` : x.t === 'range' ? `${lab(x)}: Number (${x.min}–${x.max}) = ${x.d}` : `${lab(x)}: Variant = ${x.o.join(' | ')}  // default ${x.d}`).join('\n');
const codeTabs = c => { const d = defaults(c); return [['React', `import { ${H.pascal(c.id)} } from '@orchestry/harmony';\n\n` + c.react(d)], ['HTML', fmtHTML(c.render(d).replace(/\s*data-[a-z]+="[^"]*"/g, ''))], ['Figma', figmaProps(c)], ['Install', `npm i @orchestry/harmony @mantine/core\n\n// main.tsx\nimport '@orchestry/harmony/tokens.css';\nimport { MantineProvider } from '@mantine/core';\nimport { harmonyTheme } from '@orchestry/harmony/mantine';\n\n<MantineProvider theme={harmonyTheme}><App /></MantineProvider>`]]; };

/* ---------- Component page ---------- */
const compPage = (c, gen) => {
  const i = H.registry.indexOf(c), prev = H.registry[i - 1], next = H.registry[i + 1];
  view.innerHTML = `<div class="pg-crumb"><a href="#/">Harmony</a>${ic('right', 'ic-sm')}${gen ? 'Made with AI' : 'Components'}${ic('right', 'ic-sm')}${esc(c.group)}</div>
<div class="pg-head"><div><h1>${esc(c.name)}</h1><p>${esc(c.desc)}</p></div><div class="pg-chips">${gen ? `<span class="chip ai">${ic('sparkle', 'ic-sm')}${c.engine === 'claude' ? 'Made by Claude' : 'Made by Harmony AI'}</span>` : `<span class="chip ok">${ic('check', 'ic-sm')}Ready</span>`}<span class="chip m">${esc(c.mantine)}</span><span class="chip">${c.controls.length} properties</span><span class="chip">${(c.tokens || []).length} tokens</span></div></div>
${gen ? `<div class="h-note info" style="margin-bottom:24px">${ic('sparkle')}<div><b>Your request:</b> “${esc(c.prompt)}”${c.builtFrom?.length ? ` · Built from ${c.builtFrom.map(esc).join(', ')}` : ''}</div><div style="margin-left:auto;display:flex;gap:8px"><a class="h-btn secondary sm" href="#/ai?p=${encodeURIComponent(c.prompt)}">${ic('refresh')}Remix</a><button class="h-btn danger sm" data-act="del">${ic('trash')}Delete</button></div></div>` : ''}
<div class="h-tabs pg-tabs" role="tablist">${['Playground', 'Rules', 'Code', 'Tokens'].map((t, n) => `<button class="h-tab${n ? '' : ' on'}" role="tab" data-tab="${t}">${t}</button>`).join('')}</div><div data-panel></div>
${!gen && prev || next ? `<div style="display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:1px solid var(--border-default)">${prev && !gen ? `<a href="#/component/${prev.id}" class="h-btn secondary">${ic('left')}${prev.name}</a>` : '<span></span>'}${next && !gen ? `<a href="#/component/${next.id}" class="h-btn secondary">${next.name}${ic('right')}</a>` : ''}</div>` : ''}`;
  const panel = $('[data-panel]', view);
  const show = t => {
    $$('[data-tab]', view).forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    if (t === 'Playground') workbench(panel, c);
    if (t === 'Rules') panel.innerHTML = rulesHTML(c);
    if (t === 'Tokens') panel.innerHTML = tokensHTML(c);
    if (t === 'Code') { const tb = codeTabs(c); panel.innerHTML = codeBlock('cc', tb, 'React').replace('code-wrap"', 'code-wrap" style="margin-top:0"'); wireCode(panel.firstElementChild, () => tb); }
  };
  $$('[data-tab]', view).forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
  $('[data-act=del]', view)?.addEventListener('click', () => { AI.remove(c.id); H.refreshSide(); H.toast(`Deleted ${c.name}`); location.hash = '#/ai'; });
  show('Playground');
};
route(/^\/component\/([\w-]+)$/, id => { const c = H.registry.find(x => x.id === id); c ? compPage(c) : view.innerHTML = '<div class="pg-empty">No component with that name.</div>'; });
route(/^\/generated\/([\w-]+)$/, id => { const c = generated.find(x => x.id === id); c ? compPage(c, true) : view.innerHTML = '<div class="pg-empty">This AI component was deleted. <a href="#/ai">Make a new one</a></div>'; });

/* ---------- Foundations ---------- */
const fHead = (t, d, chips = '') => `<div class="pg-crumb"><a href="#/">Harmony</a>${ic('right', 'ic-sm')}Foundations</div><div class="pg-head"><div><h1>${t}</h1><p>${d}</p></div><div class="pg-chips">${chips}</div></div>`;
const onText = n => H.contrast(n, '#ffffff') >= 4.5 ? '#fff' : 'var(--ink-900)';
const FAM_NOTE = { teal: 'Brand · actions, links, focus', lime: 'Brand accent · highlights', leaf: 'Logo leaf', ink: 'Neutrals · text, borders, surfaces', green: 'Success · low risk', amber: 'Warning · elevated risk', yellow: 'Moderate risk', orange: 'High risk', red: 'Danger · critical only', blue: 'Info', violet: 'Copilot Studio agents', cyan: 'SharePoint agents', pink: 'Agent Builder', indigo: 'Mantine, DLP', mint: 'Connections' };
const SEM_GROUPS = [['Backgrounds', /^--bg-/], ['Text', /^--text-/], ['Borders', /^--border-/], ['Actions & focus', /^--(action|focus)/], ['Status', /^--status-/], ['Risk', /^--risk-/], ['Priority', /^--priority-/], ['Data viz', /^--viz-/], ['Agents & entities', /^--(agent|entity)-/], ['Brand', /^--brand/]];
route(/^\/foundations\/color$/, () => {
  const fams = {}; TOK.filter(t => t[2] === 'Primitives').forEach(([n]) => { const m = n.slice(2).match(/^(.*)-(\d+)$/); (fams[m[1]] = fams[m[1]] || []).push(n); });
  const sem = TOK.filter(t => t[2] === 'Semantic'), colorToks = [...sem.filter(t => !/gradient/.test(t[1]) && t[0] !== '--focus-ring'), ...TOK.filter(t => t[2] === 'Primitives')].map(t => t[0]);
  view.innerHTML = fHead('Color', 'Two layers. <b>Primitives</b> are the raw paint. <b>Semantic</b> tokens say what a color is for, and they are the only colors components are allowed to use. Click any swatch to copy it.', `<span class="chip">${TOK.filter(t => t[2] === 'Primitives').length} primitives</span><span class="chip">${sem.length} semantic</span><span class="chip ok">${ic('check', 'ic-sm')}AA checked</span>`) + `
<div class="sec"><h3>Brand</h3><p>Teal is Orchestry. Lime is the spark. The gradient appears once per screen, at most.</p><div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px">
<div class="sw" data-copy="var(--brand-gradient)" data-copy-label="--brand-gradient" style="height:120px;background:var(--brand-gradient);color:#fff;font-size:12px"><b style="font:var(--type-heading-m)">Brand gradient</b>--brand-gradient</div>
${['--teal-700', '--teal-500', '--lime-400'].map(n => `<div class="sw" data-copy="var(${n})" data-copy-label="${n}" style="height:120px;background:var(${n});color:${onText(n)};font-size:12px"><b style="font:var(--type-heading-m)">${cap(n.slice(2).split('-')[0])} ${n.split('-').pop()}</b>${n} · ${H.hex(n)}</div>`).join('')}</div></div>
<div class="sec"><h3>Primitives</h3><p>Fifteen families. Never use these in a component directly; go through a semantic token.</p><div class="panel">${Object.entries(fams).map(([f, ns]) => `<div class="ramp"><div class="ramp-name">${cap(f)}<span>${FAM_NOTE[f] || ''}</span></div>${ns.map(n => `<div class="sw" title="${n}" data-copy="var(${n})" data-copy-label="${n}" style="background:var(${n});color:${onText(n)}">${n.split('-').pop()}<span style="opacity:.75">${H.hex(n).slice(1)}</span></div>`).join('')}</div>`).join('')}</div></div>
<div class="sec"><h3>Semantic</h3><p>Named by job, not by look. Change <code>--action-primary</code> once and every button follows.</p>${SEM_GROUPS.map(([g, re]) => { const ts = sem.filter(t => re.test(t[0])); return ts.length ? `<h4 style="font:var(--type-heading-s);margin:20px 0 8px">${g}<span style="color:var(--text-secondary);font-weight:400"> · ${ts.length}</span></h4><div class="sem-grid">${ts.map(([n, raw]) => `<div class="sem" data-copy="var(${n})" data-copy-label="${n}"><i style="background:var(${n})"></i><div style="min-width:0"><b>${n}</b><span>${esc(raw.replace(/var\(--([^)]+)\)/g, '$1'))}</span></div></div>`).join('')}</div>` : ''; }).join('')}</div>
<div class="sec"><h3>Contrast checker</h3><p>Pick any two Harmony colors. Text needs 4.5:1 (AA); large text and icons need 3:1.</p><div class="cc"><div class="cc-prev" data-cc-prev><div class="big">Agent risk is High</div><div>Review 12 agents before Friday.</div></div><div class="panel" style="display:flex;flex-direction:column;gap:16px">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="ctrl-row"><label>Text</label><select class="pg-input" data-cc="fg">${colorToks.map(n => `<option${n === '--risk-high-fg' ? ' selected' : ''}>${n}</option>`).join('')}</select></div><div class="ctrl-row"><label>Background</label><select class="pg-input" data-cc="bg">${colorToks.map(n => `<option${n === '--risk-high-bg' ? ' selected' : ''}>${n}</option>`).join('')}</select></div></div>
<div style="display:flex;align-items:flex-end;gap:16px"><div class="cc-ratio" data-cc-ratio></div><div data-cc-badges style="display:flex;gap:6px;padding-bottom:10px"></div></div><button class="h-btn secondary sm" data-act="swap" style="align-self:flex-start">${ic('refresh')}Swap</button></div></div></div>`;
  const fg = $('[data-cc=fg]'), bg = $('[data-cc=bg]');
  const upd = () => { const r = H.contrast(fg.value, bg.value), prev = $('[data-cc-prev]'); prev.style.color = `var(${fg.value})`; prev.style.background = `var(${bg.value})`; $('[data-cc-ratio]').textContent = r.toFixed(2) + ':1'; $('[data-cc-badges]').innerHTML = [['AA text', 4.5], ['AAA text', 7], ['AA large', 3]].map(([l, m]) => H.badge(r >= m ? 'success' : 'danger', `${r >= m ? 'Pass' : 'Fail'} · ${l}`)).join(''); };
  fg.onchange = bg.onchange = upd; $('[data-act=swap]').onclick = () => { [fg.value, bg.value] = [bg.value, fg.value]; upd(); }; upd();
});
const TYPE_USE = { display: 'Page titles', 'metric-l': 'Hero numbers', 'metric-m': 'KPI values', 'heading-l': 'Section titles', 'heading-m': 'Card titles', 'heading-s': 'Small headings, table heads', 'body-m': 'Default text', 'body-s': 'Dense text, tables', caption: 'Helper text, meta', label: 'Form labels, badges', button: 'Buttons', overline: 'Eyebrows (uppercase)' };
route(/^\/foundations\/typography$/, () => {
  const ts = TOK.filter(t => t[0].startsWith('--type-'));
  view.innerHTML = fHead('Typography', 'One family, Lexend, in three weights. Each style is a single token that sets weight, size and line height together, so text can’t drift. Type in any sample to try your own words.', `<span class="chip">${ts.length} styles</span><span class="chip">Lexend · JetBrains Mono</span><span class="chip">4px baseline</span>`) + `
<div class="sec"><div class="panel" style="display:grid;grid-template-columns:1.4fr 1fr;gap:32px;align-items:center"><div><div style="font:500 96px/1 var(--font-sans);letter-spacing:-3px;background:var(--brand-gradient);-webkit-background-clip:text;background-clip:text;color:transparent">Aa</div><div style="font:var(--type-heading-l);margin-top:12px">Lexend</div><div style="font:var(--type-body-s);color:var(--text-secondary)">Made for reading speed. Wide letters help people scan risk tables fast.</div></div><div style="display:flex;flex-direction:column;gap:8px">${['regular', 'medium', 'semibold'].map(w => `<div data-copy="var(--weight-${w})" data-copy-label="--weight-${w}" style="cursor:copy;font:var(--type-heading-m);font-weight:var(--weight-${w});display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle)">${cap(w)} <span class="mono" style="font-size:12px;color:var(--text-secondary)">--weight-${w} · ${resolved('--weight-' + w)}</span></div>`).join('')}<div style="font:400 13px/20px var(--font-mono);color:var(--text-secondary);padding-top:4px">JetBrains Mono · for code and IDs</div></div></div></div>
<div class="sec"><h3>Type scale</h3><p>Click the name to copy the token.</p><div class="panel" style="padding:8px 24px">${ts.map(([n, raw]) => { const k = n.slice(7), tr = TOK.find(t => t[0] === '--track-' + k); return `<div class="type-row" style="cursor:default"><div data-copy="var(${n})" data-copy-label="${n}" style="cursor:copy"><div class="tn">${n}</div><div class="tu">${TYPE_USE[k] || ''}</div></div><div contenteditable="true" spellcheck="false" style="font:var(${n});${tr ? `letter-spacing:var(${tr[0]});` : ''}${k === 'overline' ? 'text-transform:uppercase;' : ''}outline:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${/metric/.test(k) ? '1,284 agents' : k === 'display' ? 'Agents & AI' : 'Review high-risk agents'}</div><div class="ts">${raw.replace(' var(--font-sans)', '')}${tr ? ` · ${tr[1]}` : ''}</div></div>`; }).join('')}</div></div>`;
});
route(/^\/foundations\/spacing$/, () => {
  const sp = TOK.filter(t => t[2] === 'Spacing'), lay = TOK.filter(t => t[2] === 'Layout');
  view.innerHTML = fHead('Spacing & layout', 'Everything sits on a 4px grid. Small steps for inside components, big steps between sections. Named aliases like <code>--inset-card</code> say what a space is for.', `<span class="chip">4px base</span><span class="chip">12 columns</span><span class="chip">${sp.length + lay.length} tokens</span>`) + `
<div class="sec"><h3>Spacing scale</h3><p>Click a row to copy.</p><div class="panel">${sp.map(([n, raw]) => { const v = resolved(n); return `<div class="space-row" data-copy="var(${n})" data-copy-label="${n}"><code class="mono" style="font-size:12px">${n}</code><span style="font:var(--type-caption);color:var(--text-secondary)">${raw.startsWith('var') ? raw.slice(6, -1) : v}</span><div><div class="space-bar" style="width:calc(${v || '0px'} * 4);min-width:2px"></div></div></div>`; }).join('')}</div></div>
<div class="sec"><h3>Try it: card padding</h3><p>Drag to change the inside of a card. Harmony cards use <code>--inset-card</code> (20px); big cards use <code>--inset-card-lg</code>.</p><div class="panel" style="display:grid;grid-template-columns:260px 1fr;gap:32px;align-items:center"><div class="ctrl-row"><label>Padding<span data-sp-out>--space-5 · 20px</span></label><input type="range" min="0" max="12" value="7" data-sp></div><div style="background:var(--bg-page);border-radius:var(--radius-lg);padding:24px;display:flex;justify-content:center"><div class="h-card" data-sp-card style="width:320px;background:repeating-linear-gradient(45deg,var(--teal-50),var(--teal-50) 4px,var(--bg-surface) 4px,var(--bg-surface) 8px)"><div style="background:var(--bg-surface);border:1px dashed var(--teal-300);border-radius:var(--radius-sm);padding:12px"><div style="font:var(--type-heading-s)">HR Policy Assistant</div><div style="font:var(--type-caption);color:var(--text-secondary)">Copilot Studio · Contoso Prod</div></div></div></div></div></div>
<div class="sec"><h3>Grid</h3><p>12 columns with a <code>--layout-gutter</code> of 12px, inside a page that tops out at 1200px.</p><div class="panel"><div class="grid-demo">${Array.from({ length: 12 }, (_, i) => `<div>${i + 1}</div>`).join('')}</div><div class="grid-demo" style="margin-top:8px">${[[3, 'KPI'], [3, 'KPI'], [3, 'KPI'], [3, 'KPI'], [8, 'Table'], [4, 'Insight']].map(([s, l]) => `<div style="grid-column:span ${s};height:56px">${l} · ${s}</div>`).join('')}</div></div></div>
<div class="sec"><h3>Layout tokens</h3><table class="tok-table"><thead><tr><th>Token</th><th>Points to</th><th>Value</th></tr></thead><tbody>${lay.map(t => tokRow(t[0])).join('')}</tbody></table></div>`;
  const steps = sp.filter(t => !t[1].startsWith('var')), r = $('[data-sp]'); r.max = steps.length - 1;
  r.value = steps.findIndex(t => t[0] === '--space-5');
  r.oninput = () => { const [n, v] = steps[r.value]; $('[data-sp-card]').style.padding = `var(${n})`; $('[data-sp-out]').textContent = `${n} · ${v}`; }; r.oninput();
});
route(/^\/foundations\/radius$/, () => {
  const rad = TOK.filter(t => t[2] === 'Radius'), sh = TOK.filter(t => t[2] === 'Elevation'), mo = TOK.filter(t => t[2] === 'Motion'), z = TOK.filter(t => t[2] === 'Z-Index');
  const card = (st, n, sub) => `<div data-copy="var(${n})" data-copy-label="${n}" style="cursor:copy;text-align:center"><div style="height:96px;background:var(--bg-surface);border:1px solid var(--border-default);margin-bottom:12px;${st}"></div><code class="mono" style="font-size:12px">${n}</code><div style="font:var(--type-caption);color:var(--text-secondary)">${sub}</div></div>`;
  const RU = { xs: 'Tags, kbd', sm: 'Badges, small buttons', md: 'Buttons, inputs', lg: 'Cards, tables', xl: 'Modals, hero', full: 'Pills, avatars' }, SU = { xs: 'Buttons, inputs', sm: 'Hover cards', md: 'Menus, popovers', lg: 'Modals' };
  view.innerHTML = fHead('Radius, elevation & motion', 'Soft corners, quiet shadows, quick motion. Most of the product is flat; shadows only show that something floats above the page.', `<span class="chip">${rad.length} radii</span><span class="chip">${sh.length} shadows</span><span class="chip">${mo.length} motion</span>`) + `
<div class="sec"><h3>Radius</h3><div class="panel" style="display:grid;grid-template-columns:repeat(6,1fr);gap:20px">${rad.map(([n, v]) => card(`border-radius:var(${n});background:var(--teal-50);border-color:var(--teal-200)`, n, `${v} · ${RU[n.slice(9)]}`)).join('')}</div></div>
<div class="sec"><h3>Elevation</h3><div class="panel" style="display:grid;grid-template-columns:repeat(4,1fr);gap:28px;background:var(--bg-page)">${sh.map(([n]) => card(`border-radius:var(--radius-lg);box-shadow:var(${n});border-color:transparent`, n, SU[n.slice(9)])).join('')}</div></div>
<div class="sec"><h3>Motion</h3><p>Click a row to watch it. Things move fast and settle softly.</p><div class="panel" style="display:flex;flex-direction:column;gap:12px">${mo.filter(t => t[0].startsWith('--duration')).map(([n, v]) => `<div data-mo="${n}" style="display:grid;grid-template-columns:180px 1fr;gap:16px;align-items:center;cursor:pointer"><div><code class="mono" style="font-size:12px">${n}</code><div style="font:var(--type-caption);color:var(--text-secondary)">${v} · ${{ fast: 'Hover, toggles', base: 'Menus, tabs', slow: 'Modals, toasts' }[n.split('-').pop()]}</div></div><div style="background:var(--bg-subtle);border-radius:var(--radius-full);height:28px;position:relative"><i style="position:absolute;left:2px;top:2px;width:24px;height:24px;border-radius:50%;background:var(--action-primary);transition:left var(${n}) var(--ease-standard)"></i></div></div>`).join('')}<div style="font:var(--type-caption);color:var(--text-secondary)">Easing: <code class="mono">--ease-standard</code> · ${resolved('--ease-standard')}. Respect <code class="mono">prefers-reduced-motion</code>.</div></div></div>
<div class="sec"><h3>Layers (z-index)</h3><table class="tok-table"><thead><tr><th>Token</th><th>Points to</th><th>Value</th></tr></thead><tbody>${z.map(t => tokRow(t[0])).join('')}</tbody></table></div>`;
  $$('[data-mo]').forEach(r => r.onclick = () => { const i = $('i', r); i.style.left = i.style.left === 'calc(100% - 26px)' ? '2px' : 'calc(100% - 26px)'; });
});
route(/^\/foundations\/icons$/, () => {
  const names = $$('symbol').map(s => s.id.slice(2));
  view.innerHTML = fHead('Icons', 'One outline set, 24px grid, 1.75 stroke, drawn in <code>currentColor</code> so icons always match their text. Click an icon to copy its code.', `<span class="chip">${names.length} icons</span><span class="chip">16 · 12 · 20px</span>`) + `
<div class="sec"><div class="h-input" style="max-width:360px;margin-bottom:16px">${ic('search')}<input placeholder="Filter icons…" data-if aria-label="Filter icons"></div><div class="icons-grid">${names.map(n => `<div class="icon-cell" data-n="${n}" data-copy='<svg class="ic"><use href="#i-${n}"/></svg>' data-copy-label="${n} icon">${ic(n)}${n}</div>`).join('')}</div></div>`;
  $('[data-if]').oninput = e => $$('.icon-cell').forEach(c => c.style.display = c.dataset.n.includes(e.target.value.toLowerCase().trim()) ? '' : 'none');
});

/* ---------- Search (⌘K) ---------- */
const overlay = $('#search'), q = $('#q'), results = $('#results');
let hits = [], sel = 0;
const searchIndex = () => [
  ...allComps().map(c => ({ kind: 'Components', title: c.name, sub: `${c.group} · ${c.desc}`, href: c.group === 'Made with AI' ? '#/generated/' + c.id : '#/component/' + c.id, icon: c.icon || 'box', text: `${c.name} ${c.id} ${c.group} ${c.desc} ${c.mantine}` })),
  ...FOUND.map(([k, l, i]) => ({ kind: 'Foundations', title: l, sub: 'Foundations', href: '#/foundations/' + k, icon: i, text: l + ' ' + k })),
  { kind: 'Foundations', title: 'AI Studio', sub: 'Describe a component and let AI build it', href: '#/ai', icon: 'wand', text: 'ai studio generate create make new component claude' },
  ...TOK.map(([n, raw, g]) => ({ kind: 'Tokens', title: n, sub: `${g} · ${raw}`, copy: `var(${n})`, color: tokColor(n, resolved(n)) ? n : null, icon: 'palette', text: n + ' ' + g })),
  ...$$('symbol').map(s => s.id.slice(2)).map(n => ({ kind: 'Icons', title: n, sub: 'Icon · click to copy', copy: `<svg class="ic"><use href="#i-${n}"/></svg>`, icon: n, text: n + ' icon' })),
];
const score = (it, s) => { const t = it.title.toLowerCase(); return t === s ? 100 : t.startsWith(s) ? 80 : t.includes(s) ? 60 : it.text.toLowerCase().includes(s) ? 30 : s.split(/\s+/).every(w => it.text.toLowerCase().includes(w)) ? 20 : 0; };
const LIM = { Components: 8, Foundations: 4, Tokens: 8, Icons: 6 };
const runSearch = () => {
  const s = q.value.toLowerCase().trim(), idx = searchIndex();
  const list = s ? idx.map(it => [it, score(it, s)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).map(x => x[0]) : idx.filter(it => it.kind === 'Components').slice(0, 6).concat(idx.filter(it => it.kind === 'Foundations'));
  hits = []; const by = {};
  list.forEach(it => { by[it.kind] = by[it.kind] || []; if (by[it.kind].length < LIM[it.kind]) by[it.kind].push(it); });
  results.innerHTML = Object.keys(LIM).filter(k => by[k]).map(k => `<h6>${k}</h6>` + by[k].map(it => { hits.push(it); return `<div class="pg-res" data-i="${hits.length - 1}">${it.color ? `<span class="sw-mini" style="background:var(${it.color})"></span>` : `<span class="ico">${ic(it.icon)}</span>`}<div class="t"><b>${esc(it.title)}</b><small>${esc(it.sub)}</small></div>${it.copy ? '<span class="kbd">copy</span>' : ''}</div>`; }).join('')).join('') || `<div class="pg-empty">Nothing for “${esc(q.value)}”. <a href="#/ai?p=${encodeURIComponent(q.value)}" data-close>Make it with AI →</a></div>`;
  sel = 0; mark();
};
const mark = () => $$('.pg-res', results).forEach(r => r.classList.toggle('on', +r.dataset.i === sel)) || $('.pg-res.on', results)?.scrollIntoView({ block: 'nearest' });
const pick = i => { const it = hits[i]; if (!it) return; closeSearch(); if (it.copy) H.copy(it.copy, it.title); else location.hash = it.href; };
function openSearch() { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); q.value = ''; runSearch(); setTimeout(() => q.focus(), 0); }
function closeSearch() { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
q.addEventListener('input', runSearch);
q.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { sel = Math.min(hits.length - 1, sel + 1); mark(); e.preventDefault(); } if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); mark(); e.preventDefault(); } if (e.key === 'Enter') pick(sel); });
results.addEventListener('click', e => { if (e.target.closest('[data-close]')) return closeSearch(); const r = e.target.closest('.pg-res'); if (r) pick(+r.dataset.i); });
results.addEventListener('mousemove', e => { const r = e.target.closest('.pg-res'); if (r && +r.dataset.i !== sel) { sel = +r.dataset.i; mark(); } });
overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('open') ? closeSearch() : openSearch(); }
  else if (e.key === '/' && !typing) { e.preventDefault(); openSearch(); }
  else if (e.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
});

/* ---------- AI Studio ---------- */
const store = { get: (k, d) => localStorage.getItem('harmony.' + k) ?? d, set: (k, v) => localStorage.setItem('harmony.' + k, v) };
const wait = ms => new Promise(r => setTimeout(r, ms));
route(/^\/ai(?:\?p=(.*))?$/, pre => {
  const engine = store.get('engine', 'harmony');
  view.innerHTML = `<div class="pg-crumb"><a href="#/">Harmony</a>${ic('right', 'ic-sm')}AI Studio</div>
<div class="pg-head"><div><h1>Describe it. <span style="background:var(--brand-gradient);-webkit-background-clip:text;background-clip:text;color:transparent">Harmony builds it.</span></h1><p>Write what you need in plain words. AI reads the Harmony rules, builds the component only from our tokens and parts, writes its do’s and don’ts, and checks contrast. No drawing, no hunting for files.</p></div><div class="pg-chips"><span class="chip ai">${ic('book', 'ic-sm')}Reads harmony.rules.md</span><span class="chip">${H.registry.length} parts</span><span class="chip">${TOK.length} tokens</span></div></div>
<div class="ai-box"><textarea id="ai-q" placeholder="e.g. A card for an agent with High risk and a review button" aria-label="Describe a component">${esc(pre ? decodeURIComponent(pre) : '')}</textarea>
<div class="ai-foot"><div class="engine">${ic('bolt', 'ic-sm')}Engine<div class="seg"><button data-eng="harmony" class="${engine === 'harmony' ? 'on' : ''}">Harmony (offline)</button><button data-eng="claude" class="${engine === 'claude' ? 'on' : ''}">Claude</button></div>
<span data-claude style="display:${engine === 'claude' ? 'flex' : 'none'};gap:6px;align-items:center"><input class="pg-input" type="password" data-key placeholder="Anthropic API key" value="${esc(sessionStorage.getItem('harmony.key') || '')}" style="width:180px;height:28px"><input class="pg-input" data-model value="${esc(store.get('model', 'claude-sonnet-4-5'))}" style="width:150px;height:28px" aria-label="Model"></span></div>
<div style="display:flex;align-items:center;gap:10px"><span class="engine"><span class="kbd">⌘</span><span class="kbd">↵</span></span><button class="h-btn primary" data-act="gen">${ic('sparkle')}Generate</button></div></div></div>
<div class="ai-ideas">${AI.ideas.map(i => `<button class="ai-idea" data-idea="${esc(i)}">${ic('sparkle', 'ic-sm')}${esc(i)}</button>`).join('')}</div>
<div data-out></div>
<div class="sec" data-lib></div>
<div class="sec"><h3>How it stays on-brand</h3><p>The AI can’t invent new colors or sizes. It can only combine what Harmony already has, and every result is checked before you see it.</p><div class="ov-cards">${[['book', 'Reads the rules', 'harmony.rules.md and the token list go in with every request, so AI knows the risk scale, spacing and copy voice.'], ['layers', 'Builds from parts', 'Output is made of Harmony classes and var(--tokens) only. Anything else is removed before it renders.'], ['checks', 'Checks itself', 'Hard-coded colors, contrast, unknown classes and focus are tested on the real HTML.']].map(([i, t, s]) => `<div class="ov-card" style="cursor:default"><div class="h-tile" style="background:var(--teal-50);color:var(--teal-700)">${ic(i, 'ic-lg')}</div><b>${t}</b><p>${s}</p></div>`).join('')}</div></div>`;
  const ta = $('#ai-q'), out = $('[data-out]'), genBtn = $('[data-act=gen]');
  const lib = () => { $('[data-lib]').innerHTML = generated.length ? `<h3>Your library</h3><p>Saved here in this browser. Each one has its own page with playground, rules, code and tokens.</p><div class="comp-grid">${generated.map(c => { const html = c.render(defaults(c)); return `<a class="comp-tile" href="#/generated/${c.id}"><div class="thumb"><div class="${/class="[^"]*\bfit\b/.test(html) ? 'wide' : ''}">${html}</div></div><div class="meta"><b>${esc(c.name)}</b><span>${c.engine === 'claude' ? 'Claude' : 'Harmony AI'} · ${c.controls.length} properties</span></div></a>`; }).join('')}</div>` : ''; fitThumbs($('[data-lib]')); };
  lib();
  $$('[data-eng]').forEach(b => b.onclick = () => { store.set('engine', b.dataset.eng); $$('[data-eng]').forEach(x => x.classList.toggle('on', x === b)); $('[data-claude]').style.display = b.dataset.eng === 'claude' ? 'flex' : 'none'; });
  $('[data-key]').oninput = e => sessionStorage.setItem('harmony.key', e.target.value);
  $('[data-model]').oninput = e => store.set('model', e.target.value);
  $$('[data-idea]').forEach(b => b.onclick = () => { ta.value = b.dataset.idea; generate(); });
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); });
  genBtn.onclick = generate;
  let busy = false;
  async function generate() {
    const prompt = ta.value.trim(); if (!prompt) { ta.focus(); return H.toast('Describe a component first'); } if (busy) return; busy = true;
    const eng = store.get('engine', 'harmony');
    genBtn.classList.add('pg-loading'); genBtn.innerHTML = '<span class="spinner"></span>Building…';
    const steps = [['Reading harmony.rules.md', `${H.registry.length} components · ${TOK.length} tokens`], ['Choosing Harmony parts', ''], ['Picking tokens', ''], ['Composing variants', ''], ['Writing rules & docs', ''], ['Checking contrast & tokens', '']];
    out.innerHTML = `<div class="ai-steps">${steps.map(([t, s]) => `<div class="ai-step"><span class="s-ic"></span>${t}<small>${s}</small></div>`).join('')}</div>`;
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const els = $$('.ai-step', out), stepTo = (i, note) => { els.forEach((e, n) => { e.className = 'ai-step' + (n < i ? ' done' : n === i ? ' run' : ''); if (n < i) $('.s-ic', e).innerHTML = ic('check', 'ic-sm'); }); if (note && els[i - 1]) $('small', els[i - 1]).textContent = note; };
    let spec;
    try {
      stepTo(0); await wait(450);
      if (eng === 'claude') { const key = sessionStorage.getItem('harmony.key'); if (!key) throw new Error('Add your Anthropic API key, or switch to the Harmony engine.'); stepTo(1, 'Sent to Claude'); spec = await AI.claude(prompt, key, store.get('model', 'claude-sonnet-4-5')); }
      else spec = AI.offline(prompt);
      const html = spec.render(defaults(spec)), checks = AI.checks(html, spec.pair);
      const notes = [`${H.registry.length} components · ${TOK.length} tokens`, (spec.builtFrom || []).join(', ') || 'Harmony classes', `${spec.tokens.length} tokens`, `${spec.controls.length} properties`, `${(spec.rules.do || []).length + (spec.rules.dont || []).length} rules`, `${checks.filter(c => c.ok).length}/${checks.length} passed`];
      for (let i = 1; i <= steps.length; i++) { stepTo(i, notes[i - 1]); await wait(eng === 'claude' ? 150 : 380); }
      await wait(250); showResult(spec, checks);
    } catch (err) {
      out.innerHTML = `<div class="h-note warning" style="margin-bottom:24px">${ic('alert')}<div><b>Couldn’t build that.</b> ${esc(err.message)}</div>${eng === 'claude' ? `<button class="h-btn secondary sm" data-act="fallback" style="margin-left:auto">Use Harmony engine</button>` : ''}</div>`;
      $('[data-act=fallback]', out)?.addEventListener('click', () => { $('[data-eng=harmony]').click(); generate(); });
    } finally { busy = false; genBtn.classList.remove('pg-loading'); genBtn.innerHTML = `${ic('sparkle')}Generate`; }
  }
  function showResult(spec, checks) {
    const saved = () => generated.some(g => g.id === spec.id);
    out.innerHTML = `<div class="ai-result-head"><div><h2>${ic('sparkle', 'ic-lg')}<span contenteditable="true" spellcheck="false" data-name title="Click to rename" style="outline:none">${esc(spec.name)}</span></h2><p>${esc(spec.desc)}</p><div class="pg-chips" style="justify-content:flex-start;max-width:none;margin-top:8px">${(spec.builtFrom || []).map(b => `<span class="chip">${ic('box', 'ic-sm')}${esc(b)}</span>`).join('')}<span class="chip ai">${spec.engine === 'claude' ? 'Claude' : 'Harmony engine'}</span></div></div>
<div style="display:flex;gap:8px;flex-shrink:0"><button class="h-btn secondary" data-act="edit">${ic('refresh')}Change request</button><button class="h-btn primary" data-act="save">${ic('download')}Save to library</button></div></div>
<div class="checks">${checks.map(c => `<div class="check${c.ok ? '' : ' fail'}">${ic(c.ok ? 'check' : 'alert')}<div><b>${esc(c.t)}</b>${esc(c.s)}</div></div>`).join('')}</div>
<div data-wb></div>
<div class="sec" style="margin-top:32px"><h3>Rules it wrote</h3><p>These ship with the component, for designers, developers and the next AI request.</p>${rulesHTML(spec)}</div>`;
    workbench($('[data-wb]', out), spec);
    $('[data-name]', out).addEventListener('input', e => spec.name = e.target.textContent.trim() || spec.name);
    $('[data-act=edit]', out).onclick = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); ta.focus(); ta.select(); };
    const sb = $('[data-act=save]', out);
    sb.onclick = () => { if (saved()) { location.hash = '#/generated/' + spec.id; return; } AI.save(spec); H.refreshSide(); lib(); sb.className = 'h-btn secondary'; sb.innerHTML = `${ic('external')}Open its page`; H.toast(`Saved “${spec.name}” to your library`); };
  }
  if (pre) ta.focus();
});

/* ---------- Start ---------- */
window.addEventListener('hashchange', go);
go();
})();
