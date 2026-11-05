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
const isColor = (n, raw) => /^#|rgb|hsl|gradient/.test(raw) || (/^var\(--(teal|lime|ink|green|amber|red|orange|blue|cyan|pink|indigo)/.test(raw)) || /-(fg|bg|solid)$|^--(bg|text|border|action|viz|priority|brand)/.test(n);

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

/* ---------- Top navigation + theme ---------- */
const pgEl = $('#pg'), topnav = $('#topnav'), hdr = $('#hdr');
const NAV = [['#/', 'Home', /^\/$/], ['#/docs', 'Docs', /^\/(docs|foundations)/], ['#/components', 'Components', /^\/(components?|generated)(\/|$)/], ['#/blocks', 'Blocks', /^\/blocks/], ['#/charts', 'Charts', /^\/charts/], ['#/ai', 'Create', /^\/ai/]];
const renderNav = h => { topnav.innerHTML = NAV.map(([href, label, re]) => `<a href="${href}" class="${re.test(h) ? 'on' : ''}${href === '#/ai' ? ' ai-hover' : ''}">${href === '#/ai' ? H.comet('', true) : ''}${label}</a>`).join(''); };
const setTheme = t => { document.documentElement.dataset.theme = t; try { localStorage.setItem('harmony.theme', t); } catch (e) {} };
$('#theme').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
$('#burger').addEventListener('click', () => hdr.classList.toggle('open'));
$('[data-act=search]', hdr).addEventListener('click', () => openSearch());

/* ---------- Sidebar (Docs + Components only) ---------- */
const FOUND = [['color', 'Color'], ['typography', 'Typography'], ['spacing', 'Spacing & layout'], ['radius', 'Radius & elevation'], ['icons', 'Icons']];
const DOCS = [['#/docs', 'Introduction'], ['#/docs/installation', 'Installation'], ['#/docs/theming', 'Theming', 'Dark']];
const hasSide = h => /^\/(docs|foundations|components?|generated)(\/|$)/.test(h);
const renderSide = () => {
  const r = location.hash || '#/';
  const link = (href, label, extra = '') => `<a href="${href}" class="${r === href ? 'on' : ''}">${label}${extra}</a>`;
  side.innerHTML = `<h6>Getting started</h6>${DOCS.map(([h, l, t]) => link(h, l, t ? `<span class="tag">${t}</span>` : '')).join('')}
<h6>Foundations</h6>${FOUND.map(([k, l]) => link('#/foundations/' + k, l)).join('')}
<h6>Components</h6>${link('#/components', 'All components', `<span class="tag">${H.registry.length}</span>`)}
${H.groups.map(g => { const cs = H.registry.filter(c => c.group === g); return cs.length ? `<h6>${g}<span class="n">${cs.length}</span></h6>${cs.map(c => link('#/component/' + c.id, c.name)).join('')}` : ''; }).join('')}
<h6>Made with AI<span class="n">${generated.length}</span></h6>${generated.length ? generated.map(c => `<a href="#/generated/${c.id}" class="${r === '#/generated/' + c.id ? 'on' : ''}"><span class="gen-dot"></span>${esc(c.name)}</a>`).join('') : ''}<a href="#/ai" class="ai-hover">${H.comet()}Create with AI</a>`;
  const on = side.querySelector('a.on');
  if (on) { const sr = side.getBoundingClientRect(), or = on.getBoundingClientRect(); if (or.top < sr.top + 40 || or.bottom > sr.bottom - 60) side.scrollTop += or.top - sr.top - sr.height / 3; }
};

/* ---------- Router ---------- */
const routes = [];
const route = (re, fn) => routes.push([re, fn]);
const fitThumbs = root => root.querySelectorAll('.comp-tile .thumb > div').forEach(el => {
  const box = el.parentElement, wide = el.classList.contains('wide');
  el.style.zoom = 1;
  const w = Math.max(el.scrollWidth, el.offsetWidth), hgt = el.scrollHeight;
  el.style.zoom = Math.min(.72, (box.clientWidth - 56) / w, (box.clientHeight - 44) / hgt);
});
const go = () => {
  const h = location.hash.slice(1).split('?')[0] || '/';
  const sideOn = hasSide(h);
  pgEl.classList.toggle('no-side', !sideOn);
  hdr.classList.remove('open');
  renderNav(h);
  if (sideOn) renderSide();
  const full = location.hash.slice(1) || '/';
  for (const [re, fn] of routes) { const m = full.match(re); if (m) { fn(...m.slice(1)); fitThumbs(view); window.scrollTo(0, 0); return; } }
  view.innerHTML = `<div class="pg-empty">Page not found. <a href="#/">Go home</a></div>`;
};
H.refreshSide = () => { generated = AI.load(); if (hasSide(location.hash.slice(1))) renderSide(); };
H.go = go;
const tile = c => { const html = c.render(defaults(c)), wide = /class="[^"]*\bfit\b/.test(html); return `<div class="comp-tile" role="link" tabindex="0" aria-label="${esc(c.name)}" data-href="#/${c.engine ? 'generated' : 'component'}/${c.id}"><div class="thumb" aria-hidden="true" inert><div class="${wide ? 'wide' : ''}">${html}</div></div><div class="meta"><b>${esc(c.name)}</b><span>${c.group}</span></div></div>`; };
document.addEventListener('click', e => { const t = e.target.closest('.comp-tile[data-href]'); if (t) { e.preventDefault(); location.hash = t.dataset.href; } });
document.addEventListener('keydown', e => { const t = e.target.closest?.('.comp-tile[data-href]'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); location.hash = t.dataset.href; } });

