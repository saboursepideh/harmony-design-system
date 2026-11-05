/* =====================================================================
   HARMONY AI STUDIO engine
   1) Harmony engine (offline): reads a plain-English request, picks a
      recipe made only of Harmony components + tokens, names it, writes
      controls, rules, React code and a token list. Deterministic.
   2) Claude (optional): sends the request + the Harmony rules to the
      Anthropic API and renders the result after sanitizing it.
   ===================================================================== */
(function () {
const H = window.H, { ic, esc, cap } = H;
const AI = H.AI = {};

/* ---------- Resolve tokens to real colors (for contrast checks) ---------- */
const probe = () => { let p = document.getElementById('h-probe'); if (!p) { p = document.createElement('div'); p.id = 'h-probe'; p.style.cssText = 'position:absolute;left:-9999px;top:0'; document.body.appendChild(p); } return p; };
H.rgb = token => { const p = probe(); p.style.color = ''; p.style.color = token.startsWith('--') ? `var(${token})` : token; const m = (getComputedStyle(p).color.match(/[\d.]+/g) || [0, 0, 0]).map(Number); if (m.length > 3 && m[3] < 1 && token !== '--bg-surface') { const base = H.rgb('--bg-surface'); return [0, 1, 2].map(i => m[i] * m[3] + base[i] * (1 - m[3])); } return m.slice(0, 3); };
const lum = ([r, g, b]) => { const f = c => (c /= 255) <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
H.contrast = (a, b) => { const x = lum(H.rgb(a)), y = lum(H.rgb(b)); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
H.hex = token => '#' + H.rgb(token).map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();

/* ---------- Vocabulary ---------- */
const DOMAINS = {
  agent: { k: /agent|copilot|bot|assistant/, icon: 'robot', ent: 'studio', noun: 'agent', item: 'HR Policy Assistant', sub: 'Copilot Studio · Contoso Prod', title: 'Agent' },
  license: { k: /licen[cs]e|seat|subscription/, icon: 'key', ent: 'solution', noun: 'license', item: 'Microsoft 365 Copilot', sub: '412 of 500 assigned', title: 'License' },
  dlp: { k: /dlp|policy|policies|compliance|data loss/, icon: 'shield', ent: 'dlp', noun: 'policy', item: 'Block external HTTP', sub: 'DLP policy · 4 environments', title: 'Policy' },
  connection: { k: /connector|connection|integration|plug/, icon: 'plug', ent: 'connection', noun: 'connection', item: 'SharePoint Online', sub: 'Connected · synced 4m ago', title: 'Connection' },
  environment: { k: /environment|tenant|region/, icon: 'world', ent: 'environment', noun: 'environment', item: 'Contoso Prod', sub: 'Power Platform · Europe', title: 'Environment' },
  user: { k: /user|owner|member|people|person|guest/, icon: 'user', ent: 'neutral', noun: 'owner', item: 'Jordan Lee', sub: 'jordan.lee@contoso.com', title: 'Owner' },
  site: { k: /site|workspace|team|sharepoint|file|document/, icon: 'file', ent: 'sharepoint', noun: 'site', item: 'HR Policies', sub: 'SharePoint site · 1,204 members', title: 'Workspace' },
};
const TONES = [
  [/critical/, 'risk', 'critical'], [/high[- ]risk|high/, 'risk', 'high'], [/elevated/, 'risk', 'elevated'], [/moderate|medium risk/, 'risk', 'moderate'], [/low[- ]risk|safe/, 'risk', 'low'], [/\brisk/, 'risk', 'high'],
  [/error|fail|danger|broken|block|\bred\b|lock/, 'status', 'danger'], [/warn|attention|expir|almost|limit/, 'status', 'warning'], [/success|healthy|done|complete|compliant/, 'status', 'success'], [/info|tip|new|update/, 'status', 'info'],
];
const RECIPES = [
  ['insight', /insight|recommend|suggest|ai |a\.i\.|smart/, 'Insight'],
  ['empty', /empty|no result|nothing|zero state|first.?use/, 'Empty State'],
  ['banner', /banner|announcement|notice|\balert\b|callout|system message|warning message/, 'Banner'],
  ['toast', /toast|snackbar|notification|confirmation message/, 'Toast'],
  ['modal', /confirm|modal|dialog|delete|remove|popup/, 'Dialog'],
  ['timeline', /timeline|activity|history|log|audit/, 'Timeline'],
  ['stepper', /step|wizard|onboard|setup|progress through/, 'Stepper'],
  ['segmented', /segment|toggle group|switcher|view switch/, 'Switcher'],
  ['chips', /chip|pill|filter bar|quick filter/, 'Filter Chips'],
  ['usage', /usage|quota|capacity|consum|seats? used|storage/, 'Usage Card'],
  ['stat', /kpi|stat|metric|count|number|total|summary/, 'Stat'],
  ['list', /list|queue|table|rows|inbox/, 'List'],
  ['form', /form|field|input|settings|edit/, 'Form'],
  ['card', /./, 'Card'],
];
const FEATURES = { trend: /trend|delta|change|vs|compare|growth/, action: /action|button|cta|fix|review|resolve/, dismiss: /dismiss|close|hide/, avatar: /avatar|owner|person|people/, progress: /progress|bar|percent|usage/, search: /search/, count: /count|badge|number/ };

AI.analyze = prompt => {
  const s = ' ' + prompt.toLowerCase() + ' ';
  const domKey = Object.keys(DOMAINS).find(k => DOMAINS[k].k.test(s)) || 'agent';
  const tone = TONES.find(([re]) => re.test(s)) || [null, 'status', 'info'];
  const [recipe, , rname] = RECIPES.find(([, re]) => re.test(s));
  const feats = Object.fromEntries(Object.entries(FEATURES).map(([k, re]) => [k, re.test(s)]));
  let quoted = (prompt.match(/["“']([^"”']{3,60})["”']/) || [])[1];
  if (quoted && /^(critical|high|elevated|moderate|medium|low)( risk)?$/i.test(quoted.trim())) quoted = undefined;
  const d = DOMAINS[domKey];
  const toneWord = tone[1] === 'risk' && /risk/.test(s) && !['card', 'list', 'stat'].includes(recipe) ? cap(tone[2]) + ' Risk ' : '';
  const name = (recipe === 'card' || recipe === 'list' || recipe === 'stat' || recipe === 'usage' || recipe === 'empty' || recipe === 'timeline' || recipe === 'insight' ? `${toneWord}${d.title} ${rname}` : `${d.title} ${rname}`).replace(/\s+/g, ' ').trim();
  return { prompt, recipe, domKey, d, toneKind: tone[1], tone: tone[2], feats, quoted, name };
};

/* ---------- Tone → token helpers ---------- */
const T = a => a.toneKind === 'risk' ? { fg: `--risk-${a.tone}-fg`, bg: `--risk-${a.tone}-bg`, solid: `--risk-${a.tone}-solid`, badge: (l, t = a.tone) => H.riskBadge(t, {}), label: cap(a.tone) }
  : { fg: `--status-${a.tone}-fg`, bg: `--status-${a.tone}-bg`, solid: `--status-${a.tone}-solid`, badge: (l, t = a.tone) => H.badge(t, l), label: { danger: 'Action needed', warning: 'Needs review', success: 'Healthy', info: 'New', neutral: 'Idle' }[a.tone] };
const toneCtl = a => a.toneKind === 'risk' ? { k: 'tone', t: 'seg', o: H.risks, d: a.tone } : { k: 'tone', t: 'seg', o: ['success', 'warning', 'danger', 'info'], d: a.tone };
const withTone = (a, p) => Object.assign({}, a, { tone: p.tone || a.tone });
const tile = (d, cls = '') => `<div class="h-tile ${cls}" style="background:var(--${d.ent.match(/studio|sharepoint|builder/) ? 'agent' : 'entity'}-${d.ent}-bg);color:var(--${d.ent.match(/studio|sharepoint|builder/) ? 'agent' : 'entity'}-${d.ent}-fg)">${ic(d.icon, cls ? 'ic' : 'ic-lg')}</div>`;
const entTok = d => { const pre = /studio|sharepoint|builder/.test(d.ent) ? 'agent' : 'entity'; return [`--${pre}-${d.ent}-bg`, `--${pre}-${d.ent}-fg`]; };
const S = (t, sub = '') => `style="${t}${sub}"`;

/* ---------- Recipes: each returns { controls, render, react, builtFrom, rules, anatomy, tokens, pair } ---------- */
const R = {};
R.card = a => ({
  builtFrom: ['card', 'section-header', a.toneKind === 'risk' ? 'risk-badge' : 'status-badge', 'button'],
  controls: [toneCtl(a), { k: 'title', t: 'text', d: a.quoted || a.d.item }, { k: 'action', t: 'bool', d: true, l: 'Action button' }, { k: 'progress', t: 'bool', d: a.feats.progress, l: 'Progress bar' }, { k: 'selected', t: 'bool', d: false }],
  render: p => { const x = T(withTone(a, p)); return `<div class="h-card${p.selected ? ' selected' : ''} fit" style="max-width:400px"><div style="display:flex;gap:12px;align-items:flex-start">${tile(a.d)}<div style="flex:1;min-width:0"><div style="font:var(--type-heading-s)">${esc(p.title)}</div><div style="font:var(--type-caption);color:var(--text-secondary);margin-top:2px">${a.d.sub}</div></div>${x.badge(x.label)}</div>${p.progress ? `<div style="margin-top:16px"><div class="h-mrow-top"><span>Owner review</span><b>64%</b></div><div class="h-progress"><i style="width:64%;background:var(${x.solid})"></i></div></div>` : ''}${p.action ? `<div style="display:flex;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border-subtle)"><button class="h-btn secondary sm">View ${a.d.noun}</button><button class="h-btn subtle sm">${ic('dots')}More</button></div>` : ''}</div>`; },
  react: p => `<${H.pascal(a.name)}
  title="${p.title}"
  ${a.toneKind === 'risk' ? 'risk' : 'tone'}="${p.tone}"${p.progress ? '\n  progress={64}' : ''}${p.selected ? '\n  selected' : ''}${p.action ? `\n  onView={() => open${a.d.title}(id)}` : ''}
/>`,
  anatomy: [['Container', 'h-card · inset-card 20 · radius-lg'], ['Tile', `${a.d.ent} entity tile 36`], ['Title', 'type-heading-s'], ['Status', a.toneKind === 'risk' ? 'Risk Badge' : 'Status Badge'], ['Footer', 'border-subtle divider · sm buttons']],
  pair: [T(a).fg, T(a).bg],
});
R.stat = a => ({
  builtFrom: ['stat-card', 'kpi-tile'],
  controls: [{ k: 'label', t: 'text', d: a.quoted || `${cap(a.d.noun)}s ${a.toneKind === 'risk' ? 'at risk' : 'total'}` }, { k: 'value', t: 'text', d: a.toneKind === 'risk' ? '23' : '248' }, { k: 'delta', t: 'range', min: -30, max: 30, d: a.feats.trend ? -8 : 12 }, toneCtl(a)],
  render: p => { const x = T(withTone(a, p)), dlt = +p.delta; return `<div class="h-card" style="width:260px">${tile(a.d)}<div class="h-stat-t">${esc(p.label)}</div><div style="display:flex;align-items:baseline;justify-content:space-between"><div class="h-stat-n">${esc(p.value)}</div>${dlt ? `<span class="h-delta ${dlt < 0 === (a.toneKind === 'risk' || p.tone === 'danger') ? 'up' : 'down'}">${ic(dlt > 0 ? 'up-arrow' : 'down-arrow', 'ic-sm')}${Math.abs(dlt)}%</span>` : ''}</div><div style="margin-top:12px">${x.badge(x.label)}</div></div>`; },
  react: p => `<StatCard entity="${a.d.ent}" label="${p.label}" value={${p.value}} delta={${p.delta}} ${a.toneKind === 'risk' ? 'risk' : 'tone'}="${p.tone}" />`,
  anatomy: [['Card', '260 wide · inset-card'], ['Tile', 'entity color = type, not status'], ['Number', 'type-metric-m'], ['Delta', 'colored by good/bad, not direction']],
  pair: ['--text-primary', '--bg-surface'],
});
R.usage = a => ({
  builtFrom: ['metric-card', 'progress', 'callout'],
  controls: [{ k: 'title', t: 'text', d: a.quoted || `${cap(a.d.noun)} usage` }, { k: 'used', t: 'range', min: 0, max: 100, d: 86, l: 'Used %' }, { k: 'note', t: 'bool', d: true, l: 'Warning note' }],
  render: p => { const v = +p.used, tone = v >= 90 ? 'danger' : v >= 75 ? 'warning' : 'success'; return `<div class="h-card fit" style="max-width:380px"><div class="h-metric-head"><span class="h-metric-title" style="display:flex;gap:8px;align-items:center">${tile(a.d, 'sm')}${esc(p.title)}</span>${H.badge(tone, v + '% used')}</div><div class="h-metric-n">${Math.round(v * 5)}</div><div class="h-metric-l">of 500 ${a.d.noun}s</div><div class="h-progress lg"><i style="width:${v}%;background:var(--status-${tone}-solid)"></i></div>${p.note && v >= 75 ? `<div class="h-note ${tone === 'danger' ? 'warning' : 'info'}" style="margin-top:16px">${ic('alert')}<span><b>${v >= 90 ? 'Almost full.' : 'Getting close.'}</b> ${500 - Math.round(v * 5)} left this month.</span></div>` : ''}</div>`; },
  react: p => `<UsageCard title="${p.title}" used={${Math.round(p.used * 5)}} total={500}${p.note ? ' showWarning' : ''} />`,
  anatomy: [['Thresholds', '75% warning · 90% danger'], ['Bar', 'h-progress lg'], ['Number', 'type-metric-l']],
  pair: ['--status-warning-fg', '--status-warning-bg'],
});
R.list = a => ({
  builtFrom: ['card', 'section-header', 'avatar', a.toneKind === 'risk' ? 'risk-badge' : 'status-badge'],
  controls: [{ k: 'title', t: 'text', d: a.quoted || `${cap(a.d.noun)}s to review` }, { k: 'rows', t: 'range', min: 2, max: 5, d: 3 }, { k: 'avatars', t: 'bool', d: a.feats.avatar || a.domKey === 'user' }, toneCtl(a)],
  render: p => `<div class="h-card fit" style="max-width:460px;padding:20px 20px 8px"><div class="h-sec-head" style="margin-bottom:4px"><div class="h-sec-title">${ic(a.d.icon)}${esc(p.title)}</div><a class="h-link">View all${ic('right', 'ic-sm')}</a></div>${H.agents.slice(0, p.rows).map((g, i) => `<div class="h-user">${p.avatars ? H.avatar(g.owner, i) : tile(H.agentType[g.type] ? { ent: g.type, icon: H.agentType[g.type].icon } : a.d, 'sm')}<div class="meta"><b>${a.domKey === 'user' ? g.owner : g.name}</b><small>${a.domKey === 'user' ? g.name : g.owner + ' · ' + g.last}</small></div>${a.toneKind === 'risk' ? H.riskBadge(i === 0 ? p.tone : H.risks[Math.min(4, H.risks.indexOf(p.tone) + i)], { sm: true }) : H.badge(i === 0 ? p.tone : 'neutral', i === 0 ? T(withTone(a, p)).label : 'Reviewed')}</div>`).join('')}</div>`,
  react: p => `<Card withBorder>
  <SectionHeader icon={<Icon${H.pascal(a.d.icon)} />} title="${p.title}" action={<Anchor>View all</Anchor>} />
  {items.slice(0, ${p.rows}).map((item) => (
    <ListRow key={item.id} ${p.avatars ? 'avatar={item.owner}' : `entity="${a.d.ent}"`} title={item.name} meta={item.owner}
      trailing={<${a.toneKind === 'risk' ? 'RiskBadge level' : 'StatusBadge tone'}={item.${a.toneKind === 'risk' ? 'risk' : 'tone'}} size="sm" />} />
  ))}
</Card>`,
  anatomy: [['Rows', 'h-user · space-3 · border-subtle'], ['Max rows', '5, then "View all"'], ['Trailing', 'badge sm']],
  pair: [T(a).fg, T(a).bg],
});
R.insight = a => ({
  builtFrom: ['ai-insight', 'tag', 'button'],
  controls: [{ k: 'title', t: 'text', d: a.quoted || `3 ${a.d.noun}s need attention` }, { k: 'confidence', t: 'seg', o: ['high', 'medium', 'low'], d: 'high' }, { k: 'state', t: 'seg', o: ['ready', 'thinking', 'applied'], d: 'ready' }],
  render: p => H.registry.find(c => c.id === 'ai-insight').render({ confidence: p.confidence, state: p.state, sources: true }).replace('3 HR agents are shared with the whole company', esc(p.title)),
  react: p => `<AIInsight state="${p.state}" confidence="${p.confidence}" title="${p.title}" … />`,
  anatomy: [['Pattern', 'AI Insight (label · confidence · finding · sources · actions)']],
  pair: ['--text-brand', '--bg-surface'],
});
H.AI_R = R;
})();

(function () {
const H = window.H, { ic, esc, cap } = H, AI = H.AI, R = H.AI_R;
const tone4 = a => ({ k: 'tone', t: 'seg', o: ['info', 'success', 'warning', 'danger'], d: a.toneKind === 'status' ? a.tone : ({ critical: 'danger', high: 'danger', elevated: 'warning', moderate: 'warning', low: 'success' }[a.tone] || 'info') });
const noteTone = t => t;

R.empty = a => ({
  builtFrom: ['empty-state', 'button'],
  controls: [{ k: 'kind', t: 'seg', o: ['first use', 'no results'], d: /result|search|filter/.test(a.prompt) ? 'no results' : 'first use' }, { k: 'title', t: 'text', d: a.quoted || `No ${a.d.noun}s yet` }],
  render: p => `<div class="h-empty fit" style="max-width:500px"><div class="h-tile" style="background:var(--bg-hover);color:var(--text-secondary)">${ic(p.kind === 'no results' ? 'search' : a.d.icon, 'ic-lg')}</div><b>${esc(p.title)}</b><p>${p.kind === 'no results' ? `Try another filter or clear them to see every ${a.d.noun}.` : `When Orchestry finds ${a.d.noun}s in your tenant, they show up here with their risk and owner.`}</p><button class="h-btn ${p.kind === 'no results' ? 'secondary' : 'primary'}">${p.kind === 'no results' ? 'Clear filters' : ic('plug') + 'Connect sources'}</button></div>`,
  react: p => `<EmptyState icon={<Icon${H.pascal(p.kind === 'no results' ? 'search' : a.d.icon)} />} title="${p.title}" action={<Button>${p.kind === 'no results' ? 'Clear filters' : 'Connect sources'}</Button>} />`,
  anatomy: [['Container', 'h-empty · dashed border-strong'], ['Icon', '48 tile · neutral'], ['Copy', 'why it is empty + what to do']],
  pair: ['--text-secondary', '--bg-surface'],
});
R.banner = a => ({
  builtFrom: ['callout', 'button', 'icon-button'],
  controls: [tone4(a), { k: 'title', t: 'text', d: a.quoted || `Your ${a.d.noun} scan finished with 3 new findings` }, { k: 'action', t: 'bool', d: true }, { k: 'dismiss', t: 'bool', d: true }],
  render: p => `<div class="h-note ${noteTone(p.tone)} fit" style="max-width:720px;align-items:center;padding:12px 16px;font:var(--type-body-s)">${ic({ info: 'info', success: 'check', warning: 'alert', danger: 'alert' }[p.tone])}<span style="flex:1"><b>${esc(p.title)}</b></span>${p.action ? `<button class="h-btn secondary sm">Review</button>` : ''}${p.dismiss ? `<button class="h-icon-btn ghost sm" aria-label="Dismiss">${ic('x')}</button>` : ''}</div>`,
  react: p => `<Banner tone="${p.tone}" title="${p.title}"${p.action ? ' action={<Button size="sm" variant="secondary">Review</Button>}' : ''}${p.dismiss ? ' onDismiss={dismiss}' : ''} />`,
  anatomy: [['Base', 'Callout · full width'], ['Padding', '12 / 16'], ['Actions', 'sm secondary + ghost close']],
  pair: [`--status-${tone4(a).d}-fg`, `--status-${tone4(a).d}-bg`],
});
R.toast = a => ({
  builtFrom: ['toast'],
  controls: [{ k: 'message', t: 'text', d: a.quoted || `${cap(a.d.noun)} updated` }, { k: 'undo', t: 'bool', d: true }, { k: 'tone', t: 'seg', o: ['success', 'danger'], d: a.tone === 'danger' ? 'danger' : 'success' }],
  render: p => `<div class="h-toast" role="status">${p.tone === 'danger' ? `<span style="color:var(--red-100);display:flex">${ic('alert')}</span>` : ic('check')}${esc(p.message)}${p.undo ? '<a href="#" onclick="return false">Undo</a>' : ''}</div>`,
  react: p => `notifications.show({ message: '${p.message}', color: '${p.tone}'${p.undo ? ", action: { label: 'Undo', onClick: undo }" : ''} });`,
  anatomy: [['Base', 'Toast · bg-inverse'], ['Position', 'bottom-right']],
  pair: ['--text-inverse', '--bg-inverse'],
});
R.modal = a => ({
  builtFrom: ['modal', 'callout', 'button'],
  controls: [{ k: 'title', t: 'text', d: a.quoted || `Remove this ${a.d.noun}?` }, { k: 'destructive', t: 'bool', d: /delete|remove|revoke|block/.test(a.prompt) || true }],
  render: p => `<div class="h-modal"><div class="h-modal-head"><div><b>${esc(p.title)}</b><small>${a.d.item} · ${a.d.sub}</small></div><button class="h-icon-btn ghost sm" aria-label="Close">${ic('x')}</button></div><div class="h-modal-body"><div class="h-note ${p.destructive ? 'warning' : 'info'}">${ic(p.destructive ? 'alert' : 'info')}<span>${p.destructive ? '<b>This can’t be undone.</b> People lose access right away.' : 'Owners get an email about this change.'}</span></div></div><div class="h-modal-foot"><button class="h-btn secondary">Cancel</button><button class="h-btn ${p.destructive ? 'danger' : 'primary'}">${esc((p.title.match(/^\w+/) || ['Confirm'])[0])}</button></div></div>`,
  react: p => `<ConfirmDialog title="${p.title}"${p.destructive ? ' destructive' : ''} confirmLabel="${(p.title.match(/^\w+/) || ['Confirm'])[0]}" onConfirm={confirm} />`,
  anatomy: [['Base', 'Modal 440 · radius-xl'], ['Confirm label', 'repeats the verb from the title']],
  pair: ['--text-on-brand', '--action-danger'],
});
R.timeline = a => ({
  builtFrom: ['card', 'section-header', 'avatar', 'status-badge'],
  controls: [{ k: 'title', t: 'text', d: a.quoted || `${cap(a.d.noun)} activity` }, { k: 'items', t: 'range', min: 2, max: 5, d: 4 }],
  render: p => { const ev = [['Jordan Lee', 'limited sharing to HR team', '2h ago', 'success'], ['Orchestry AI', 'flagged as Critical risk', '1d ago', 'danger'], ['Priya Shah', 'added HTTP connector', '3d ago', 'warning'], ['Marcus Chen', 'became owner', '1w ago', 'info'], ['System', 'first discovered', '2w ago', 'neutral']]; return `<div class="h-card fit" style="max-width:460px"><div class="h-sec-title" style="margin-bottom:16px">${ic('clock')}${esc(p.title)}</div>${ev.slice(0, p.items).map(([w, t, when, tone], i, arr) => `<div style="display:flex;gap:12px;position:relative;padding-bottom:${i < arr.length - 1 ? 18 : 0}px">${i < arr.length - 1 ? '<span style="position:absolute;left:11px;top:26px;bottom:2px;width:2px;background:var(--border-subtle)"></span>' : ''}${w === 'Orchestry AI' ? `${H.aiMark('sm')}` : H.avatar(w, i, 'sm')}<div style="flex:1;font:var(--type-body-s)"><b style="font-weight:600">${w}</b> ${t}<div style="font:var(--type-caption);color:var(--text-secondary)">${when}</div></div><span class="h-dot" style="background:var(--status-${tone}-solid);margin-top:7px"></span></div>`).join('')}</div>`; },
  react: p => `<Timeline items={events.slice(0, ${p.items})} bulletSize={24} lineWidth={2} />`,
  anatomy: [['Bullet', 'avatar sm 24'], ['Line', '2px border-subtle'], ['Text', 'type-body-s + caption time']],
  pair: ['--text-primary', '--bg-surface'],
});
R.stepper = a => ({
  builtFrom: ['card', 'button', 'progress'],
  controls: [{ k: 'step', t: 'range', min: 1, max: 4, d: 2 }, { k: 'title', t: 'text', d: a.quoted || `Set up ${a.d.noun} governance` }],
  render: p => { const st = ['Connect', 'Scan', 'Review risks', 'Set policies']; return `<div class="h-card fit" style="max-width:620px"><div style="font:var(--type-heading-m);margin-bottom:20px">${esc(p.title)}</div><div style="display:flex;align-items:center;gap:8px">${st.map((s, i) => { const n = i + 1, done = n < p.step, on = n === +p.step; return `<div style="display:flex;align-items:center;gap:8px;${i < st.length - 1 ? 'flex:1' : ''}"><span style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:var(--type-label);flex-shrink:0;${done ? 'background:var(--action-primary);color:var(--text-on-brand)' : on ? 'border:2px solid var(--border-brand);color:var(--text-brand)' : 'border:1.5px solid var(--border-strong);color:var(--text-secondary)'}">${done ? ic('check', 'ic-sm') : n}</span><span style="font:var(--type-body-s);white-space:nowrap;${on ? 'font-weight:600' : 'color:var(--text-secondary)'}">${s}</span>${i < st.length - 1 ? `<span style="flex:1;height:2px;min-width:16px;background:${done ? 'var(--action-primary)' : 'var(--border-default)'}"></span>` : ''}</div>`; }).join('')}</div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:24px"><button class="h-btn secondary"${p.step == 1 ? ' disabled' : ''}>Back</button><button class="h-btn primary">${p.step == 4 ? 'Finish' : 'Continue'}</button></div></div>`; },
  wire: (el, p, set) => { const b = el.querySelectorAll('.h-btn'); b[0]?.addEventListener('click', () => set({ step: Math.max(1, p.step - 1) })); b[1]?.addEventListener('click', () => set({ step: Math.min(4, +p.step + 1) })); },
  react: p => `<Stepper active={${p.step - 1}} color="teal">\n  <Stepper.Step label="Connect" />\n  <Stepper.Step label="Scan" />\n  <Stepper.Step label="Review risks" />\n  <Stepper.Step label="Set policies" />\n</Stepper>`,
  anatomy: [['Bullet', '24 · done = action-primary'], ['Connector', '2px · teal when done'], ['Footer', 'Back / Continue']],
  pair: ['--text-on-brand', '--action-primary'],
});
R.segmented = a => ({
  builtFrom: ['tabs', 'button'],
  controls: [{ k: 'value', t: 'seg', o: ['Day', 'Week', 'Month'], d: 'Week' }, { k: 'size', t: 'seg', o: ['sm', 'md'], d: 'md' }],
  render: p => `<div class="seg" role="radiogroup" style="${p.size === 'sm' ? '' : 'padding:3px'}">${['Day', 'Week', 'Month'].map(v => `<button role="radio" aria-checked="${p.value === v}" class="${p.value === v ? 'on' : ''}" data-v="${v}" style="${p.size === 'md' ? 'height:28px;padding:0 14px;font:var(--type-label)' : ''}">${v}</button>`).join('')}</div>`,
  wire: (el, p, set) => el.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => set({ value: b.dataset.v }))),
  react: p => `<SegmentedControl data={['Day', 'Week', 'Month']} value="${p.value}" onChange={setValue}${p.size === 'sm' ? ' size="xs"' : ''} />`,
  anatomy: [['Track', 'bg-hover · radius-md · 2px'], ['Active', 'bg-surface + shadow-xs + 600']],
  pair: ['--text-primary', '--bg-surface'],
});
R.chips = a => ({
  builtFrom: ['tag', 'select', 'count'],
  controls: [{ k: 'active', t: 'seg', o: a.toneKind === 'risk' ? ['all', ...H.risks.slice(0, 3)] : ['all', 'needs review', 'healthy'], d: 'all' }, { k: 'counts', t: 'bool', d: true }],
  render: p => `<div style="display:flex;gap:8px;flex-wrap:wrap" role="group">${(a.toneKind === 'risk' ? ['all', ...H.risks.slice(0, 3)] : ['all', 'needs review', 'healthy']).map((c, i) => `<button class="pg-chip" data-c="${c}" aria-pressed="${p.active === c}" style="${p.active === c ? 'background:var(--bg-selected);border-color:var(--border-brand);color:var(--text-brand);font-weight:600' : ''}">${c !== 'all' && a.toneKind === 'risk' ? `<span class="h-dot" style="background:var(--risk-${c}-solid)"></span>` : ''}${cap(c)}${p.counts ? `<span style="color:var(--text-secondary);font-weight:500">${[248, 6, 17, 31][i]}</span>` : ''}</button>`).join('')}</div>`,
  wire: (el, p, set) => el.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => set({ active: b.dataset.c }))),
  react: p => `<Chip.Group value="${p.active}" onChange={setFilter}>\n  <Group gap="xs">{filters.map((f) => <Chip key={f.value} value={f.value}>{f.label}${p.counts ? ' {f.count}' : ''}</Chip>)}</Group>\n</Chip.Group>`,
  anatomy: [['Chip', '28 · radius-full'], ['Selected', 'bg-selected + border-brand'], ['Dot', 'risk-solid when filtering by risk']],
  pair: ['--text-brand', '--bg-selected'],
});
R.form = a => ({
  builtFrom: ['text-input', 'select', 'switch', 'button'],
  controls: [{ k: 'title', t: 'text', d: a.quoted || `${cap(a.d.noun)} settings` }, { k: 'error', t: 'bool', d: false, l: 'Show error' }],
  render: p => `<div class="h-card fit" style="max-width:440px;display:flex;flex-direction:column;gap:16px"><div style="font:var(--type-heading-m)">${esc(p.title)}</div><div class="h-field"><label>Name<span class="req">*</span></label><div class="h-input${p.error ? ' error' : ''}"><input value="${p.error ? '' : esc(a.d.item)}" placeholder="Enter a name"${p.error ? ' aria-invalid="true"' : ''}></div>${p.error ? '<small class="err">Enter a name to continue.</small>' : '<small>Shown in reports and alerts.</small>'}</div><div class="h-field"><label>Owner</label><button class="h-select" style="width:100%">${ic('user')}<span style="flex:1;text-align:left">Jordan Lee</span>${ic('down')}</button></div><label class="h-inline"><span class="h-switch on"></span>Alert owner when risk goes up</label><div style="display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--border-subtle);padding-top:16px"><button class="h-btn secondary">Cancel</button><button class="h-btn primary">Save</button></div></div>`,
  react: p => `<form onSubmit={save}>\n  <TextInput label="Name" withAsterisk${p.error ? ' error="Enter a name to continue."' : ''} />\n  <Select label="Owner" data={owners} />\n  <Switch label="Alert owner when risk goes up" />\n  <Group justify="flex-end"><Button variant="secondary">Cancel</Button><Button type="submit">Save</Button></Group>\n</form>`,
  anatomy: [['Gap', 'space-4 between fields'], ['Footer', 'border-subtle · right aligned']],
  pair: ['--text-body', '--bg-surface'],
});

/* ---------- Rules writer ---------- */
const RULES = {
  card: ['Use it to summarise one {noun} and link to its detail', 'Status lives in the badge, type lives in the tile color', "Don't add more than one primary action", "Don't color the whole card by status"],
  stat: ['Use in rows of 3–4 at the top of a page', 'Color the change by good/bad, not by up/down', "Don't use status colors for the tile", "Don't show decimals for counts"],
  usage: ['Show used and total together', 'Warn at 75%, alert at 90%', "Don't use brand teal for the bar: it means status", "Don't hide what happens at 100%"],
  list: ['Show up to 5 rows, then "View all"', 'Put the most severe item first', "Don't mix badge styles in one list", "Don't make the whole row a link and add buttons too"],
  insight: ['Always label it as AI and show confidence', 'Say what will change before people click', "Don't apply changes automatically", "Don't hide low-confidence findings"],
  empty: ['Explain why it is empty and what to do next', 'Use one clear action', "Don't blame the user", "Don't use a spinner here"],
  banner: ['Use for page-level news that needs attention', 'Let people dismiss it', "Don't stack banners", "Don't use for errors that block a task: use a Modal"],
  toast: ['Confirm an action in the past tense', 'Offer Undo when it can be reversed', "Don't use for warnings", "Don't stack more than 3"],
  modal: ['Title is the question, button repeats the verb', 'Show exactly what will be affected', "Don't write \"Are you sure?\"", "Don't open a modal from a modal"],
  timeline: ['Newest first', 'Name who did it, including Orchestry AI', "Don't show more than 5 before \"Show more\"", "Don't use color without the event text"],
  stepper: ['Use for 3–5 steps that must happen in order', 'Let people go back', "Don't use it for tabs", "Don't hide the step names"],
  segmented: ['Use for 2–4 views of the same data', 'Keep labels to one word', "Don't use it for actions", "Don't use it for more than 4 options"],
  chips: ['Show counts so people know before they click', 'Keep "All" first', "Don't use chips for actions", "Don't wrap to more than 2 lines"],
  form: ['Labels always visible, errors say how to fix', 'Primary button on the right', "Don't use placeholder as label", "Don't validate before people type"],
};
const rulesFor = a => { const r = RULES[a.recipe].map(x => x.replace('{noun}', a.d.noun)); const nm = a.name.toLowerCase(); return { when: [`A screen needs ${/^[aeiou]/.test(nm) ? 'an' : 'a'} ${nm} to show ${a.d.noun} information`], whenNot: ['An existing Harmony component already does the job'], do: r.filter(x => !x.startsWith("Don't")), dont: r.filter(x => x.startsWith("Don't")).map(x => cap(x.replace(/^Don't /, ''))), a11y: ['Status is written in words, not only color', 'Interactive parts are real buttons with focus-ring', 'Contrast checked against WCAG AA'] }; };

/* ---------- Build a component spec from a prompt (offline) ---------- */
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const usedTokens = html => [...new Set((html.match(/--[a-z0-9-]+/g) || []))];
AI.offline = (prompt, seedId) => {
  const a = AI.analyze(prompt), r = R[a.recipe](a);
  const spec = {
    id: seedId || slug(a.name) + '-' + Math.random().toString(36).slice(2, 6), name: a.name, group: 'Made with AI', icon: 'comet', engine: 'harmony', prompt,
    mantine: 'Composed from Harmony', desc: `Made from your request: “${prompt.trim()}”. Built only from Harmony components and tokens.`,
    controls: r.controls, render: r.render, react: r.react, wire: r.wire, anatomy: r.anatomy, builtFrom: r.builtFrom, rules: rulesFor(a), pair: r.pair, analysis: a,
  };
  const defaults = Object.fromEntries(spec.controls.map(c => [c.k, c.d]));
  const html = spec.render(defaults);
  spec.tokens = [...new Set([...usedTokens(html), ...r.pair])].slice(0, 16);
  return spec;
};

/* ---------- Checks (run on the real rendered HTML) ---------- */
AI.checks = (html, pair) => {
  const styles = (html.match(/style="[^"]*"/g) || []).join(' ');
  const hard = (styles.match(/#[0-9a-f]{3,8}\b|rgba?\(/gi) || []).length;
  const classes = [...new Set((html.match(/class="([^"]*)"/g) || []).flatMap(c => c.slice(7, -1).split(/\s+/)).filter(Boolean))];
  const foreign = classes.filter(c => !/^(h-|pg-|ic|on$|grow$|meta$|score$|fit$|seg$|req$|err$|sm$|lg$|exp$|detail$|below$|open$|focus$|selected$|interactive$|primary$|secondary$|subtle$|danger$|success$|warning$|info$|neutral$|brand$|ghost$|up$|down$|urgent$|important$|standard$|total$|critical$|high$|elevated$|moderate$|low$|warn$|collapsed$|spinner$|is-hover$|dis$)/.test(c));
  const ratio = pair ? H.contrast(pair[0], pair[1]) : 21;
  const focusable = /<(button|a |input)/.test(html);
  return [
    { ok: hard === 0, t: hard === 0 ? '0 hard-coded colors' : `${hard} hard-coded colors`, s: 'Every color is a token' },
    { ok: ratio >= 4.5, t: `Contrast ${ratio.toFixed(1)}:1`, s: ratio >= 7 ? 'Passes AAA' : ratio >= 4.5 ? 'Passes AA' : 'Fails AA' },
    { ok: !foreign.length, t: foreign.length ? `${foreign.length} unknown classes` : 'Only Harmony parts', s: foreign.length ? foreign.slice(0, 3).join(', ') : `${classes.filter(c => c.startsWith('h-')).length} Harmony classes` },
    { ok: true, t: focusable ? 'Focus ring on' : 'No interactive parts', s: focusable ? 'Uses --focus-ring' : 'Nothing to focus' },
  ];
};

/* ---------- Claude (optional) ---------- */
AI.sanitize = html => {
  const t = document.createElement('template'); t.innerHTML = String(html || '');
  t.content.querySelectorAll('script,iframe,object,embed,link,meta,style,form[action]').forEach(n => n.remove());
  t.content.querySelectorAll('*').forEach(n => [...n.attributes].forEach(at => { if (/^on/i.test(at.name) || /javascript:/i.test(at.value)) n.removeAttribute(at.name); }));
  return t.innerHTML;
};
AI.systemPrompt = () => {
  const comps = H.registry.map(c => `- ${c.name} (${c.group}): ${c.desc}`).join('\n');
  const tokens = (window.HARMONY_TOKENS || []).filter(t => t[2] === 'Semantic' || /^--(risk|status|agent|entity|type|space|radius|shadow)/.test(t[0])).map(t => t[0]).join(' ');
  return `You are Harmony, Orchestry's design-system assistant. Build the requested UI component ONLY from Harmony.
RULES:
- HTML only, using these classes: h-btn (primary|secondary|subtle|danger, sm|lg), h-icon-btn (ghost, sm), h-card (interactive|selected), h-sec-head, h-sec-title, h-sec-sub, h-badge (success|warning|danger|info|neutral|brand) with <span class="h-dot"></span>, h-risk (critical|high|elevated|moderate|low, sm), h-tag, h-count, h-note (info|success|warning), h-progress with <i style="width:..;background:var(--token)">, h-tile, h-avatar, h-user, h-field + h-input, h-select, h-switch(.on), h-check(.on), h-tabs/h-tab(.on), h-table, h-kpi, h-metric-*, h-stat-*, h-empty, h-toast, h-tooltip, h-modal-*.
- Inline styles may ONLY use var(--token) values and layout properties (display, gap, flex, padding, margin, width). Never hex, rgb or named colors.
- Icons: <svg class="ic"><use href="#i-NAME"/></svg> where NAME is one of: ${[...document.querySelectorAll('symbol')].map(s => s.id.slice(2)).join(', ')}.
- Copy is plain English, short, Orchestry domain (Microsoft 365, Copilot agents, risk, owners, sharing).
- Risk scale: critical 85+, high 70-84, elevated 50-69, moderate 30-49, low 0-29. High is orange, only critical is red.
EXISTING COMPONENTS:\n${comps}
TOKENS: ${tokens}
Reply with ONLY JSON: {"name":"Title Case Name","summary":"one sentence","builtFrom":["component names"],"html":"default variant","variants":[{"name":"variant name","html":"..."}],"rules":{"do":["..."],"dont":["..."]},"a11y":["..."],"react":"JSX using @orchestry/harmony + Mantine","pair":["--fg-token","--bg-token"]}`;
};
AI.claude = async (prompt, key, model) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: model || 'claude-sonnet-4-5', max_tokens: 4000, system: AI.systemPrompt(), messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Claude returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json(), text = (data.content || []).map(c => c.text || '').join('');
  const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  return AI.fromClaude(prompt, json);
};
AI.fromClaude = (prompt, j, seedId) => {
  const variants = [{ name: 'Default', html: AI.sanitize(j.html) }, ...(j.variants || []).map(v => ({ name: v.name, html: AI.sanitize(v.html) }))];
  return {
    id: seedId || slug(j.name || 'component') + '-' + Math.random().toString(36).slice(2, 6), name: j.name || 'New component', group: 'Made with AI', icon: 'comet', engine: 'claude', prompt, raw: j,
    mantine: 'Composed by Claude', desc: j.summary || prompt, builtFrom: j.builtFrom || [],
    controls: [{ k: 'variant', t: 'seg', o: variants.map(v => v.name), d: 'Default' }],
    render: p => `<div class="fit" style="display:flex;justify-content:center">${(variants.find(v => v.name === p.variant) || variants[0]).html}</div>`,
    react: () => j.react || '// No React code returned',
    anatomy: (j.builtFrom || []).map(b => [b, 'Harmony component']),
    rules: { when: [j.summary || ''], whenNot: ['An existing Harmony component already does the job'], do: j.rules?.do || [], dont: j.rules?.dont || [], a11y: j.a11y || [] },
    pair: j.pair && j.pair.length === 2 ? j.pair : ['--text-primary', '--bg-surface'],
    tokens: [...new Set((variants.map(v => v.html).join(' ').match(/--[a-z0-9-]+/g) || []))].slice(0, 16),
  };
};

/* ---------- Library (localStorage) ---------- */
const KEY = 'harmony.generated';
AI.load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]').map(s => s.engine === 'claude' ? AI.fromClaude(s.prompt, s.raw, s.id) : Object.assign(AI.offline(s.prompt, s.id), { name: s.name })).filter(Boolean); } catch (e) { return []; } };
AI.save = spec => { const all = JSON.parse(localStorage.getItem(KEY) || '[]').filter(s => s.id !== spec.id); all.unshift({ id: spec.id, name: spec.name, prompt: spec.prompt, engine: spec.engine, raw: spec.raw }); localStorage.setItem(KEY, JSON.stringify(all)); };
AI.remove = id => localStorage.setItem(KEY, JSON.stringify(JSON.parse(localStorage.getItem(KEY) || '[]').filter(s => s.id !== id)));
AI.ideas = [
  'A card for an agent with "High" risk and a review button',
  'Show license usage with a warning when almost full',
  'Empty state when no connections are found',
  'A list of owners who need to review their agents',
  'Activity timeline for an agent',
  'Filter chips for risk levels with counts',
  'A setup wizard for DLP policies',
  'Banner that the weekly scan finished',
  'Confirm dialog to remove an agent',
  'KPI for environments with trend',
];
})();