/* ---------- Home ---------- */
route(/^\/$/, () => {
  const total = H.registry.length;
  const featured = ['button', 'risk-badge', 'score-card', 'data-table', 'ai-insight', 'stat-card', 'select', 'command-palette', 'ai-assistant', 'donut'];
  view.innerHTML = `<div class="ov-hero"><div class="glow"></div>
<a class="ov-pill ai-hover" href="#/ai">${H.aiMark()}New: create components with Orchestry AI ${ic('right', 'ic-sm')}</a>
<h1>The design system for Orchestry, <em>built and kept alive with AI.</em></h1>
<p>Tokens, components, rules and code in one place. Play with every part, read why it works the way it does, or describe something new and let AI build it from Harmony.</p>
<div class="ov-cta"><a class="h-btn light" href="#/docs">Get started</a><a class="h-btn ghost" href="#/components">View components</a></div>
<div class="ov-stats"><div><b>${TOK.length}</b><span>design tokens</span></div><div><b>${total}</b><span>live components</span></div><div><b>2</b><span>themes, one set of names</span></div><div><b>0</b><span>hard-coded colors</span></div><div><b>AA</b><span>contrast, checked</span></div></div></div>
<div class="ov-cards">
  <a class="ov-card" href="#/docs"><div class="h-tile" style="background:var(--action-primary-subtle);color:var(--text-brand)">${ic('book', 'ic-lg')}</div><b>Docs & foundations</b><p>Color, type, spacing, radius and icons, plus how to install and theme Harmony.</p></a>
  <a class="ov-card" href="#/components"><div class="h-tile" style="background:var(--agent-studio-bg);color:var(--agent-studio-fg)">${ic('box', 'ic-lg')}</div><b>Components</b><p>Switch variants and states live, read the do’s and don’ts, copy React or HTML.</p></a>
  <a class="ov-card ai ai-hover" href="#/ai">${H.aiMark()}<b>Create with AI</b><p>Describe a component in plain words. AI builds it from Harmony, writes its rules and checks contrast.</p></a>
</div>
<div class="sec"><div class="sec-head"><div><h3>Components</h3><p>Every tile is the real component, rendered live from the same CSS developers use.</p></div><a class="h-btn secondary sm" href="#/components">View all ${total}${ic('right')}</a></div>
<div class="home-grid-wrap"><div class="comp-grid home-grid">${featured.map(id => tile(findComp(id))).join('')}</div></div></div>
<div class="sec"><h3>How Harmony stays one source of truth</h3><p>The same tokens feed Figma variables, the Mantine theme and this site. Change a token once and every place updates.</p>
<div class="panel" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">${[['palette', 'Tokens', 'orchestry-tokens.json → CSS + Figma variables'], ['code', 'Code', 'Mantine theme + @orchestry/harmony'], ['book', 'Rules', 'harmony.rules.md: read by people and AI'], ['comet', 'AI', 'Builds new parts only from the above']].map(([i, t, s], n) => `<div style="display:flex;gap:12px;align-items:flex-start">${n ? `<span style="color:var(--text-disabled);margin-top:8px;margin-left:-12px">${ic('right')}</span>` : ''}${i === 'comet' ? H.aiMark() : `<div class="h-tile sm" style="background:var(--action-primary-subtle);color:var(--text-brand)">${ic(i)}</div>`}<div><b style="font:var(--type-heading-s)">${t}</b><div style="font:var(--type-caption);color:var(--text-secondary);margin-top:2px">${s}</div></div></div>`).join('')}</div></div>`;
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
  <div class="rule-card"><h4><span class="badge-ic" style="background:var(--status-success-bg);color:var(--status-success-fg)">${ic('check', 'ic-sm')}</span>Use it when</h4><ul class="do">${li(r.when)}</ul></div>
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
<div class="pg-head"><div><h1>${esc(c.name)}</h1><p>${esc(c.desc)}</p></div><div class="pg-chips">${gen ? `<span class="chip ai">${H.comet()}${c.engine === 'claude' ? 'Made by Claude' : 'Made by Harmony AI'}</span>` : `<span class="chip ok">${ic('check', 'ic-sm')}Ready</span>`}<span class="chip m">${esc(c.mantine)}</span><span class="chip">${c.controls.length} properties</span><span class="chip">${(c.tokens || []).length} tokens</span></div></div>
${gen ? `<div class="h-note info" style="margin-bottom:24px">${H.comet('ic', true)}<div><b>Your request:</b> “${esc(c.prompt)}”${c.builtFrom?.length ? ` · Built from ${c.builtFrom.map(esc).join(', ')}` : ''}</div><div style="margin-left:auto;display:flex;gap:8px"><a class="h-btn secondary sm" href="#/ai?p=${encodeURIComponent(c.prompt)}">${ic('refresh')}Remix</a><button class="h-btn danger sm" data-act="del">${ic('trash')}Delete</button></div></div>` : ''}
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
const onText = n => H.contrast(n, '#ffffff') >= H.contrast(n, '#000000') ? '#fff' : '#000';
const FAM_NOTE = { teal: 'Brand · actions, links, focus · SharePoint', lime: 'Brand accent · highlights', ink: 'Neutrals · + 0, 25, 150 helpers', green: 'Success · low risk', amber: 'Warning · moderate + elevated risk', orange: 'High risk · Studio · connections', red: 'Danger · critical only', blue: 'Info · environments', cyan: 'Solutions · charts', pink: 'Charts', indigo: 'Agent Builder · charts' };
const SEM_GROUPS = [['Backgrounds', /^--bg-/], ['Text', /^--text-/], ['Borders', /^--border-/], ['Actions & focus', /^--(action|focus)/], ['Status', /^--status-/], ['Risk', /^--risk-/], ['Priority', /^--priority-/], ['Data viz', /^--viz-/], ['Agents & entities', /^--(agent|entity)-/], ['Brand', /^--brand/]];
route(/^\/foundations\/color$/, () => {
  const fams = {}; TOK.filter(t => t[2] === 'Primitives').forEach(([n]) => { const m = n.slice(2).match(/^(.*)-(\d+)$/); if (!['0', '25', '150'].includes(m[2])) (fams[m[1]] = fams[m[1]] || []).push(n); });
  const sem = TOK.filter(t => t[2] === 'Semantic'), colorToks = [...sem.filter(t => !/gradient/.test(t[1]) && t[0] !== '--focus-ring'), ...TOK.filter(t => t[2] === 'Primitives')].map(t => t[0]);
  view.innerHTML = fHead('Color', 'Two layers. <b>Primitives</b> are the raw paint. <b>Semantic</b> tokens say what a color is for, and they are the only colors components are allowed to use. Click any swatch to copy it.', `<span class="chip">${TOK.filter(t => t[2] === 'Primitives').length} primitives</span><span class="chip">${sem.length} semantic</span><span class="chip ok">${ic('check', 'ic-sm')}AA checked</span>`) + `
<div class="sec"><h3>Brand</h3><p>Teal is Orchestry. Lime is the spark. The gradient appears once per screen, at most.</p><div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:12px">
<div class="sw" data-copy="var(--brand-gradient)" data-copy-label="--brand-gradient" style="height:120px;background:var(--brand-gradient);color:#fff;font-size:12px"><b style="font:var(--type-heading-m)">Brand gradient</b>--brand-gradient</div>
${['--teal-700', '--teal-500', '--lime-400'].map(n => `<div class="sw" data-copy="var(${n})" data-copy-label="${n}" style="height:120px;background:var(${n});color:${onText(n)};font-size:12px"><b style="font:var(--type-heading-m)">${cap(n.slice(2).split('-')[0])} ${n.split('-').pop()}</b>${n} · ${H.hex(n)}</div>`).join('')}</div></div>
<div class="sec"><h3>Primitives</h3><p>Eleven families, each with the same ten steps from 50 to 900. Never use these in a component directly; go through a semantic token.</p><div class="panel">${Object.entries(fams).map(([f, ns]) => `<div class="ramp"><div class="ramp-name">${cap(f)}<span>${FAM_NOTE[f] || ''}</span></div>${ns.map(n => `<div class="sw" title="${n}" data-copy="var(${n})" data-copy-label="${n}" style="background:var(${n});color:${onText(n)}"><b style="font-weight:600">${n.split('-').pop()}</b><span>${H.hex(n).slice(1)}</span></div>`).join('')}</div>`).join('')}</div></div>
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
<div class="sec"><h3>Try it: card padding</h3><p>Drag to change the inside of a card. Harmony cards use <code>--inset-card</code> (20px); big cards use <code>--inset-card-lg</code>.</p><div class="panel" style="display:grid;grid-template-columns:260px 1fr;gap:32px;align-items:center"><div class="ctrl-row"><label>Padding<span data-sp-out>--space-5 · 20px</span></label><input type="range" min="0" max="12" value="7" data-sp></div><div style="background:var(--bg-page);border-radius:var(--radius-lg);padding:24px;display:flex;justify-content:center"><div class="h-card" data-sp-card style="width:320px;background:repeating-linear-gradient(45deg,var(--action-primary-subtle),var(--action-primary-subtle) 4px,var(--bg-surface) 4px,var(--bg-surface) 8px)"><div style="background:var(--bg-surface);border:1px dashed var(--border-brand);border-radius:var(--radius-sm);padding:12px"><div style="font:var(--type-heading-s)">HR Policy Assistant</div><div style="font:var(--type-caption);color:var(--text-secondary)">Copilot Studio · Contoso Prod</div></div></div></div></div></div>
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
<div class="sec"><h3>Radius</h3><div class="panel" style="display:grid;grid-template-columns:repeat(6,1fr);gap:20px">${rad.map(([n, v]) => card(`border-radius:var(${n});background:var(--action-primary-subtle);border-color:var(--border-brand-subtle)`, n, `${v} · ${RU[n.slice(9)]}`)).join('')}</div></div>
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

/* ---------- Docs ---------- */
const SNIP = {};
const snip = (id, tabs) => { SNIP[id] = tabs; return codeBlock(id, tabs, tabs[0][0]); };
const mountSnips = () => Object.keys(SNIP).forEach(id => { const el = document.getElementById(id); if (el && !el.dataset.wired) { el.dataset.wired = 1; wireCode(el, () => SNIP[id]); } });
const crumb = (...parts) => `<div class="pg-crumb"><a href="#/">Harmony</a>${parts.map(p => ic('right', 'ic-sm') + p).join('')}</div>`;
const pager = (prev, next) => `<div class="pager">${prev ? `<a href="${prev[0]}">${ic('left')}<span><small>Previous</small>${prev[1]}</span></a>` : '<span></span>'}${next ? `<a class="nx" href="${next[0]}"><span><small>Next</small>${next[1]}</span>${ic('right')}</a>` : ''}</div>`;
const docHead = (part, t, d) => `${crumb('Docs', part)}<div class="pg-head"><div><h1>${t}</h1><p>${d}</p></div></div>`;

route(/^\/docs$/, () => {
  view.innerHTML = `${docHead('Introduction', 'Introduction', 'Harmony is the design system for Orchestry. It holds the colors, type, spacing, components, rules and code our product is built from, in one place that designers, developers and AI all read.')}
<div class="doc">
<h2>Why Harmony exists</h2>
<p>Before Harmony, Orchestry had a Figma file called “Design System”, but it wasn’t one. Components lived in many feature files, many were detached, and the same job had different looks. Developers built from feature files, so code and design drifted apart. Nobody could say which version was right.</p>
<div class="ba"><div class="ba-col"><span class="h-badge danger"><span class="h-dot"></span>Before</span><ul><li>Components spread across many files</li><li>Detached copies: properties didn’t work</li><li>Same purpose, different looks</li><li>No rules or written guidance</li><li>Code didn’t match Figma</li></ul></div><div class="ba-col good"><span class="h-badge success"><span class="h-dot"></span>With Harmony</span><ul><li>One library, one source of truth</li><li>Every part has variants and properties</li><li>One component per job</li><li>Rules written next to each part</li><li>The same tokens feed Figma and code</li></ul></div></div>
<h2>What’s inside</h2>
<div class="doc-cards">${[['#/foundations/color', 'palette', 'Foundations', 'Color, type, spacing, radius, icons.'], ['#/components', 'box', 'Components', `${H.registry.length} live parts with rules and code.`], ['#/blocks', 'layers', 'Blocks', 'Whole screens made from Harmony parts.'], ['#/charts', 'chart', 'Charts', 'Data views built on viz tokens.']].map(([h, i, t, d]) => `<a href="${h}" class="doc-card">${ic(i, 'ic-lg')}<b>${t}</b><span>${d}</span></a>`).join('')}<a href="#/ai" class="doc-card ai-hover">${H.comet('ic-lg', true)}<b>Create with AI</b><span>Describe a part. AI builds it from Harmony.</span></a></div>
<h2>Principles</h2>
<div class="princ">${[['Clear before clever', 'IT admins are busy. Every screen answers “what is wrong, and what do I do?” first.'], ['Calm by default, loud on risk', 'Neutral surfaces everywhere, so red and orange always mean something.'], ['Explain every number', 'A score never stands alone. It shows its scale, its trend and why.'], ['AI shows its work', 'Every AI result says what it found, why, how sure it is, and asks before acting.']].map(([t, d], i) => `<div><span class="num">0${i + 1}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div>
<h2>How it stays one source of truth</h2>
<p>Tokens are written once in <code>orchestry-tokens.json</code>. A build step turns them into CSS variables, Figma variables and the Mantine theme. Rules live in <code>harmony.rules.md</code>, which people read here and AI reads with every request. Change a token once, and every place updates.</p>
${pager(null, ['#/docs/installation', 'Installation'])}</div>`;
});

route(/^\/docs\/installation$/, () => {
  view.innerHTML = `${docHead('Installation', 'Installation', 'Add Harmony to an Orchestry app in four steps. It sits on top of Mantine, so every component keeps Mantine’s accessibility and API.')}
<div class="doc"><ol class="steps">
<li><h3>Install the packages</h3><p>Harmony ships as one package with the theme, tokens and components.</p>${snip('s-install', [['npm', 'npm install @orchestry/harmony @mantine/core @mantine/hooks'], ['pnpm', 'pnpm add @orchestry/harmony @mantine/core @mantine/hooks'], ['yarn', 'yarn add @orchestry/harmony @mantine/core @mantine/hooks']])}</li>
<li><h3>Wrap your app</h3><p>The Harmony theme maps every Mantine value to a Harmony token.</p>${snip('s-provider', [['App.tsx', `import '@orchestry/harmony/tokens.css';\nimport { MantineProvider } from '@mantine/core';\nimport { harmonyTheme } from '@orchestry/harmony';\n\nexport function App() {\n  return (\n    <MantineProvider theme={harmonyTheme} defaultColorScheme="auto">\n      <Router />\n    </MantineProvider>\n  );\n}`]])}</li>
<li><h3>Use a component</h3><p>Import parts by name. Props match what you see in the playground.</p>${snip('s-use', [['RiskCard.tsx', `import { Card, RiskBadge, Button } from '@orchestry/harmony';\n\nexport function RiskCard({ agent }) {\n  return (\n    <Card>\n      <RiskBadge level={agent.risk} score={agent.score} />\n      <Button variant="primary">Review agent</Button>\n    </Card>\n  );\n}`]])}</li>
<li><h3>Give AI the rules</h3><p>Point your coding agent at the rules file so it builds with Harmony too.</p>${snip('s-ai', [['copilot-instructions.md', `# UI rules\nUse @orchestry/harmony for all UI.\nRead node_modules/@orchestry/harmony/harmony.rules.md before writing UI.\nNever hard-code colors, sizes or shadows: use tokens.`], ['CLAUDE.md', `## UI\nFollow @node_modules/@orchestry/harmony/harmony.rules.md\nOnly use Harmony components and tokens.`]])}</li>
</ol>
<div class="h-note info">${ic('info')}<div><b>Designers:</b> turn on the <b>Harmony</b> library in Figma. Variables, text styles and components come from the same tokens as the code.</div></div>
${pager(['#/docs', 'Introduction'], ['#/docs/theming', 'Theming'])}</div>`;
  mountSnips();
});

const THEME_TOK = ['--bg-page', '--bg-surface', '--text-primary', '--text-secondary', '--text-brand', '--border-default', '--action-primary', '--status-danger-fg', '--risk-high-fg', '--status-success-fg'];
route(/^\/docs\/theming$/, () => {
  const mini = t => `<div class="theme-demo" data-theme="${t}"><div class="h-card" style="max-width:none"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font:var(--type-heading-s)">HR Policy Assistant</b>${H.riskBadge('critical', { sm: true })}</div><div style="font:var(--type-body-s);color:var(--text-secondary);margin-bottom:14px">Shared with everyone. Answers from 3 HR sites.</div><div style="display:flex;gap:8px"><button class="h-btn primary sm">Limit sharing</button><button class="h-btn secondary sm">Details</button></div></div><span class="theme-lab">${t === 'dark' ? ic('moon', 'ic-sm') : ic('sun', 'ic-sm')}${cap(t)}</span></div>`;
  view.innerHTML = `${docHead('Theming', 'Theming', 'Harmony has a light and a dark theme. Components never change: only the values behind the semantic tokens do.')}
<div class="doc">
<h2>Same names, new values</h2>
<p>Components only use <b>semantic</b> tokens like <code>--bg-surface</code> or <code>--text-primary</code>. Each theme sets those names to different values. That’s why one component works in both themes with no extra code.</p>
<div class="theme-pair">${mini('light')}${mini('dark')}</div>
<h2>Token map</h2>
<div class="panel" style="padding:0;overflow:hidden"><table class="h-table tmap"><thead><tr><th>Token</th><th>Light</th><th>Dark</th></tr></thead><tbody>${THEME_TOK.map(n => `<tr><td><code>${n}</code></td>${['light', 'dark'].map(t => `<td data-theme="${t}" class="tcell"><span class="sw-mini" style="background:var(${n})"></span><span class="mono" data-val="${n}"></span></td>`).join('')}</tr>`).join('')}</tbody></table></div>
<h2>Switch themes</h2>
<p>Set <code>data-theme</code> on <code>&lt;html&gt;</code>. Harmony follows the system setting until the user picks one, and remembers the choice.</p>
${snip('s-theme', [['HTML', `<html data-theme="dark">`], ['React', `import { useMantineColorScheme } from '@mantine/core';\n\nconst { colorScheme, setColorScheme } = useMantineColorScheme();\nsetColorScheme(colorScheme === 'dark' ? 'light' : 'dark');`], ['CSS', `/* never this */\n.card { background: #FFFFFF; }\n\n/* always this */\n.card { background: var(--bg-surface); }`]])}
<div class="h-note warning">${ic('alert')}<div><b>Rule:</b> never use a primitive like <code>--ink-700</code> in a component. Primitives don’t change between themes, so the part will break in dark mode.</div></div>
${pager(['#/docs/installation', 'Installation'], ['#/foundations/color', 'Color'])}</div>`;
  $$('[data-val]', view).forEach(el => { const n = el.dataset.val, c = getComputedStyle(el).getPropertyValue(n).trim(); el.textContent = c.startsWith('var') ? c : c.replace(/^rgba?\(([^)]*)\)$/, (_, x) => { const v = x.split(',').map(t => t.trim()); return v.length > 3 ? `${v.slice(0, 3).join(',')} · ${Math.round(v[3] * 100)}%` : '#' + v.map(t => (+t).toString(16).padStart(2, '0')).join('').toUpperCase(); }).toUpperCase(); });
  mountSnips();
});

/* ---------- Components index ---------- */
route(/^\/components$/, () => {
  view.innerHTML = `${crumb('Components')}<div class="pg-head"><div><h1>Components</h1><p>${H.registry.length} parts, each with live variants, rules, specs and React code. Every tile below is the real component.</p></div><div class="pg-chips"><a class="h-btn primary ai-hover" href="#/ai">${H.comet('ic')}Create with AI</a></div></div>
${H.groups.map(g => { const cs = H.registry.filter(c => c.group === g); return cs.length ? `<div class="sec"><div class="sec-head"><div><h3>${g}</h3></div><span class="pg-count">${cs.length}</span></div><div class="comp-grid">${cs.map(tile).join('')}</div></div>` : ''; }).join('')}
${generated.length ? `<div class="sec"><div class="sec-head"><div><h3>Made with AI</h3><p>Built in Create from Harmony parts and saved to this browser.</p></div><span class="pg-count">${generated.length}</span></div><div class="comp-grid">${generated.map(tile).join('')}</div></div>` : ''}`;
});

/* ---------- Blocks: whole screens from Harmony parts ---------- */
const R = (id, over = {}) => { const c = findComp(id); return c.render(Object.assign(defaults(c), over)); };
const BLOCKS = [
  { id: 'governance-overview', name: 'Governance overview', desc: 'The first screen an IT admin sees: health at a glance, then what to fix.', uses: ['Page Header', 'KPI Tile', 'Score Card', 'Risk Donut', 'AI Insight'],
    html: () => `${R('page-header', { title: 'Copilot governance', actions: 'two' })}<div class="h-card" style="max-width:none;padding:16px 20px">${R('kpi-tile', { label: 'Active agents', value: '248', delta: 12 })}</div><div class="blk-row2">${R('score-card')}${R('donut')}</div>${R('ai-insight')}`,
    react: `<AppShell.Main>\n  <PageHeader title="Copilot governance" actions={<HeaderActions />} />\n  <SimpleGrid cols={4}>\n    {kpis.map(k => <KpiTile key={k.label} {...k} />)}\n  </SimpleGrid>\n  <SimpleGrid cols={2}>\n    <ScoreCard value={68} benchmark={74} />\n    <RiskDonut data={riskCounts} />\n  </SimpleGrid>\n  <AIInsight {...topInsight} />\n</AppShell.Main>` },
  { id: 'agent-inventory', name: 'Agent inventory', desc: 'Find, filter and act on every agent in the tenant.', uses: ['Page Header', 'Tabs', 'Data Table', 'Pagination'],
    html: () => `${R('page-header', { title: 'Agent inventory', actions: 'one' })}${R('tabs')}<div style="height:16px"></div>${R('data-table')}<div style="display:flex;justify-content:flex-end;margin-top:16px">${R('pagination')}</div>`,
    react: `<PageHeader title="Agent inventory" actions={<Button>Export</Button>} />\n<Tabs value={tab} onChange={setTab}>…</Tabs>\n<AgentTable data={agents} sortBy="risk" />\n<Pagination total={pages} value={page} onChange={setPage} />` },
  { id: 'ai-review', name: 'AI review', desc: 'AI explains a finding, the admin decides. Nothing changes without a click.', uses: ['AI Insight', 'Callout', 'Avatar & User Row'],
    html: () => `<div class="blk-row2" style="align-items:start">${R('ai-insight', { confidence: 'medium' })}<div style="display:flex;flex-direction:column;gap:16px">${R('callout', { tone: 'info' })}${R('avatar')}</div></div>`,
    react: `<Group align="start" grow>\n  <AIInsight confidence="medium" {...finding} onApply={apply} />\n  <Stack>\n    <Callout tone="info">AI suggestions never run on their own.</Callout>\n    <UserRow users={owners} />\n  </Stack>\n</Group>` },
  { id: 'first-connection', name: 'First connection', desc: 'The empty state before a tenant is connected: one clear next step.', uses: ['Page Header', 'Empty State', 'Stat Card'],
    html: () => `${R('page-header', { title: 'Environments', actions: 'none' })}<div class="h-card" style="max-width:none">${R('empty-state')}</div>`,
    react: `<PageHeader title="Environments" />\n<Card>\n  <EmptyState\n    kind="first use"\n    title="Connect your first environment"\n    action={<Button onClick={connect}>Connect tenant</Button>}\n  />\n</Card>` },
];
route(/^\/blocks$/, () => {
  view.innerHTML = `${crumb('Blocks')}<div class="pg-head"><div><h1>Blocks</h1><p>Whole screens made only from Harmony components. Start here, then change the data. No new styles needed.</p></div></div>
${BLOCKS.map(b => `<section class="blk" id="b-${b.id}"><div class="blk-head"><div><h3>${b.name}</h3><p>${b.desc}</p><div class="pg-chips" style="justify-content:flex-start;max-width:none;margin-top:8px">${b.uses.map(u => `<span class="chip">${u}</span>`).join('')}</div></div><div class="seg"><button class="on" data-bv="preview">Preview</button><button data-bv="code">Code</button></div></div>
<div class="blk-frame" data-pane="preview"><div class="blk-inner">${b.html()}</div></div><div data-pane="code" hidden>${snip('bc-' + b.id, [['React', b.react]])}</div></section>`).join('')}`;
  $$('.blk', view).forEach(sec => $$('[data-bv]', sec).forEach(btn => btn.addEventListener('click', () => { $$('[data-bv]', sec).forEach(x => x.classList.toggle('on', x === btn)); $$('[data-pane]', sec).forEach(p => p.hidden = p.dataset.pane !== btn.dataset.bv); })));
  mountSnips();
});

/* ---------- Charts ---------- */
const CH = { W: 560, H: 230, l: 36, r: 12, t: 14, b: 30 };
const sx = (i, n) => CH.l + i * (CH.W - CH.l - CH.r) / (n - 1), sy = (v, max) => CH.t + (1 - v / max) * (CH.H - CH.t - CH.b);
const axes = (max, labels, step) => { let g = ''; for (let v = 0; v <= max; v += step) g += `<line x1="${CH.l}" x2="${CH.W - CH.r}" y1="${sy(v, max)}" y2="${sy(v, max)}" style="stroke:var(--viz-grid)"/><text x="${CH.l - 8}" y="${sy(v, max) + 4}" text-anchor="end" class="ax">${v}</text>`; return g + labels.map((l, i) => l ? `<text x="${sx(i, labels.length)}" y="${CH.H - 8}" text-anchor="middle" class="ax">${l}</text>` : '').join(''); };
const svg = inner => `<svg class="chart" viewBox="0 0 ${CH.W} ${CH.H}" role="img">${inner}</svg>`;
const legend = items => `<div class="lgd">${items.map(([c, l]) => `<span><i style="background:var(${c})"></i>${l}</span>`).join('')}</div>`;
const chartArea = () => { const d = [38, 41, 47, 52, 55, 61, 64, 58, 49, 41, 33, 27], n = d.length, max = 70, wk = d.map((_, i) => i % 2 ? '' : 'W' + (i + 1));
  const pts = d.map((v, i) => `${sx(i, n)},${sy(v, max)}`).join(' ');
  return svg(`<defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--viz-1);stop-opacity:.28"/><stop offset="1" style="stop-color:var(--viz-1);stop-opacity:0"/></linearGradient></defs>${axes(max, wk, 10)}
<line x1="${sx(6, n)}" x2="${sx(6, n)}" y1="${CH.t}" y2="${CH.H - CH.b}" style="stroke:var(--border-strong);stroke-dasharray:3 3"/><text x="${sx(6, n) + 6}" y="${CH.t + 10}" class="ax" style="fill:var(--text-brand);font-weight:500">AI insights on</text>
<polygon points="${sx(0, n)},${sy(0, max)} ${pts} ${sx(n - 1, n)},${sy(0, max)}" fill="url(#gA)"/><polyline points="${pts}" style="fill:none;stroke:var(--viz-1);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>
${d.map((v, i) => `<circle class="pt" cx="${sx(i, n)}" cy="${sy(v, max)}" r="4" style="fill:var(--bg-surface);stroke:var(--viz-1);stroke-width:2"><title>Week ${i + 1}: ${v} risky agents</title></circle>`).join('')}`); };
const chartStack = () => { const envs = [['Contoso Prod', [4, 9, 14, 22, 31]], ['Sales', [2, 6, 8, 12, 20]], ['Finance', [1, 5, 6, 9, 14]], ['HR', [3, 4, 5, 7, 11]], ['Default', [0, 2, 6, 15, 38]]], max = 80, bw = 46, n = envs.length;
  const x = i => CH.l + 30 + i * ((CH.W - CH.l - CH.r - 60) / (n - 1)) - bw / 2;
  return svg(`${axes(max, [], 20)}${envs.map(([e, v], i) => { let acc = 0; return [...v].reverse().map((c, j) => { const lvl = H.risks[4 - j], y0 = sy(acc, max); acc += c; const y1 = sy(acc, max); return `<rect class="bar" x="${x(i)}" y="${y1}" width="${bw}" height="${Math.max(0, y0 - y1 - 1.5)}" rx="3" style="fill:var(--risk-${lvl}-solid)"><title>${e} · ${cap(lvl)}: ${c}</title></rect>`; }).join('') + `<text x="${x(i) + bw / 2}" y="${CH.H - 8}" text-anchor="middle" class="ax">${e}</text>`; }).join('')}`) + legend(H.risks.map(r => [`--risk-${r}-solid`, cap(r)])); };
const chartLines = () => { const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], S = [['--viz-1', 'Copilot Studio', [12, 18, 26, 31, 44, 52]], ['--viz-2', 'SharePoint agents', [8, 14, 17, 25, 29, 41]], ['--viz-3', 'Agent Builder', [2, 5, 9, 16, 24, 30]]], max = 60;
  return svg(`${axes(max, m, 15)}${S.map(([c, l, d]) => `<polyline points="${d.map((v, i) => `${sx(i, 6)},${sy(v, max)}`).join(' ')}" style="fill:none;stroke:var(${c});stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>${d.map((v, i) => `<circle class="pt" cx="${sx(i, 6)}" cy="${sy(v, max)}" r="3.5" style="fill:var(${c})"><title>${l} · ${m[i]}: ${v}k</title></circle>`).join('')}`).join('')}`) + legend(S.map(([c, l]) => [c, l])); };
const chartHBar = () => { const d = [['SharePoint', 182], ['Outlook', 140], ['HTTP (unmanaged)', 96], ['Dataverse', 74], ['Teams', 58]], max = 200, top = 8, rh = 38, lw = 130, W = CH.W - lw - 50;
  return `<svg class="chart" viewBox="0 0 ${CH.W} ${top + d.length * rh}" role="img">${d.map(([l, v], i) => { const bad = /unmanaged/.test(l); return `<text x="${lw - 10}" y="${top + i * rh + 19}" text-anchor="end" class="ax lg"${bad ? ' style="fill:var(--risk-high-fg);font-weight:500"' : ''}>${l}</text><rect x="${lw}" y="${top + i * rh + 6}" width="${W}" height="18" rx="5" style="fill:var(--viz-grid)"/><rect class="bar" x="${lw}" y="${top + i * rh + 6}" width="${W * v / max}" height="18" rx="5" style="fill:var(${bad ? '--risk-high-solid' : '--viz-1'})"><title>${l}: ${v} GB</title></rect><text x="${lw + W * v / max + 8}" y="${top + i * rh + 19}" class="ax lg">${v} GB</text>`; }).join('')}</svg>`; };
route(/^\/charts$/, () => {
  const card = (t, d, body, tag = '') => `<div class="ch-card"><div class="ch-head"><div><b>${t}</b><span>${d}</span></div>${tag}</div>${body}</div>`;
  view.innerHTML = `${crumb('Charts')}<div class="pg-head"><div><h1>Charts</h1><p>Data views built on the <code>--viz-*</code> tokens. Same colors in Figma, code and both themes, and every chart follows the same rules.</p></div></div>
<div class="ch-grid">
${card('Risky agents per week', 'Area chart · one series, one story', chartArea(), H.badge('success', '−58% since AI insights'))}
${card('Agents by risk level', 'Stacked bar · uses risk tokens, never viz', chartStack())}
${card('Conversations by agent type', 'Line chart · up to 3 series', chartLines())}
${card('Data sent by connector', 'Bar chart · highlight only what needs action', chartHBar(), H.badge('warning', '1 needs review'))}
</div>
<div class="sec" style="margin-top:40px"><div class="sec-head"><div><h3>Chart components</h3><p>Ready-made parts for the numbers we show most.</p></div></div><div class="comp-grid">${['donut', 'score-card', 'metric-card', 'progress', 'kpi-tile', 'stat-card'].map(id => tile(findComp(id))).join('')}</div></div>
<div class="sec"><h3>Chart colors</h3><p>Use them in order. Risk always uses the risk scale, so color keeps its meaning.</p><div class="viz-row">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<button class="viz-sw" data-copy="var(--viz-${i})"><i style="background:var(--viz-${i})"></i><span>viz-${i}</span></button>`).join('')}</div></div>
<div class="sec"><h3>Rules</h3><div class="rules"><div class="rule-card"><h4><span class="badge-ic" style="background:var(--status-success-bg);color:var(--status-success-fg)">${ic('check', 'ic-sm')}</span>Do</h4><ul>${['Say what the chart shows in the title', 'Start bars at zero', 'Use risk tokens for anything about risk', 'Mark events that explain a change', 'Show the exact number on hover'].map(x => `<li>${ic('check', 'ic-sm')}${x}</li>`).join('')}</ul></div><div class="rule-card"><h4><span class="badge-ic" style="background:var(--status-danger-bg);color:var(--status-danger-fg)">${ic('x', 'ic-sm')}</span>Don’t</h4><ul>${['Use more than 3 lines in one chart', 'Use red or orange for non-risk data', 'Use 3D, shadows or heavy gradients', 'Hide the scale', 'Rely on color alone: add labels'].map(x => `<li>${ic('x', 'ic-sm')}${x}</li>`).join('')}</ul></div></div></div>`;
});

/* ---------- Search (⌘K) ---------- */
const overlay = $('#search'), q = $('#q'), results = $('#results');
let hits = [], sel = 0;
const searchIndex = () => [
  ...allComps().map(c => ({ kind: 'Components', title: c.name, sub: `${c.group} · ${c.desc}`, href: c.group === 'Made with AI' ? '#/generated/' + c.id : '#/component/' + c.id, icon: c.icon || 'box', text: `${c.name} ${c.id} ${c.group} ${c.desc} ${c.mantine}` })),
  ...FOUND.map(([k, l]) => ({ kind: 'Pages', title: l, sub: 'Foundations', href: '#/foundations/' + k, icon: { color: 'palette', typography: 'type', spacing: 'grid', radius: 'box', icons: 'comet' }[k], text: l + ' ' + k })),
  ...DOCS.map(([h, l]) => ({ kind: 'Pages', title: l, sub: 'Getting started', href: h, icon: 'book', text: l + ' docs getting started install theme dark mode light' })),
  { kind: 'Pages', title: 'Blocks', sub: 'Ready-made screens built from Harmony parts', href: '#/blocks', icon: 'layers', text: 'blocks templates screens dashboard layout' },
  { kind: 'Pages', title: 'Charts', sub: 'Data visualization with viz tokens', href: '#/charts', icon: 'chart', text: 'charts graphs data visualization viz donut bar line' },
  { kind: 'Pages', title: 'Create with AI', sub: 'Describe a component and let AI build it', href: '#/ai', icon: 'comet', text: 'ai studio create generate make new component claude' },
  ...TOK.map(([n, raw, g]) => ({ kind: 'Tokens', title: n, sub: `${g} · ${raw}`, copy: `var(${n})`, color: tokColor(n, resolved(n)) ? n : null, icon: 'palette', text: n + ' ' + g })),
  ...$$('symbol').map(s => s.id.slice(2)).map(n => ({ kind: 'Icons', title: n, sub: 'Icon · click to copy', copy: `<svg class="ic"><use href="#i-${n}"/></svg>`, icon: n, text: n + ' icon' })),
];
const score = (it, s) => { const t = it.title.toLowerCase(); return t === s ? 100 : t.startsWith(s) ? 80 : t.includes(s) ? 60 : it.text.toLowerCase().includes(s) ? 30 : s.split(/\s+/).every(w => it.text.toLowerCase().includes(w)) ? 20 : 0; };
const LIM = { Pages: 5, Components: 8, Tokens: 8, Icons: 6 };
const runSearch = () => {
  const s = q.value.toLowerCase().trim(), idx = searchIndex();
  const list = s ? idx.map(it => [it, score(it, s)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).map(x => x[0]) : idx.filter(it => it.kind === 'Components').slice(0, 6).concat(idx.filter(it => it.kind === 'Pages'));
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
  view.innerHTML = `<div class="pg-crumb"><a href="#/">Harmony</a>${ic('right', 'ic-sm')}Create</div>
<div class="pg-head"><div><h1>Describe it. <span style="background:var(--brand-gradient);-webkit-background-clip:text;background-clip:text;color:transparent">Harmony builds it.</span></h1><p>Write what you need in plain words. AI reads the Harmony rules, builds the component only from our tokens and parts, writes its do’s and don’ts, and checks contrast. No drawing, no hunting for files.</p></div><div class="pg-chips"><span class="chip ai">${ic('book', 'ic-sm')}Reads harmony.rules.md</span><span class="chip">${H.registry.length} parts</span><span class="chip">${TOK.length} tokens</span></div></div>
<div class="ai-box"><textarea id="ai-q" placeholder="e.g. A card for an agent with High risk and a review button" aria-label="Describe a component">${esc(pre ? decodeURIComponent(pre) : '')}</textarea>
<div class="ai-foot"><div class="engine">${ic('bolt', 'ic-sm')}Engine<div class="seg"><button data-eng="harmony" class="${engine === 'harmony' ? 'on' : ''}">Harmony (offline)</button><button data-eng="claude" class="${engine === 'claude' ? 'on' : ''}">Claude</button></div>
<span data-claude style="display:${engine === 'claude' ? 'flex' : 'none'};gap:6px;align-items:center"><input class="pg-input" type="password" data-key placeholder="Anthropic API key" value="${esc(sessionStorage.getItem('harmony.key') || '')}" style="width:180px;height:28px"><input class="pg-input" data-model value="${esc(store.get('model', 'claude-sonnet-4-5'))}" style="width:150px;height:28px" aria-label="Model"></span></div>
<div style="display:flex;align-items:center;gap:10px"><span class="engine"><span class="kbd">⌘</span><span class="kbd">↵</span></span><button class="h-btn primary ai-hover" data-act="gen">${H.comet('ic')}Generate</button></div></div></div>
<div class="ai-ideas">${AI.ideas.map(i => `<button class="ai-idea ai-hover" data-idea="${esc(i)}">${H.comet('ic-sm', true)}${esc(i)}</button>`).join('')}</div>
<div data-out></div>
<div class="sec" data-lib></div>
<div class="sec"><h3>How it stays on-brand</h3><p>The AI can’t invent new colors or sizes. It can only combine what Harmony already has, and every result is checked before you see it.</p><div class="ov-cards">${[['book', 'Reads the rules', 'harmony.rules.md and the token list go in with every request, so AI knows the risk scale, spacing and copy voice.'], ['layers', 'Builds from parts', 'Output is made of Harmony classes and var(--tokens) only. Anything else is removed before it renders.'], ['checks', 'Checks itself', 'Hard-coded colors, contrast, unknown classes and focus are tested on the real HTML.']].map(([i, t, s]) => `<div class="ov-card" style="cursor:default"><div class="h-tile" style="background:var(--action-primary-subtle);color:var(--text-brand)">${ic(i, 'ic-lg')}</div><b>${t}</b><p>${s}</p></div>`).join('')}</div></div>`;
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
    genBtn.classList.add('pg-loading'); genBtn.innerHTML = `${H.comet('ic go')}Building…`;
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
    } finally { busy = false; genBtn.classList.remove('pg-loading'); genBtn.innerHTML = `${H.comet('ic')}Generate`; }
  }
  function showResult(spec, checks) {
    const saved = () => generated.some(g => g.id === spec.id);
    out.innerHTML = `<div class="ai-result-head"><div><h2>${H.aiMark()}<span contenteditable="true" spellcheck="false" data-name title="Click to rename" style="outline:none">${esc(spec.name)}</span></h2><p>${esc(spec.desc)}</p><div class="pg-chips" style="justify-content:flex-start;max-width:none;margin-top:8px">${(spec.builtFrom || []).map(b => `<span class="chip">${ic('box', 'ic-sm')}${esc(b)}</span>`).join('')}<span class="chip ai">${spec.engine === 'claude' ? 'Claude' : 'Harmony engine'}</span></div></div>
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

const rangeFill = r => { const min = +r.min || 0, max = +r.max || 100; r.style.setProperty('--p', ((r.value - min) / (max - min || 1) * 100) + '%'); };
document.addEventListener('input', e => { if (e.target.matches?.('input[type=range]')) rangeFill(e.target); });
new MutationObserver(() => document.querySelectorAll('input[type=range]').forEach(rangeFill)).observe(document.body, { childList: true, subtree: true });
document.querySelectorAll('input[type=range]').forEach(rangeFill);
