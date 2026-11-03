/* =====================================================================
   HARMONY component registry
   Each entry = live render + controls + React code + rules + specs + tokens.
   Everything renders with h-* classes from harmony-components.css.
   ===================================================================== */
(function () {
const H = window.H = {};
H.ic = (n, c = 'ic') => `<svg class="${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
H.esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
H.cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
H.pascal = s => String(s).replace(/(^|[\s_-]+)(\w)/g, (_, __, c) => c.toUpperCase());
H.registry = [];
H.groups = ['Actions', 'Inputs', 'Navigation', 'Containers', 'Data display', 'Status', 'Feedback', 'AI patterns'];
const C = (id, def) => H.registry.push(Object.assign({ id }, def));
const { ic, esc, cap } = H;
// JSX prop helper: drops defaults/empty values
const P = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false && v !== '').map(([k, v]) => v === true ? ` ${k}` : (typeof v === 'string' && !v.startsWith('{')) ? ` ${k}="${v}"` : ` ${k}=${v}`).join('');
H.P = P;

/* ---------- Shared sample data ---------- */
H.agents = [
  { name: 'HR Policy Assistant', type: 'studio', env: 'Contoso Prod', owner: 'Jordan Lee', risk: 'critical', score: 92, last: '2h ago', reason: 'Shared with "Everyone except external users" and connected to 3 HR sites with sensitive data.' },
  { name: 'Sales Deal Desk', type: 'builder', env: 'Sales', owner: 'Priya Shah', risk: 'high', score: 78, last: '1d ago', reason: 'Uses an unmanaged HTTP connector that sends data outside the tenant.' },
  { name: 'IT Helpdesk Bot', type: 'studio', env: 'Contoso Prod', owner: 'Marcus Chen', risk: 'elevated', score: 61, last: '3h ago', reason: 'No owner activity in 90 days; 2,140 conversations last month.' },
  { name: 'Marketing Brief Writer', type: 'sharepoint', env: 'Default', owner: 'Ana Gomez', risk: 'moderate', score: 44, last: '5d ago', reason: 'Grounded on a site with 4 broken permission inheritances.' },
  { name: 'Project Status Agent', type: 'sharepoint', env: 'Default', owner: 'Sam Rivera', risk: 'low', score: 18, last: '12m ago', reason: 'Scoped to one team site; owner reviewed sharing this quarter.' },
  { name: 'Finance Q&A', type: 'builder', env: 'Finance', owner: 'Lena Park', risk: 'high', score: 74, last: '6h ago', reason: 'Answers from spreadsheets labeled Confidential without a sensitivity check.' },
];
H.agentType = {
  studio: { label: 'Copilot Studio', icon: 'robot', fg: 'var(--agent-studio-fg)', bg: 'var(--agent-studio-bg)' },
  sharepoint: { label: 'SharePoint agent', icon: 'file', fg: 'var(--agent-sharepoint-fg)', bg: 'var(--agent-sharepoint-bg)' },
  builder: { label: 'Agent Builder', icon: 'tool', fg: 'var(--agent-builder-fg)', bg: 'var(--agent-builder-bg)' },
};
H.entity = {
  studio: H.agentType.studio, sharepoint: H.agentType.sharepoint, builder: H.agentType.builder,
  environment: { label: 'Environments', icon: 'world', fg: 'var(--entity-environment-fg)', bg: 'var(--entity-environment-bg)' },
  dlp: { label: 'DLP policies', icon: 'shield', fg: 'var(--entity-dlp-fg)', bg: 'var(--entity-dlp-bg)' },
  connection: { label: 'Connections', icon: 'plug', fg: 'var(--entity-connection-fg)', bg: 'var(--entity-connection-bg)' },
  solution: { label: 'Solutions', icon: 'box', fg: 'var(--entity-solution-fg)', bg: 'var(--entity-solution-bg)' },
  neutral: { label: 'Workspaces', icon: 'layers', fg: 'var(--entity-neutral-fg)', bg: 'var(--entity-neutral-bg)' },
};
H.risks = ['critical', 'high', 'elevated', 'moderate', 'low'];
H.riskRange = { critical: '85–100', high: '70–84', elevated: '50–69', moderate: '30–49', low: '0–29' };
H.people = [['Jordan Lee', 'jordan.lee@contoso.com', 'Owner'], ['Priya Shah', 'priya.shah@contoso.com', 'Member'], ['Marcus Chen', 'marcus.chen@contoso.com', 'Member'], ['Ana Gomez', 'ana.gomez@contoso.com', 'Guest']];
H.initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2);
H.avatar = (name, i = 0, cls = '') => `<div class="h-avatar ${cls}" style="background:var(--viz-${(i % 8) + 1})" aria-hidden="true">${H.initials(name)}</div>`;
H.riskBadge = (lvl, opts = {}) => `<span class="h-risk ${lvl}${opts.sm ? ' sm' : ''}"><span class="h-dot" style="width:6px;height:6px;background:currentColor"></span>${cap(lvl)}${opts.score != null ? `<span class="score">${opts.score}</span>` : ''}</span>`;
H.badge = (tone, label, dot = true) => `<span class="h-badge ${tone}">${dot ? '<span class="h-dot"></span>' : ''}${esc(label)}</span>`;
H.btn = (label, variant = 'primary', size = '', icon = '') => `<button class="h-btn ${variant} ${size}">${icon ? ic(icon) : ''}${esc(label)}</button>`;

/* =================================================================== ACTIONS */
C('button', {
  name: 'Button', group: 'Actions', icon: 'bolt', mantine: 'Button',
  desc: 'Starts an action. One primary button per view; everything else is secondary or subtle.',
  controls: [
    { k: 'variant', t: 'seg', o: ['primary', 'secondary', 'subtle', 'danger'], d: 'primary' },
    { k: 'size', t: 'seg', o: ['sm', 'md', 'lg'], d: 'md' },
    { k: 'state', t: 'select', o: ['default', 'hover', 'focus', 'loading', 'disabled'], d: 'default' },
    { k: 'label', t: 'text', d: 'Review agents' },
    { k: 'icon', t: 'select', o: ['none', 'plus', 'download', 'refresh', 'sparkle', 'right'], d: 'none', l: 'Leading icon' },
  ],
  render: p => {
    const st = { hover: ' is-hover', focus: ' focus', loading: ' pg-loading' }[p.state] || '';
    const lead = p.state === 'loading' ? '<span class="spinner"></span>' : (p.icon !== 'none' && p.icon !== 'right' ? ic(p.icon) : '');
    const trail = p.icon === 'right' && p.state !== 'loading' ? ic('right') : '';
    return `<button class="h-btn ${p.variant}${p.size !== 'md' ? ' ' + p.size : ''}${st}"${p.state === 'disabled' ? ' disabled' : ''}${p.state === 'loading' ? ' aria-busy="true"' : ''}>${lead}${esc(p.label)}${trail}</button>`;
  },
  react: p => `import { Button } from '@orchestry/harmony';${p.icon !== 'none' ? `\nimport { Icon${H.pascal(p.icon === 'right' ? 'chevron-right' : p.icon)} } from '@tabler/icons-react';` : ''}

<Button${P({ variant: p.variant !== 'primary' && p.variant, size: p.size !== 'md' && p.size, loading: p.state === 'loading', disabled: p.state === 'disabled', leftSection: p.icon !== 'none' && p.icon !== 'right' && `{<Icon${H.pascal(p.icon)} size={16} />}`, rightSection: p.icon === 'right' && '{<IconChevronRight size={16} />}' })}>
  ${p.label}
</Button>`,
  anatomy: [['Height', 'control-h-sm/md/lg · 28/32/40'], ['Padding x', 'space-3 · 12px'], ['Radius', 'radius-md · 8px'], ['Label', 'type-button · 13/20 600'], ['Icon', '16px · gap 6px'], ['Focus', 'focus-ring · 3px teal-100']],
  tokens: ['--action-primary', '--action-primary-hover', '--action-primary-subtle', '--action-danger', '--text-on-brand', '--border-default', '--bg-hover', '--text-disabled', '--control-h-md', '--radius-md', '--type-button', '--focus-ring', '--duration-fast'],
  rules: {
    when: ['Someone needs to start, confirm or submit an action', 'The action changes data or opens a flow'],
    whenNot: ['Navigating to another page: use a Link', 'Toggling a setting on and off: use a Switch'],
    do: ['Start labels with a verb: "Review agents", "Export report"', 'Use one primary button per view', 'Use danger only for destructive, irreversible actions', 'Show loading inside the button instead of disabling it'],
    dont: ['Use lime, blue or any non-token color for buttons', 'Put two primary buttons side by side', 'Write vague labels like "OK" or "Submit"', 'Use an icon-only button without a tooltip'],
    a11y: ['Native <button> so Enter and Space work', 'Visible focus-ring on keyboard focus', 'Loading sets aria-busy="true"', 'Primary text contrast 6.1:1 on teal-700'],
  },
});

C('icon-button', {
  name: 'Icon Button', group: 'Actions', icon: 'dots', mantine: 'ActionIcon',
  desc: 'A compact action shown only as an icon. Always pairs with a tooltip and an aria-label.',
  controls: [
    { k: 'variant', t: 'seg', o: ['outline', 'ghost'], d: 'outline' },
    { k: 'size', t: 'seg', o: ['sm', 'md'], d: 'md' },
    { k: 'icon', t: 'select', o: ['dots', 'refresh', 'download', 'filter', 'settings', 'x', 'copy'], d: 'refresh' },
    { k: 'state', t: 'select', o: ['default', 'hover', 'focus', 'disabled'], d: 'default' },
    { k: 'tooltip', t: 'bool', d: true, l: 'Show tooltip' },
  ],
  render: p => {
    const name = { dots: 'More actions', refresh: 'Refresh data', download: 'Download', filter: 'Filter', settings: 'Settings', x: 'Close', copy: 'Copy' }[p.icon];
    const b = `<button class="h-icon-btn${p.variant === 'ghost' ? ' ghost' : ''}${p.size === 'sm' ? ' sm' : ''}${p.state === 'hover' ? ' is-hover' : ''}${p.state === 'focus' ? ' focus' : ''}" aria-label="${name}"${p.state === 'disabled' ? ' disabled' : ''}>${ic(p.icon)}</button>`;
    return p.tooltip ? `<div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px"><div class="h-tooltip">${name}</div><div style="padding-left:6px">${b}</div></div>` : b;
  },
  react: p => `<Tooltip label="${{ dots: 'More actions', refresh: 'Refresh data', download: 'Download', filter: 'Filter', settings: 'Settings', x: 'Close', copy: 'Copy' }[p.icon]}">
  <ActionIcon${P({ variant: p.variant === 'ghost' ? 'subtle' : 'default', size: p.size === 'sm' ? 'sm' : undefined, disabled: p.state === 'disabled', 'aria-label': 'Refresh data' })}>
    <Icon${H.pascal(p.icon)} size={16} />
  </ActionIcon>
</Tooltip>`,
  anatomy: [['Size', '32×32 (sm 28×28)'], ['Icon', '16px · stroke 1.75'], ['Radius', 'radius-md (sm radius-sm)'], ['Border', 'border-default · ghost none']],
  tokens: ['--bg-surface', '--border-default', '--text-secondary', '--bg-hover', '--text-primary', '--radius-md', '--control-h-md', '--focus-ring', '--bg-inverse'],
  rules: {
    when: ['Space is tight: table rows, card corners, toolbars', 'The icon is universally understood (close, more, refresh)'],
    whenNot: ['The action is the main call to action of the page', 'The meaning of the icon is not obvious'],
    do: ['Add a tooltip with the action name', 'Use ghost inside cards and tables, outline in toolbars', 'Keep icons from the Harmony set (Tabler, 1.75 stroke)'],
    dont: ['Use icons with color to signal meaning', 'Mix filled and outline icons', 'Make the hit area smaller than 28px'],
    a11y: ['Requires aria-label', 'Tooltip appears on hover and focus', 'Hit area at least 28×28'],
  },
});

/* =================================================================== INPUTS */
C('text-input', {
  name: 'Text Input', group: 'Inputs', icon: 'type', mantine: 'TextInput',
  desc: 'Lets people type a value. Type into it here; the label is always visible.',
  controls: [
    { k: 'label', t: 'text', d: 'Agent name' },
    { k: 'placeholder', t: 'text', d: 'e.g. HR Policy Assistant' },
    { k: 'state', t: 'seg', o: ['default', 'error', 'disabled'], d: 'default' },
    { k: 'search', t: 'bool', d: false, l: 'Search icon' },
    { k: 'required', t: 'bool', d: true },
    { k: 'helper', t: 'text', d: 'Visible to admins in reports.', l: 'Helper text' },
  ],
  render: p => `<div class="h-field fit" style="max-width:320px">
  <label for="ti">${esc(p.label)}${p.required ? '<span class="req">*</span>' : ''}</label>
  <div class="h-input${p.state === 'error' ? ' error' : ''}${p.state === 'disabled' ? ' disabled' : ''}" style="min-width:0">${p.search ? ic('search') : ''}<input id="ti" placeholder="${esc(p.placeholder)}"${p.state === 'disabled' ? ' disabled' : ''}${p.state === 'error' ? ' aria-invalid="true" aria-describedby="ti-h"' : ''}></div>
  ${p.state === 'error' ? `<small class="err" id="ti-h">Enter an agent name to continue.</small>` : p.helper ? `<small id="ti-h">${esc(p.helper)}</small>` : ''}
</div>`,
  react: p => `<TextInput
  label="${p.label}"
  placeholder="${p.placeholder}"${p.required ? '\n  withAsterisk' : ''}${p.search ? '\n  leftSection={<IconSearch size={16} />}' : ''}${p.state === 'error' ? '\n  error="Enter an agent name to continue."' : p.helper ? `\n  description="${p.helper}"` : ''}${p.state === 'disabled' ? '\n  disabled' : ''}
/>`,
  anatomy: [['Height', 'control-h-md · 32'], ['Border', 'border-default → border-brand on focus'], ['Radius', 'radius-md'], ['Label', 'type-label · ink-700'], ['Helper', 'type-caption · text-secondary'], ['Gap', 'space-1-5 · 6px']],
  tokens: ['--border-default', '--border-brand', '--focus-ring', '--status-danger-solid', '--status-danger-fg', '--text-disabled', '--text-secondary', '--radius-md', '--control-h-md', '--type-label', '--type-body-s'],
  rules: {
    when: ['Free text like names, emails or search queries'],
    whenNot: ['Choosing from a known list: use Select'],
    do: ['Always show a visible label', 'Explain errors in plain words and say how to fix them', 'Use helper text for format hints'],
    dont: ['Use placeholder as the label', 'Show errors before the person has typed', 'Use red borders without an error message'],
    a11y: ['label for= points at the input', 'Errors set aria-invalid and aria-describedby', 'Placeholder text-disabled is never real content'],
  },
});

C('select', {
  name: 'Select & Menu', group: 'Inputs', icon: 'down', mantine: 'Select · Menu',
  desc: 'Picks one value from a list. Click the trigger to open it, then pick an option.',
  controls: [
    { k: 'kind', t: 'seg', o: ['filter', 'date range'], d: 'filter' },
    { k: 'open', t: 'bool', d: true, l: 'Menu open' },
    { k: 'value', t: 'select', o: ['All agents', 'Copilot Studio', 'SharePoint agents', 'Agent Builder'], d: 'All agents' },
  ],
  render: p => {
    const opts = p.kind === 'filter' ? ['All agents', 'Copilot Studio', 'SharePoint agents', 'Agent Builder'] : ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];
    const v = opts.includes(p.value) ? p.value : opts[1];
    return `<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start;min-height:${p.open ? 210 : 40}px">
  <button class="h-select${p.open ? ' open' : ''}" data-act="toggle" aria-haspopup="listbox" aria-expanded="${p.open}">${ic(p.kind === 'filter' ? 'filter' : 'cal')}${esc(v)}${ic('down')}</button>
  ${p.open ? `<div class="h-menu" role="listbox">${opts.map((o, i) => `${i === 1 && p.kind === 'filter' ? '<hr>' : ''}<div role="option" data-pick="${esc(o)}" aria-selected="${o === v}" class="${o === v ? 'on' : ''}">${esc(o)}${o === v ? ic('check') : ''}</div>`).join('')}</div>` : ''}
</div>`;
  },
  wire: (el, p, set) => {
    el.querySelector('[data-act=toggle]')?.addEventListener('click', () => set({ open: !p.open }));
    el.querySelectorAll('[data-pick]').forEach(o => o.addEventListener('click', () => set({ value: o.dataset.pick, open: false })));
  },
  react: p => p.kind === 'filter' ? `<Select
  leftSection={<IconFilter size={16} />}
  data={['All agents', 'Copilot Studio', 'SharePoint agents', 'Agent Builder']}
  value={value}
  onChange={setValue}
  allowDeselect={false}
/>` : `<DateRangeSelect
  leftSection={<IconCalendar size={16} />}
  presets={['7d', '30d', '90d', 'ytd']}
  value={range}
  onChange={setRange}
/>`,
  anatomy: [['Trigger', '32 high · icon 16 · type 13/20 500'], ['Menu', 'radius-md · shadow-md · padding 6'], ['Item', 'type-body-s · radius-sm · 8/10 padding'], ['Selected', 'bg-hover + 600 + teal check']],
  tokens: ['--bg-surface', '--border-default', '--border-brand', '--focus-ring', '--shadow-md', '--bg-hover', '--text-brand', '--radius-md', '--radius-sm', '--z-dropdown'],
  rules: {
    when: ['Picking one option from 3–15 choices', 'Filtering a dashboard or table'],
    whenNot: ['2 options: use a Segmented control or Switch', 'More than 15 options: add search'],
    do: ['Show the current value in the trigger', 'Mark the selected item with a check', 'Keep filters in the same place on every page'],
    dont: ['Hide filters inside a "More" menu', 'Use a select for actions: use a Menu with buttons'],
    a11y: ['aria-haspopup and aria-expanded on the trigger', 'Arrow keys move, Enter picks, Esc closes', 'Selected option sets aria-selected'],
  },
});

C('switch', {
  name: 'Switch & Checkbox', group: 'Inputs', icon: 'checks', mantine: 'Switch · Checkbox',
  desc: 'Switch turns a setting on or off right away. Checkbox picks items that get saved later. Click them.',
  controls: [
    { k: 'kind', t: 'seg', o: ['switch', 'checkbox'], d: 'switch' },
    { k: 'checked', t: 'bool', d: true },
    { k: 'disabled', t: 'bool', d: false },
    { k: 'label', t: 'text', d: 'Notify owners about high-risk agents' },
  ],
  render: p => p.kind === 'switch'
    ? `<label class="h-inline" style="cursor:pointer"><span class="h-switch${p.checked ? ' on' : ''}${p.disabled ? ' dis' : ''}" role="switch" tabindex="0" aria-checked="${p.checked}" data-act="toggle"></span>${esc(p.label)}</label>`
    : `<label class="h-inline" style="cursor:pointer"><span class="h-check${p.checked ? ' on' : ''}${p.disabled ? ' dis' : ''}" role="checkbox" tabindex="0" aria-checked="${p.checked}" data-act="toggle">${p.checked ? ic('check', 'ic-sm') : ''}</span>${esc(p.label)}</label>`,
  wire: (el, p, set) => {
    const t = el.querySelector('[data-act=toggle]');
    if (!t || p.disabled) return;
    const go = () => set({ checked: !p.checked });
    t.parentElement.addEventListener('click', e => { e.preventDefault(); go(); });
    t.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); go(); } });
  },
  react: p => p.kind === 'switch' ? `<Switch
  label="${p.label}"
  checked={checked}
  onChange={(e) => setChecked(e.currentTarget.checked)}${p.disabled ? '\n  disabled' : ''}
/>` : `<Checkbox
  label="${p.label}"
  checked={checked}
  onChange={(e) => setChecked(e.currentTarget.checked)}${p.disabled ? '\n  disabled' : ''}
/>`,
  anatomy: [['Switch', '32×18 · thumb 14 · radius-full'], ['Checkbox', '16×16 · radius-xs · border 1.5'], ['On', 'action-primary'], ['Label', 'type-body-s · gap space-2']],
  tokens: ['--action-primary', '--ink-200', '--ink-300', '--radius-full', '--radius-xs', '--shadow-xs', '--type-body-s', '--duration-fast'],
  rules: {
    when: ['Switch: the change happens immediately', 'Checkbox: picking several items, then pressing Save'],
    whenNot: ['The choice needs a confirm button: use Checkbox, not Switch'],
    do: ['Write the label as the "on" state: "Notify owners"', 'Put the label right of the control'],
    dont: ['Use a switch inside a form with a Save button', 'Write labels as questions'],
    a11y: ['role="switch" / "checkbox" with aria-checked', 'Space toggles; the label is clickable'],
  },
});
})();

/* =================================================================== NAVIGATION + CONTAINERS */
(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));

C('tabs', {
  name: 'Tabs', group: 'Navigation', icon: 'layers', mantine: 'Tabs',
  desc: 'Switches between views of the same thing. Click a tab to move between them.',
  controls: [
    { k: 'active', t: 'seg', o: ['Overview', 'Agents', 'Risks', 'Activity'], d: 'Agents' },
    { k: 'counts', t: 'bool', d: true, l: 'Show counts' },
    { k: 'icons', t: 'bool', d: false, l: 'Show icons' },
  ],
  render: p => {
    const tabs = [['Overview', 'home', null], ['Agents', 'robot', 248], ['Risks', 'alert', 17], ['Activity', 'clock', null]];
    return `<div class="fit" style="padding-top:8px"><div class="h-tabs" role="tablist">${tabs.map(([t, i, n]) => `<button class="h-tab${p.active === t ? ' on' : ''}" role="tab" aria-selected="${p.active === t}" data-tab="${t}" style="display:inline-flex;align-items:center;gap:6px">${p.icons ? ic(i) : ''}${t}${p.counts && n ? `<span class="h-count ${t === 'Risks' ? 'urgent' : 'total'}">${n}</span>` : ''}</button>`).join('')}</div>
<div style="padding:20px 0 0;font:var(--type-body-s);color:var(--text-secondary)">Showing the <b style="color:var(--text-primary)">${p.active}</b> panel.</div></div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => set({ active: t.dataset.tab }))),
  react: p => `<Tabs defaultValue="${p.active.toLowerCase()}">
  <Tabs.List>
    <Tabs.Tab value="overview"${p.icons ? ' leftSection={<IconHome size={16} />}' : ''}>Overview</Tabs.Tab>
    <Tabs.Tab value="agents"${p.counts ? ' rightSection={<CountChip tone="total">248</CountChip>}' : ''}>Agents</Tabs.Tab>
    <Tabs.Tab value="risks"${p.counts ? ' rightSection={<CountChip tone="urgent">17</CountChip>}' : ''}>Risks</Tabs.Tab>
    <Tabs.Tab value="activity">Activity</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="agents">…</Tabs.Panel>
</Tabs>`,
  anatomy: [['Gap', '28px between tabs'], ['Label', '14/20 500 → 600 when active'], ['Indicator', '2px border-brand'], ['Bottom line', '1px border-default'], ['Padding', 'bottom space-3 · 12px']],
  tokens: ['--text-secondary', '--text-brand', '--border-brand', '--border-default', '--status-danger-bg', '--status-danger-fg', '--bg-hover', '--focus-ring'],
  rules: {
    when: ['2–6 views of the same object or page', 'Views are peers, not steps in a flow'],
    whenNot: ['Steps that must happen in order: use a Stepper', 'Moving to a different page: use Side Nav'],
    do: ['Keep labels to one or two words', 'Show counts only when the number helps people decide', 'Remember the last active tab on return'],
    dont: ['Nest tabs inside tabs', 'Wrap tabs onto two lines', 'Use tabs to filter a table: use a Select'],
    a11y: ['role="tablist", "tab" and aria-selected', 'Left/Right arrow keys move between tabs', 'Active state is not shown by color alone (weight + underline)'],
  },
});

C('side-nav', {
  name: 'Side Nav', group: 'Navigation', icon: 'grid', mantine: 'AppShell.Navbar · NavLink',
  desc: 'The main way around Orchestry. Click items to move between sections, or collapse it to icons.',
  controls: [
    { k: 'active', t: 'select', o: ['Home', 'Agents', 'Workspaces', 'Insights', 'Settings'], d: 'Agents' },
    { k: 'collapsed', t: 'bool', d: false },
    { k: 'badges', t: 'bool', d: true, l: 'Show badges' },
  ],
  render: p => {
    const items = [['Home', 'home'], ['Agents', 'robot', 17], ['Workspaces', 'layers'], ['Insights', 'chart'], ['Settings', 'settings']];
    return `<nav class="h-nav${p.collapsed ? ' collapsed' : ''}" aria-label="Main">
  <div class="h-nav-section">Governance</div>
  ${items.slice(0, 3).map(([t, i, b]) => `<a class="h-nav-item${p.active === t ? ' on' : ''}" data-nav="${t}" title="${t}"${p.active === t ? ' aria-current="page"' : ''}>${ic(i, 'ic-lg')}<span class="grow">${t}</span>${p.badges && b ? `<span class="h-nav-badge">${b}</span>` : ''}</a>`).join('')}
  ${!p.collapsed && p.active === 'Agents' ? '<a class="h-nav-sub on">Inventory</a><a class="h-nav-sub">Risk review</a>' : ''}
  <div class="h-nav-section">Workspace</div>
  ${items.slice(3).map(([t, i]) => `<a class="h-nav-item${p.active === t ? ' on' : ''}" data-nav="${t}" title="${t}">${ic(i, 'ic-lg')}<span class="grow">${t}</span></a>`).join('')}
</nav>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-nav]').forEach(a => a.addEventListener('click', () => set({ active: a.dataset.nav }))),
  react: p => `<AppShell navbar={{ width: ${p.collapsed ? 72 : 280}, breakpoint: 'md' }}>
  <AppShell.Navbar className="harmony-nav">
    <NavSection label="Governance" />
    <NavLink label="Home" leftSection={<IconHome />} />
    <NavLink label="Agents" leftSection={<IconRobot />}${p.badges ? ' rightSection={<NavBadge>17</NavBadge>}' : ''} active={${p.active === 'Agents'}}>
      <NavLink label="Inventory" active />
      <NavLink label="Risk review" />
    </NavLink>
    …
  </AppShell.Navbar>
</AppShell>`,
  anatomy: [['Width', 'layout-sidebar 280 · collapsed 72'], ['Item', '40 high · radius-md · icon 20'], ['Sub item', '36 high · indent 44'], ['Active', 'bg-nav-active + 3px white bar'], ['Section', 'type-overline · text-nav-muted']],
  tokens: ['--bg-nav', '--bg-nav-hover', '--bg-nav-active', '--text-nav', '--text-nav-muted', '--layout-sidebar', '--layout-sidebar-collapsed', '--radius-lg', '--radius-md', '--type-body-m', '--type-overline'],
  rules: {
    when: ['Top-level sections of the product'],
    whenNot: ['Switching views inside one page: use Tabs'],
    do: ['Keep it to 7 or fewer top-level items', 'Show only one active item', 'Use badges for things that need action, not totals'],
    dont: ['Change the order between pages', 'Use more than two levels', 'Use colored icons in the nav'],
    a11y: ['<nav aria-label="Main">', 'aria-current="page" on the active item', 'Collapsed items keep a title tooltip'],
  },
});

C('breadcrumbs', {
  name: 'Breadcrumbs', group: 'Navigation', icon: 'right', mantine: 'Breadcrumbs',
  desc: 'Shows where a page lives and lets people step back up.',
  controls: [{ k: 'depth', t: 'range', min: 2, max: 4, d: 3 }],
  render: p => { const c = ['Home', 'Agents', 'HR Policy Assistant', 'Sharing'].slice(0, p.depth); return `<div class="h-crumbs">${c.map((x, i) => i === c.length - 1 ? `<b aria-current="page">${x}</b>` : `<a class="h-link" style="font:var(--type-body-s)">${x}</a>${ic('right', 'ic-sm')}`).join('')}</div>`; },
  react: p => `<Breadcrumbs separator={<IconChevronRight size={12} />}>
${['Home', 'Agents', 'HR Policy Assistant', 'Sharing'].slice(0, p.depth).map((x, i, a) => i === a.length - 1 ? `  <Text>${x}</Text>` : `  <Anchor href="#">${x}</Anchor>`).join('\n')}
</Breadcrumbs>`,
  anatomy: [['Type', 'type-body-s'], ['Separator', 'chevron 12px · gap 6px'], ['Current', 'ink-700 · 500']],
  tokens: ['--text-secondary', '--text-brand', '--ink-700', '--type-body-s'],
  rules: { when: ['Pages two or more levels deep'], whenNot: ['Top-level pages'], do: ['Make every crumb except the last a link', 'Keep page names identical to the nav'], dont: ['Use them as the page title', 'Show more than 4 levels'], a11y: ['<nav aria-label="Breadcrumb">', 'aria-current="page" on the last item'] },
});

C('pagination', {
  name: 'Pagination', group: 'Navigation', icon: 'dots', mantine: 'Pagination',
  desc: 'Moves through long tables page by page. Click the pages.',
  controls: [{ k: 'page', t: 'range', min: 1, max: 12, d: 2 }, { k: 'summary', t: 'bool', d: true, l: 'Show summary' }],
  render: p => {
    const total = 12, cur = +p.page;
    let pages = [1, cur - 1, cur, cur + 1, total].filter((x, i, a) => x >= 1 && x <= total && a.indexOf(x) === i).sort((a, b) => a - b);
    const out = []; pages.forEach((x, i) => { if (i && x - pages[i - 1] > 1) out.push('…'); out.push(x); });
    return `<div style="display:flex;align-items:center;gap:24px">${p.summary ? `<span style="font:var(--type-body-s);color:var(--text-secondary)">Showing ${(cur - 1) * 20 + 1}–${Math.min(cur * 20, 238)} of 238 agents</span>` : ''}<div class="h-pages"><button class="h-page" data-pg="${Math.max(1, cur - 1)}" aria-label="Previous">${ic('left', 'ic-sm')}</button>${out.map(x => x === '…' ? '<span class="h-page" style="border:0;background:none">…</span>' : `<button class="h-page${x === cur ? ' on' : ''}" data-pg="${x}"${x === cur ? ' aria-current="page"' : ''}>${x}</button>`).join('')}<button class="h-page" data-pg="${Math.min(total, cur + 1)}" aria-label="Next">${ic('right', 'ic-sm')}</button></div></div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-pg]').forEach(b => b.addEventListener('click', () => set({ page: +b.dataset.pg }))),
  react: p => `<Pagination total={12} value={${p.page}} onChange={setPage} siblings={1} />`,
  anatomy: [['Item', 'control-h-sm 28 · radius-sm'], ['Active', 'action-primary'], ['Gap', '4px']],
  tokens: ['--action-primary', '--border-default', '--bg-surface', '--bg-hover', '--radius-sm', '--control-h-sm'],
  rules: { when: ['Tables with more than 20 rows'], whenNot: ['Feeds and activity logs: use "Load more"'], do: ['Show the range: "Showing 21–40 of 238"', 'Keep page size at 20 by default'], dont: ['Hide the total count', 'Reset to page 1 when someone sorts'], a11y: ['Prev/next have aria-label', 'aria-current="page" on the active page'] },
});

/* ---- Containers ---- */
C('card', {
  name: 'Card', group: 'Containers', icon: 'box', mantine: 'Card · Paper',
  desc: 'Groups related content on a page. The base of almost every Orchestry screen.',
  controls: [
    { k: 'type', t: 'seg', o: ['static', 'interactive', 'selected'], d: 'static' },
    { k: 'padding', t: 'seg', o: ['default', 'large'], d: 'default' },
    { k: 'header', t: 'bool', d: true, l: 'Section header' },
  ],
  render: p => `<div class="h-card${p.type !== 'static' ? ' ' + p.type : ''} fit" style="max-width:420px;${p.padding === 'large' ? 'padding:var(--inset-card-lg)' : ''};${p.type === 'interactive' ? 'cursor:pointer' : ''}">
  ${p.header ? `<div class="h-sec-head" style="margin-bottom:16px"><div><div class="h-sec-title">${ic('robot')}Agents at risk</div><div class="h-sec-sub">Agents with a risk score of 70 or more</div></div><button class="h-icon-btn ghost sm" aria-label="More">${ic('dots')}</button></div>` : ''}
  <div class="h-metric-n">23</div><div class="h-metric-l">of 248 agents across 4 environments</div>
  <div class="h-progress"><i style="width:9.3%;background:var(--risk-high-solid)"></i></div>
</div>`,
  react: p => `<Card${P({ withBorder: true, padding: p.padding === 'large' ? 'xl' : 'lg', 'data-selected': p.type === 'selected' })}${p.type === 'interactive' ? ' component="button" onClick={open}' : ''}>
${p.header ? '  <SectionHeader icon={<IconRobot />} title="Agents at risk" subtitle="Agents with a risk score of 70 or more" />\n' : ''}  <Metric value={23} label="of 248 agents across 4 environments" />
  <Progress value={9.3} color="risk.high" />
</Card>`,
  anatomy: [['Padding', 'inset-card 20 · large 24'], ['Radius', 'radius-lg · 12px'], ['Border', '1px border-default'], ['Hover', 'border-strong (interactive)'], ['Selected', 'border-brand + focus-ring'], ['Gap between cards', 'gap-cards · 12px']],
  tokens: ['--bg-surface', '--border-default', '--border-strong', '--border-brand', '--radius-lg', '--inset-card', '--inset-card-lg', '--gap-cards', '--focus-ring'],
  rules: {
    when: ['Grouping a metric, chart or list with its title', 'A clickable summary that opens detail'],
    whenNot: ['Wrapping a single line of text', 'Inside another card'],
    do: ['Use border, not shadow, to separate cards', 'Keep gap-cards (12px) between cards', 'Put the title top-left with a Section Header'],
    dont: ['Nest cards', 'Mix shadow and border styles', 'Use colored card backgrounds for status: use a Badge'],
    a11y: ['Interactive cards are <button> or <a>', 'Selected state uses border + ring, not color alone'],
  },
});

C('page-header', {
  name: 'Page Header', group: 'Containers', icon: 'type', mantine: 'Group · Title',
  desc: 'Top of every page: where you are, what the page is, and the main actions.',
  controls: [{ k: 'title', t: 'text', d: 'Agent inventory' }, { k: 'crumbs', t: 'bool', d: true, l: 'Breadcrumbs' }, { k: 'actions', t: 'seg', o: ['none', 'one', 'two'], d: 'two' }],
  render: p => `<div class="h-page-head fit">
  <div>${p.crumbs ? `<div class="h-crumbs"><a class="h-link" style="font:var(--type-body-s)">Home</a>${ic('right', 'ic-sm')}<b>Agents</b></div>` : ''}<div class="h-page-title">${esc(p.title)}</div></div>
  ${p.actions !== 'none' ? `<div class="h-actions">${p.actions === 'two' ? `<button class="h-btn secondary">${ic('download')}Export</button>` : ''}<button class="h-btn primary">${ic('refresh')}Run scan</button></div>` : ''}
</div>`,
  react: p => `<PageHeader
  title="${p.title}"${p.crumbs ? "\n  breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Agents' }]}" : ''}${p.actions !== 'none' ? `\n  actions={<>${p.actions === 'two' ? '\n    <Button variant="secondary" leftSection={<IconDownload size={16} />}>Export</Button>' : ''}\n    <Button leftSection={<IconRefresh size={16} />}>Run scan</Button>\n  </>}` : ''}
/>`,
  anatomy: [['Title', 'type-heading-l · 20/28 600'], ['Crumbs gap', '4px above title'], ['Actions', 'gap space-2 · right aligned'], ['Margin below', 'gap-section · 32']],
  tokens: ['--type-heading-l', '--track-heading-l', '--text-secondary', '--gap-section', '--space-2'],
  rules: { when: ['Every page, once, at the top'], whenNot: ['Inside cards: use Section Header'], do: ['Put the primary action on the far right', 'Use the same name as the nav item'], dont: ['Add more than 3 actions: move the rest to a menu', 'Use a different title size per page'], a11y: ['Title is the page <h1>', 'Actions come after the title in reading order'] },
});

C('section-header', {
  name: 'Section Header', group: 'Containers', icon: 'book', mantine: 'Group · Title',
  desc: 'Title row inside a card: icon, title, one-line help and an optional action.',
  controls: [{ k: 'title', t: 'text', d: 'Sharing exposure' }, { k: 'icon', t: 'select', o: ['users', 'shield', 'robot', 'chart', 'none'], d: 'users' }, { k: 'subtitle', t: 'bool', d: true }, { k: 'action', t: 'seg', o: ['none', 'link', 'menu'], d: 'link' }],
  render: p => `<div class="h-card fit" style="max-width:520px"><div class="h-sec-head"><div><div class="h-sec-title">${p.icon !== 'none' ? ic(p.icon) : ''}${esc(p.title)}</div>${p.subtitle ? '<div class="h-sec-sub">How widely agents are shared across the tenant</div>' : ''}</div>${p.action === 'link' ? `<a class="h-link">View all${ic('right', 'ic-sm')}</a>` : p.action === 'menu' ? `<button class="h-icon-btn ghost sm" aria-label="More">${ic('dots')}</button>` : ''}</div></div>`,
  react: p => `<SectionHeader${P({ icon: p.icon !== 'none' && `{<Icon${H.pascal(p.icon)} size={16} />}`, title: p.title, subtitle: p.subtitle && 'How widely agents are shared across the tenant', action: p.action === 'link' ? '{<Anchor>View all</Anchor>}' : p.action === 'menu' ? '{<CardMenu />}' : undefined })} />`,
  anatomy: [['Title', 'type-heading-m · 16/24 600'], ['Icon', '16 · text-secondary'], ['Subtitle', 'type-body-s · text-secondary'], ['Space below', 'space-4']],
  tokens: ['--type-heading-m', '--type-body-s', '--text-secondary', '--text-brand'],
  rules: { when: ['The top of a card or a page section'], whenNot: ['Page title: use Page Header'], do: ['Say what the section shows in 2–4 words', 'Use the subtitle to explain the number, not repeat the title'], dont: ['Use more than one action', 'Color the icon'], a11y: ['Title is an <h2>/<h3> in order'] },
});
})();

/* =================================================================== DATA DISPLAY */
(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));
const band = v => v < 40 ? 'danger' : v < 70 ? 'warning' : 'success';

C('score-card', {
  name: 'Score Card', group: 'Data display', icon: 'chart', mantine: 'Custom · Progress',
  desc: 'The tenant health score: one number out of 100, compared with a benchmark. Drag the score.',
  controls: [{ k: 'score', t: 'range', min: 0, max: 100, d: 72 }, { k: 'bench', t: 'range', min: 0, max: 100, d: 64, l: 'Benchmark' }, { k: 'title', t: 'text', d: 'Copilot readiness score' }],
  render: p => { const b = band(+p.score); return `<div class="h-card fit" style="max-width:560px"><div class="h-score"><div class="h-score-top"><div><div class="h-sec-title">${ic('shield')}${esc(p.title)}</div><div class="h-sec-sub">Based on 38 checks across sharing, ownership and data access</div></div><div><div class="h-score-num" style="color:var(--status-${b}-fg)">${p.score}</div><div class="h-score-of">out of 100</div></div></div>
<div class="h-score-track"><div class="h-score-fill" style="width:${p.score}%;background:var(--status-${b}-solid)"></div><div class="h-score-bench" style="left:${p.bench}%"><span>Benchmark ${p.bench}</span></div></div>
<div class="h-ruler"></div><div class="h-ruler-n"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div>
<div class="h-score-meta"><span>${+p.score >= +p.bench ? `${p.score - p.bench} points above similar tenants` : `${p.bench - p.score} points below similar tenants`}</span>${H.badge(b, b === 'success' ? 'Healthy' : b === 'warning' ? 'Needs work' : 'At risk')}</div></div></div>`; },
  react: p => `<ScoreCard
  title="${p.title}"
  score={${p.score}}
  benchmark={${p.bench}}
  // band is automatic: <40 danger · 40–69 warning · ≥70 success
/>`,
  anatomy: [['Number', 'type-display · 32/40 500'], ['Track', '14 high · viz-score-track'], ['Benchmark', '2px ink-800 marker + label'], ['Bands', '<40 danger · 40–69 warning · ≥70 success'], ['Ruler', 'ticks every 20']],
  tokens: ['--type-display', '--track-display', '--viz-score-track', '--status-success-solid', '--status-warning-solid', '--status-danger-solid', '--status-success-fg', '--ink-800', '--border-subtle'],
  rules: { when: ['One headline score that sums up many checks'], whenNot: ['Comparing many items: use a Data Table or bar chart'], do: ['Always show "out of 100" and the benchmark', 'Let the band color follow the number automatically', 'Explain what the score is based on'], dont: ['Pick the color by hand', 'Show decimals', 'Put two score cards side by side'], a11y: ['Status also written as text ("Needs work")', 'Track has role="meter" with aria-valuenow'] },
});

C('kpi-tile', {
  name: 'KPI Tile', group: 'Data display', icon: 'up-arrow', mantine: 'Paper · Text',
  desc: 'A small number with its change since last period. Used in rows of 3–4.',
  controls: [{ k: 'label', t: 'text', d: 'Active agents' }, { k: 'value', t: 'text', d: '248' }, { k: 'delta', t: 'range', min: -30, max: 30, d: 12 }, { k: 'good', t: 'seg', o: ['up is good', 'down is good'], d: 'up is good', l: 'Direction' }],
  render: p => { const d = +p.delta, good = p.good === 'up is good' ? d >= 0 : d <= 0; return `<div style="display:flex;gap:16px;width:100%;max-width:640px"><div class="h-kpi"><div class="h-kpi-l">${esc(p.label)}</div><div class="h-kpi-r"><span class="h-kpi-n">${esc(p.value)}</span>${d ? `<span class="h-delta ${good ? 'up' : 'down'}">${ic(d > 0 ? 'up-arrow' : 'down-arrow', 'ic-sm')}${Math.abs(d)}%</span>` : '<span class="h-delta" style="color:var(--text-secondary)">0%</span>'}</div></div><div class="h-kpi"><div class="h-kpi-l">Conversations</div><div class="h-kpi-r"><span class="h-kpi-n">12.4k</span><span class="h-delta up">${ic('up-arrow', 'ic-sm')}8%</span></div></div><div class="h-kpi"><div class="h-kpi-l">Owners inactive</div><div class="h-kpi-r"><span class="h-kpi-n">9</span><span class="h-delta down">${ic('up-arrow', 'ic-sm')}3</span></div></div></div>`; },
  react: p => `<KpiTile label="${p.label}" value="${p.value}" delta={${p.delta}}${p.good === 'down is good' ? ' invertDelta' : ''} />`,
  anatomy: [['Background', 'bg-subtle · no border'], ['Padding', '16 / 20'], ['Number', 'type-metric-m · 20/28'], ['Delta', 'type-label + 12px arrow'], ['Radius', 'radius-md']],
  tokens: ['--bg-subtle', '--type-metric-m', '--type-caption', '--type-label', '--status-success-fg', '--status-danger-fg', '--radius-md'],
  rules: { when: ['A row of 3–4 headline numbers at the top of a page'], whenNot: ['A single important number with context: use Metric Card'], do: ['Color the delta by whether it is good, not by its direction', 'Say the period in the page filter, not in each tile', 'Round big numbers: 12.4k'], dont: ['Use more than 4 tiles in a row', 'Put a border on KPI tiles inside a card'], a11y: ['Delta has text "up 12%", arrows are aria-hidden'] },
});

C('metric-card', {
  name: 'Metric Card', group: 'Data display', icon: 'chart', mantine: 'Card · Progress',
  desc: 'One number with context and a progress bar, like license usage.',
  controls: [{ k: 'title', t: 'text', d: 'Copilot licenses' }, { k: 'used', t: 'range', min: 0, max: 500, d: 412 }, { k: 'total', t: 'range', min: 100, max: 500, d: 500 }],
  render: p => { const pct = Math.min(100, Math.round(p.used / p.total * 100)), tone = pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'success'; return `<div class="h-card fit" style="max-width:380px"><div class="h-metric-head"><span class="h-metric-title">${esc(p.title)}</span>${H.badge(tone, pct + '% used')}</div><div class="h-metric-n">${p.used}</div><div class="h-metric-l">of ${p.total} assigned</div><div class="h-progress lg"><i style="width:${pct}%;background:var(--status-${tone}-solid)"></i></div>${pct >= 90 ? `<div class="h-note warning" style="margin-top:16px">${ic('alert')}<span><b>Almost full.</b> ${p.total - p.used} licenses left before new users are blocked.</span></div>` : ''}</div>`; },
  react: p => `<MetricCard
  title="${p.title}"
  value={${p.used}}
  total={${p.total}}
  // tone: ≥90% danger · ≥75% warning · else success
/>`,
  anatomy: [['Number', 'type-metric-l · 28/36'], ['Bar', 'h-progress lg · 12 high'], ['Thresholds', '75% warning · 90% danger'], ['Note', 'appears at ≥90%']],
  tokens: ['--type-metric-l', '--track-metric-l', '--status-success-solid', '--status-warning-solid', '--status-danger-solid', '--border-subtle', '--radius-xs'],
  rules: { when: ['A value against a limit: licenses, storage, quota'], whenNot: ['Values without a maximum: use KPI Tile'], do: ['Show used AND total', 'Warn before the limit, not after', 'Tell people what happens at 100%'], dont: ['Use teal for the bar: the bar means status', 'Hide the exact number'], a11y: ['Bar has role="progressbar" + aria-valuenow/max'] },
});

C('stat-card', {
  name: 'Stat Card', group: 'Data display', icon: 'box', mantine: 'Card · ThemeIcon',
  desc: 'Counts one kind of thing. The tile color tells you the kind, never the status.',
  controls: [{ k: 'entity', t: 'select', o: Object.keys(H.entity), d: 'studio' }, { k: 'value', t: 'text', d: '128' }, { k: 'warn', t: 'bool', d: true, l: 'Warning line' }],
  render: p => { const e = H.entity[p.entity]; return `<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">${[p.entity, ...Object.keys(H.entity).filter(k => k !== p.entity).slice(0, 2)].map((k, i) => { const x = H.entity[k]; return `<div class="h-card" style="width:200px"><div class="h-tile" style="background:${x.bg};color:${x.fg}">${ic(x.icon, 'ic-lg')}</div><div class="h-stat-t">${x.label}</div><div class="h-stat-n">${i === 0 ? esc(p.value) : [42, 17][i - 1]}</div><div class="h-stat-s${i === 0 && p.warn ? ' warn' : ''}">${i === 0 && p.warn ? '6 need review' : 'All reviewed'}</div></div>`; }).join('')}</div>`; },
  react: p => `<StatCard entity="${p.entity}" label="${H.entity[p.entity].label}" value={${p.value}}${p.warn ? ' note="6 need review" noteTone="warning"' : ''} />`,
  anatomy: [['Tile', '36×36 · radius-lg · icon 20'], ['Title', 'type-heading-s · ink-700'], ['Number', 'type-metric-m'], ['Note', 'type-caption · warn = warning-fg 500']],
  tokens: ['--agent-studio-bg', '--agent-studio-fg', '--agent-sharepoint-bg', '--agent-builder-bg', '--entity-environment-bg', '--entity-dlp-bg', '--entity-connection-bg', '--type-metric-m', '--status-warning-fg'],
  rules: { when: ['Counting a type of object: agents, environments, DLP policies'], whenNot: ['Showing good/bad status: use a Badge or the note line'], do: ['Use the entity color for that object everywhere', 'Keep one stat card per entity type'], dont: ['Use red/amber/green tiles', 'Invent a new tile color: add an entity token first'], a11y: ['Tile icon is decorative (aria-hidden)', 'Entity also named in text'] },
});

C('progress', {
  name: 'Progress Bar', group: 'Data display', icon: 'chart', mantine: 'Progress',
  desc: 'Shows part of a whole. Use status colors only when the bar means good or bad.',
  controls: [{ k: 'value', t: 'range', min: 0, max: 100, d: 64 }, { k: 'tone', t: 'seg', o: ['brand', 'success', 'warning', 'danger'], d: 'brand' }, { k: 'size', t: 'seg', o: ['md', 'lg'], d: 'md' }],
  render: p => `<div class="fit" style="max-width:420px"><div class="h-mrow-top"><span>Owners reviewed</span><b>${p.value}%</b></div><div class="h-progress${p.size === 'lg' ? ' lg' : ''}" role="progressbar" aria-valuenow="${p.value}" aria-valuemax="100"><i style="width:${p.value}%;background:${p.tone === 'brand' ? 'var(--action-primary)' : `var(--status-${p.tone}-solid)`}"></i></div></div>`,
  react: p => `<Progress value={${p.value}}${p.tone !== 'brand' ? ` color="${p.tone}"` : ''}${p.size === 'lg' ? ' size="lg"' : ''} aria-label="Owners reviewed" />`,
  anatomy: [['Height', 'md 8 · lg 12'], ['Track', 'border-subtle'], ['Radius', 'radius-xs']],
  tokens: ['--border-subtle', '--action-primary', '--status-success-solid', '--status-warning-solid', '--status-danger-solid', '--radius-xs'],
  rules: { when: ['Completion or usage of a whole'], whenNot: ['Loading with unknown time: use a skeleton'], do: ['Show the number next to the bar'], dont: ['Animate the bar on every render'], a11y: ['role="progressbar" with aria-valuenow'] },
});

C('donut', {
  name: 'Risk Donut', group: 'Data display', icon: 'chart', mantine: 'DonutChart',
  desc: 'Splits agents by risk level. Hover a legend row to focus one slice.',
  controls: [{ k: 'focus', t: 'select', o: ['none', ...H.risks], d: 'none', l: 'Highlight' }, { k: 'legend', t: 'bool', d: true }],
  render: p => { const v = { critical: 6, high: 17, elevated: 31, moderate: 58, low: 136 }, tot = 248; let off = 25; const segs = H.risks.map(r => { const len = v[r] / tot * 100, s = `<circle r="15.915" cx="21" cy="21" fill="none" stroke="var(--risk-${r}-solid)" stroke-width="${p.focus === r ? 6 : 4.5}" stroke-dasharray="${len - .6} ${100 - len + .6}" stroke-dashoffset="${off}" opacity="${p.focus === 'none' || p.focus === r ? 1 : .25}" style="transition:all var(--duration-base)"/>`; off -= len; return s; }).join('');
    return `<div class="h-card" style="display:flex;gap:32px;align-items:center;width:100%;max-width:520px"><div style="position:relative;width:160px;height:160px;flex-shrink:0"><svg viewBox="0 0 42 42" width="160" height="160">${segs}</svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><b style="font:var(--type-metric-m)">${p.focus === 'none' ? tot : v[p.focus]}</b><span style="font:var(--type-caption);color:var(--text-secondary)">${p.focus === 'none' ? 'agents' : cap(p.focus)}</span></div></div>${p.legend ? `<div class="h-legend-list">${H.risks.map(r => `<div data-f="${r}" style="cursor:pointer;opacity:${p.focus === 'none' || p.focus === r ? 1 : .5}"><span class="h-dot" style="background:var(--risk-${r}-solid)"></span><span class="grow">${cap(r)}</span><b>${v[r]}</b></div>`).join('')}</div>` : ''}</div>`; },
  wire: (el, p, set) => el.querySelectorAll('[data-f]').forEach(d => { d.addEventListener('mouseenter', () => set({ focus: d.dataset.f })); d.addEventListener('click', () => set({ focus: p.focus === d.dataset.f ? 'none' : d.dataset.f })); }),
  react: p => `<DonutChart
  size={160}
  thickness={18}
  data={[
${H.risks.map((r, i) => `    { name: '${cap(r)}', value: ${[6, 17, 31, 58, 136][i]}, color: 'var(--risk-${r}-solid)' },`).join('\n')}
  ]}
  chartLabel="248 agents"
/>`,
  anatomy: [['Size', '160 · ring 18'], ['Order', 'critical → low, clockwise from 12'], ['Center', 'type-metric-m total'], ['Legend', 'h-legend-list · dot 8']],
  tokens: ['--risk-critical-solid', '--risk-high-solid', '--risk-elevated-solid', '--risk-moderate-solid', '--risk-low-solid', '--type-metric-m', '--duration-base'],
  rules: { when: ['Splitting one total into 2–5 parts'], whenNot: ['More than 5 parts or comparing over time: use a bar chart'], do: ['Order slices from most to least severe', 'Always show the legend with numbers'], dont: ['Use viz colors for risk: risk has its own scale', 'Use 3D or exploded slices'], a11y: ['Legend repeats every value as text', 'Chart has an aria-label summary'] },
});

C('data-table', {
  name: 'Data Table', group: 'Data display', icon: 'grid', mantine: 'Table · mantine-react-table',
  desc: 'The agent inventory. Click a row to open the reason behind its risk.',
  controls: [{ k: 'rows', t: 'range', min: 2, max: 6, d: 4 }, { k: 'expanded', t: 'range', min: 0, max: 6, d: 1, l: 'Expanded row (0 = none)' }, { k: 'score', t: 'bool', d: true, l: 'Score in badge' }],
  render: p => `<div class="h-card fit" style="padding:0;overflow:hidden;max-width:none"><table class="h-table"><thead><tr><th>Agent</th><th>Environment</th><th>Owner</th><th>Risk</th><th>Last active</th><th></th></tr></thead><tbody>${H.agents.slice(0, p.rows).map((a, i) => { const t = H.agentType[a.type], ex = +p.expanded === i + 1; return `<tr class="${ex ? 'exp' : ''}" data-row="${i + 1}"><td><div class="h-cell"><div class="h-tile sm" style="background:${t.bg};color:${t.fg}">${ic(t.icon)}</div><div><b>${a.name}</b><small>${t.label}</small></div></div></td><td>${a.env}</td><td><div class="h-cell" style="gap:8px">${H.avatar(a.owner, i, 'sm')}${a.owner}</div></td><td>${H.riskBadge(a.risk, { score: p.score ? a.score : null })}</td><td style="color:var(--text-secondary)">${a.last}</td><td>${ic(ex ? 'down' : 'right')}</td></tr>${ex ? `<tr class="detail"><td colspan="6"><div class="h-note ${a.risk === 'critical' || a.risk === 'high' ? 'warning' : 'info'}">${ic('sparkle')}<span><b>Why ${a.risk}:</b> ${a.reason}</span></div></td></tr>` : ''}`; }).join('')}</tbody></table></div>`,
  wire: (el, p, set) => el.querySelectorAll('[data-row]').forEach(r => r.addEventListener('click', () => set({ expanded: +p.expanded === +r.dataset.row ? 0 : +r.dataset.row }))),
  react: () => `<MantineReactTable
  columns={agentColumns}
  data={agents}
  enableExpanding
  renderDetailPanel={({ row }) => (
    <Callout tone="warning" icon={<IconSparkles />}>
      <b>Why {row.original.risk}:</b> {row.original.reason}
    </Callout>
  )}
  mantineTableProps={{ className: 'harmony-table' }}
/>`,
  anatomy: [['Header', 'type-overline · uppercase'], ['Row', 'padding 12/16 · border-subtle'], ['Hover', 'bg-subtle'], ['Expanded', 'bg-hover + detail row'], ['Name cell', 'tile 28 + heading-s + caption']],
  tokens: ['--bg-surface', '--bg-subtle', '--bg-hover', '--border-default', '--border-subtle', '--type-overline', '--type-body-s', '--type-heading-s', '--risk-critical-bg', '--risk-high-bg'],
  rules: { when: ['Lists people compare, sort and act on'], whenNot: ['Fewer than 4 items: use a list in a card'], do: ['Put the name in the first column with its type', 'Explain risk inside the row, not on another page', 'Right-align numbers'], dont: ['Use zebra stripes', 'Put more than one primary action per row', 'Truncate the agent name without a tooltip'], a11y: ['Real <table> with <th scope="col">', 'Expandable rows use aria-expanded', 'Row is reachable by keyboard'] },
});

C('avatar', {
  name: 'Avatar & User Row', group: 'Data display', icon: 'user', mantine: 'Avatar · Group',
  desc: 'Shows a person. Photo if we have it, initials if not; color comes from the viz palette.',
  controls: [{ k: 'size', t: 'seg', o: ['sm', 'md'], d: 'md' }, { k: 'photo', t: 'bool', d: true, l: 'First user has photo' }, { k: 'role', t: 'bool', d: true, l: 'Show role badge' }],
  render: p => `<div class="h-card fit" style="max-width:420px;padding:8px 20px">${H.people.map(([n, e, r], i) => `<div class="h-user">${i === 0 && p.photo ? `<div class="h-avatar${p.size === 'sm' ? ' sm' : ''}"><img src="jordan-avatar.png" alt=""></div>` : H.avatar(n, i, p.size === 'sm' ? 'sm' : '')}<div class="meta"><b>${n}</b><small>${e}</small></div>${p.role ? H.badge(r === 'Owner' ? 'brand' : r === 'Guest' ? 'warning' : 'neutral', r, false) : ''}</div>`).join('')}</div>`,
  react: p => `<Group>
  <Avatar src={user.photo} size={${p.size === 'sm' ? 24 : 32}} color={vizColor(user.id)}>{initials(user.name)}</Avatar>
  <div><Text fw={600}>{user.name}</Text><Text size="xs" c="dimmed">{user.email}</Text></div>${p.role ? '\n  <Badge variant="light">{user.role}</Badge>' : ''}
</Group>`,
  anatomy: [['Size', 'md 32 · sm 24'], ['Initials', 'type-label · white'], ['Fallback color', 'viz-1…8 from user id'], ['Row', 'space-3 padding · border-subtle']],
  tokens: ['--viz-1', '--viz-2', '--viz-3', '--viz-4', '--type-label', '--type-heading-s', '--type-caption', '--border-subtle'],
  rules: { when: ['Owners, members, guests'], whenNot: ['Agents or systems: use an entity tile'], do: ['Pick the fallback color from the user id so it never changes', 'Show email under the name'], dont: ['Use random colors per render'], a11y: ['Avatar is decorative when the name is shown next to it'] },
});
})();

/* =================================================================== STATUS + FEEDBACK + AI */
(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));

C('status-badge', {
  name: 'Status Badge', group: 'Status', icon: 'check', mantine: 'Badge',
  desc: 'Tells the state of something in one or two words.',
  controls: [{ k: 'tone', t: 'seg', o: ['success', 'warning', 'danger', 'info', 'neutral', 'brand'], d: 'success' }, { k: 'label', t: 'text', d: 'Compliant' }, { k: 'dot', t: 'bool', d: true }],
  render: p => H.badge(p.tone, p.label, p.dot),
  react: p => `<StatusBadge tone="${p.tone}"${p.dot ? '' : ' withDot={false}'}>${p.label}</StatusBadge>`,
  anatomy: [['Height', '22 · radius-full'], ['Padding', 'space-2'], ['Dot', '6px · currentColor'], ['Type', 'type-label 12/16 600']],
  tokens: ['--status-success-fg', '--status-success-bg', '--status-warning-fg', '--status-warning-bg', '--status-danger-fg', '--status-danger-bg', '--status-info-fg', '--status-info-bg', '--status-neutral-fg', '--radius-full', '--type-label'],
  rules: { when: ['The state of an item: Compliant, Pending, Failed'], whenNot: ['Risk level: use Risk Badge', 'Categories: use Tag'], do: ['Use 1–2 words', 'Use the same word for the same state everywhere'], dont: ['Use status colors for decoration', 'Make badges clickable'], a11y: ['State is written in words, never color alone', 'All pairs pass 4.5:1'] },
});

C('risk-badge', {
  name: 'Risk Badge', group: 'Status', icon: 'alert', mantine: 'Badge (custom)',
  desc: 'Orchestry’s 5-level risk scale. Each level has its own fixed range and color.',
  controls: [{ k: 'level', t: 'seg', o: H.risks, d: 'high' }, { k: 'score', t: 'bool', d: true, l: 'Show score' }, { k: 'size', t: 'seg', o: ['md', 'sm'], d: 'md' }],
  render: p => { const s = { critical: 92, high: 78, elevated: 61, moderate: 44, low: 18 }[p.level]; return `<div style="display:flex;flex-direction:column;align-items:center;gap:12px">${H.riskBadge(p.level, { score: p.score ? s : null, sm: p.size === 'sm' })}<span style="font:var(--type-caption);color:var(--text-secondary)">Score range ${H.riskRange[p.level]}</span></div>`; },
  react: p => `<RiskBadge level="${p.level}"${p.score ? ' score={' + { critical: 92, high: 78, elevated: 61, moderate: 44, low: 18 }[p.level] + '}' : ''}${p.size === 'sm' ? ' size="sm"' : ''} />`,
  anatomy: [['Levels', 'critical 85+ · high 70 · elevated 50 · moderate 30 · low 0'], ['Height', 'md 24 · sm 20'], ['Score', 'divider 30% currentColor'], ['Colors', 'risk-{level}-fg / -bg']],
  tokens: ['--risk-critical-fg', '--risk-critical-bg', '--risk-high-fg', '--risk-high-bg', '--risk-elevated-fg', '--risk-elevated-bg', '--risk-moderate-fg', '--risk-moderate-bg', '--risk-low-fg', '--risk-low-bg'],
  rules: { when: ['Anywhere an agent, site or workspace shows its risk'], whenNot: ['General status: use Status Badge'], do: ['Let the score decide the level, never pick by hand', 'Show the score in tables so people can sort', 'Explain the reason one click away'], dont: ['Use red for "high": high is orange, only critical is red', 'Add a 6th level'], a11y: ['Level is always written in text', 'Each fg/bg pair passes 4.5:1'] },
});

C('priority', {
  name: 'Priority', group: 'Status', icon: 'bolt', mantine: 'Group · ColorSwatch',
  desc: 'How soon someone should act on a recommendation.',
  controls: [{ k: 'level', t: 'seg', o: ['urgent', 'important', 'standard'], d: 'urgent' }, { k: 'count', t: 'bool', d: true, l: 'Count chip style' }],
  render: p => `<div style="display:flex;gap:24px;align-items:center"><span class="h-pri ${p.level}"><span class="h-dot"></span>${cap(p.level)}</span>${p.count ? `<span class="h-count ${p.level === 'standard' ? 'total' : p.level}">${{ urgent: 4, important: 11, standard: 23 }[p.level]} ${p.level}</span>` : ''}</div>`,
  react: p => `<Priority level="${p.level}" />${p.count ? `\n<CountChip tone="${p.level === 'standard' ? 'total' : p.level}">${{ urgent: 4, important: 11, standard: 23 }[p.level]} ${p.level}</CountChip>` : ''}`,
  anatomy: [['Dot', '7px'], ['Type', '13/20 500'], ['Colors', 'priority-urgent / important / standard']],
  tokens: ['--priority-urgent', '--priority-important', '--priority-standard', '--status-danger-bg', '--status-warning-bg'],
  rules: { when: ['Recommendations and tasks'], whenNot: ['Risk of an agent: use Risk Badge'], do: ['Sort lists by priority first'], dont: ['Mix priority and risk in one column'], a11y: ['Priority written in text next to the dot'] },
});

C('tag', {
  name: 'Tag', group: 'Status', icon: 'layers', mantine: 'Pill',
  desc: 'A neutral label for categories, like a connector or a sensitivity label.',
  controls: [{ k: 'label', t: 'text', d: 'HTTP connector' }, { k: 'icon', t: 'select', o: ['none', 'plug', 'lock', 'world', 'db'], d: 'plug' }, { k: 'removable', t: 'bool', d: false }],
  render: p => `<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="h-tag">${p.icon !== 'none' ? ic(p.icon, 'ic-sm') : ''}${esc(p.label)}${p.removable ? `<button aria-label="Remove ${esc(p.label)}" style="display:flex;margin-left:2px;color:var(--text-secondary)">${ic('x', 'ic-sm')}</button>` : ''}</span><span class="h-tag">${ic('lock', 'ic-sm')}Confidential</span><span class="h-tag">SharePoint</span></div>`,
  react: p => `<Pill${p.removable ? ' withRemoveButton onRemove={remove}' : ''}>${p.icon !== 'none' ? `<Icon${H.pascal(p.icon)} size={12} /> ` : ''}${p.label}</Pill>`,
  anatomy: [['Height', '22 · radius-full'], ['Type', '11/16 500 · ink-600'], ['Background', 'bg-hover'], ['Icon', '12px text-secondary']],
  tokens: ['--bg-hover', '--ink-600', '--text-secondary', '--radius-full'],
  rules: { when: ['Categories, connectors, labels'], whenNot: ['State or risk'], do: ['Keep tags gray'], dont: ['Color tags by meaning: use a Badge'], a11y: ['Remove button has aria-label'] },
});

/* ---- Feedback ---- */
C('callout', {
  name: 'Callout', group: 'Feedback', icon: 'info', mantine: 'Alert',
  desc: 'An inline note that explains or warns, right next to what it is about.',
  controls: [{ k: 'tone', t: 'seg', o: ['neutral', 'info', 'success', 'warning', 'danger'], d: 'warning' }, { k: 'title', t: 'text', d: '3 agents are shared with everyone.' }, { k: 'body', t: 'text', d: 'Limit sharing to the teams that need them.' }],
  render: p => `<div class="h-note${p.tone !== 'neutral' ? ' ' + p.tone : ''} fit" style="max-width:520px">${ic({ neutral: 'info', info: 'info', success: 'check', warning: 'alert', danger: 'alert' }[p.tone])}<span><b>${esc(p.title)}</b> ${esc(p.body)}</span></div>`,
  react: p => `<Callout tone="${p.tone}" title="${p.title}">
  ${p.body}
</Callout>`,
  anatomy: [['Padding', '10 / 12'], ['Radius', 'radius-md'], ['Type', 'type-caption 12/18'], ['Icon', '16 · same tone']],
  tokens: ['--bg-subtle', '--status-info-bg', '--status-info-fg', '--status-warning-bg', '--status-warning-fg', '--status-success-bg', '--status-success-fg', '--radius-md'],
  rules: { when: ['Context that helps people decide, right where they decide'], whenNot: ['System-wide messages: use a banner', 'Confirming an action: use Toast'], do: ['Start with the fact in bold, then what to do', 'Keep it to two lines'], dont: ['Stack more than one callout', 'Use danger: if it is that serious, block the action with a Modal'], a11y: ['role="status" for dynamic callouts'] },
});

C('tooltip', {
  name: 'Tooltip', group: 'Feedback', icon: 'msg', mantine: 'Tooltip',
  desc: 'A short hint on hover or focus. Hover the button.',
  controls: [{ k: 'text', t: 'text', d: 'Score updates every 24 hours' }, { k: 'position', t: 'seg', o: ['top', 'bottom'], d: 'top' }],
  render: p => { const t = `<div class="h-tooltip${p.position === 'bottom' ? ' below' : ''}">${esc(p.text)}</div>`, b = `<div style="padding-left:12px"><button class="h-icon-btn" aria-label="${esc(p.text)}">${ic('info')}</button></div>`; return `<div style="display:flex;flex-direction:column;gap:8px">${p.position === 'top' ? t + b : b + t}</div>`; },
  react: p => `<Tooltip label="${p.text}" position="${p.position}" withArrow>
  <ActionIcon variant="default" aria-label="More info"><IconInfoCircle size={16} /></ActionIcon>
</Tooltip>`,
  anatomy: [['Background', 'bg-inverse'], ['Type', 'type-caption white'], ['Max width', '240'], ['Delay', '300ms in · 0 out']],
  tokens: ['--bg-inverse', '--type-caption', '--radius-sm', '--shadow-md', '--z-dropdown'],
  rules: { when: ['Naming icon buttons', 'One extra fact that is nice to know'], whenNot: ['Information people need to finish a task'], do: ['Keep it under 80 characters'], dont: ['Put links or buttons in a tooltip'], a11y: ['Shows on keyboard focus too', 'Linked with aria-describedby'] },
});

C('modal', {
  name: 'Modal', group: 'Feedback', icon: 'layers', mantine: 'Modal',
  desc: 'Stops the flow to confirm or collect something. Shown inline here.',
  controls: [{ k: 'kind', t: 'seg', o: ['form', 'destructive'], d: 'destructive' }, { k: 'title', t: 'text', d: 'Remove sharing for 3 agents?' }],
  render: p => `<div class="h-modal" role="dialog" aria-modal="true" aria-labelledby="mt"><div class="h-modal-head"><div><b id="mt">${esc(p.title)}</b><small>${p.kind === 'destructive' ? 'People will lose access right away.' : 'Owners get an email when you save.'}</small></div><button class="h-icon-btn ghost sm" aria-label="Close">${ic('x')}</button></div><div class="h-modal-body">${p.kind === 'destructive' ? `<div class="h-note warning">${ic('alert')}<span><b>This can’t be undone.</b> 1,204 people use these agents.</span></div>${H.agents.slice(0, 3).map(a => `<div class="h-mrow-top" style="margin:0"><span>${a.name}</span>${H.riskBadge(a.risk, { sm: true })}</div>`).join('')}` : `<div class="h-field"><label>New owner<span class="req">*</span></label><div class="h-input"><input placeholder="Search people"></div></div><label class="h-inline"><span class="h-check on">${ic('check', 'ic-sm')}</span>Notify the current owner</label>`}</div><div class="h-modal-foot"><button class="h-btn secondary">Cancel</button><button class="h-btn ${p.kind === 'destructive' ? 'danger' : 'primary'}">${p.kind === 'destructive' ? 'Remove sharing' : 'Save owner'}</button></div></div>`,
  react: p => `<Modal opened={opened} onClose={close} title="${p.title}" radius="lg">
  …
  <Group justify="flex-end">
    <Button variant="secondary" onClick={close}>Cancel</Button>
    <Button${p.kind === 'destructive' ? ' variant="danger"' : ''}>${p.kind === 'destructive' ? 'Remove sharing' : 'Save owner'}</Button>
  </Group>
</Modal>`,
  anatomy: [['Width', '440 (lg 640)'], ['Radius', 'radius-xl · 16'], ['Shadow', 'shadow-lg'], ['Sections', 'head / body / foot, divided by border-subtle'], ['Overlay', 'bg-overlay']],
  tokens: ['--bg-surface', '--bg-overlay', '--radius-xl', '--shadow-lg', '--border-subtle', '--z-modal', '--action-danger'],
  rules: { when: ['Confirming destructive actions', 'Short forms that must finish before moving on'], whenNot: ['Long forms: use a page', 'Plain information: use a Callout'], do: ['Title is the question: "Remove sharing for 3 agents?"', 'The confirm button repeats the verb', 'Show what will be affected'], dont: ['Use "Are you sure?"', 'Open a modal from a modal'], a11y: ['Focus moves in and is trapped', 'Esc closes', 'Focus returns to the trigger'] },
});

C('toast', {
  name: 'Toast', group: 'Feedback', icon: 'bell', mantine: 'notifications.show',
  desc: 'Confirms that something happened. Press the button to fire a real one.',
  controls: [{ k: 'message', t: 'text', d: 'Sharing removed from 3 agents' }, { k: 'undo', t: 'bool', d: true, l: 'Undo link' }],
  render: p => `<div style="display:flex;flex-direction:column;align-items:center;gap:20px"><div class="h-toast" role="status">${ic('check')}${esc(p.message)}${p.undo ? '<a href="#" onclick="return false">Undo</a>' : ''}</div><button class="h-btn secondary sm" data-act="fire">${ic('bell')}Fire a real toast</button></div>`,
  wire: (el, p) => el.querySelector('[data-act=fire]')?.addEventListener('click', () => H.toast(p.message, p.undo)),
  react: p => `notifications.show({
  message: '${p.message}',
  icon: <IconCheck />,${p.undo ? "\n  action: { label: 'Undo', onClick: undo }," : ''}
  autoClose: 5000,
});`,
  anatomy: [['Background', 'bg-inverse'], ['Position', 'bottom-right · 24 from edges'], ['Duration', '5s · stays on hover'], ['Icon', 'green-500 check']],
  tokens: ['--bg-inverse', '--green-500', '--teal-200', '--radius-md', '--shadow-md', '--z-toast', '--duration-slow'],
  rules: { when: ['Confirming an action the person just took'], whenNot: ['Errors that need action: use a Callout or Modal'], do: ['Say what happened in past tense', 'Offer Undo for reversible actions'], dont: ['Stack more than 3', 'Use toasts for warnings'], a11y: ['role="status" so screen readers announce it', 'Pauses on hover and focus'] },
});

C('empty-state', {
  name: 'Empty State', group: 'Feedback', icon: 'search', mantine: 'Custom · Skeleton',
  desc: 'What people see when there is nothing yet, nothing found, or data is still loading.',
  controls: [{ k: 'kind', t: 'seg', o: ['first use', 'no results', 'partial', 'loading'], d: 'first use' }],
  render: p => p.kind === 'loading' ? `<div class="h-card fit" style="max-width:420px"><div class="h-skel" style="height:14px;width:40%"></div><div class="h-skel" style="height:36px;width:30%;margin:16px 0 8px"></div><div class="h-skel" style="height:10px;width:70%;margin-bottom:16px"></div><div class="h-skel" style="height:8px"></div></div>`
    : p.kind === 'partial' ? `<div class="h-card fit h-partial" style="max-width:480px"><div class="h-sec-title" style="margin-bottom:12px">${ic('chart')}Conversations over time</div><div class="h-hatch">Data from Power Platform is still syncing · about 10 min</div></div>`
    : `<div class="h-empty fit" style="max-width:520px"><div class="h-tile" style="background:${p.kind === 'first use' ? 'var(--agent-studio-bg);color:var(--agent-studio-fg)' : 'var(--bg-hover);color:var(--text-secondary)'}">${ic(p.kind === 'first use' ? 'robot' : 'search', 'ic-lg')}</div><b>${p.kind === 'first use' ? 'No agents found yet' : 'No agents match these filters'}</b><p>${p.kind === 'first use' ? 'Connect Copilot Studio and SharePoint to see every agent in your tenant.' : 'Try a different risk level or clear the filters to see all 248 agents.'}</p><button class="h-btn ${p.kind === 'first use' ? 'primary' : 'secondary'}">${p.kind === 'first use' ? ic('plug') + 'Connect sources' : 'Clear filters'}</button></div>`,
  react: p => p.kind === 'loading' ? `<Skeleton height={14} width="40%" />\n<Skeleton height={36} width="30%" mt="md" />` : p.kind === 'partial' ? `<PartialData message="Data from Power Platform is still syncing" eta="10 min" />` : `<EmptyState
  icon={<Icon${p.kind === 'first use' ? 'Robot' : 'Search'} />}
  title="${p.kind === 'first use' ? 'No agents found yet' : 'No agents match these filters'}"
  action={<Button${p.kind === 'first use' ? '' : ' variant="secondary"'}>${p.kind === 'first use' ? 'Connect sources' : 'Clear filters'}</Button>}
/>`,
  anatomy: [['Padding', '48 / 32'], ['Border', '1px dashed border-strong'], ['Icon tile', '48×48'], ['Text max width', '360'], ['Skeleton', 'shimmer 1.4s']],
  tokens: ['--border-strong', '--bg-surface', '--type-heading-m', '--type-body-s', '--ink-25', '--ink-50', '--ink-100'],
  rules: { when: ['A list or chart has nothing to show yet'], whenNot: ['An error: say what went wrong instead'], do: ['Say why it is empty and what to do next', 'Use skeletons that match the real layout'], dont: ['Show a spinner for more than 1 second', 'Use illustrations that do not match the product'], a11y: ['Loading regions use aria-busy="true"'] },
});

/* ---- AI pattern ---- */
C('ai-insight', {
  name: 'AI Insight', group: 'AI patterns', icon: 'sparkle', mantine: 'Card (custom)',
  desc: 'Harmony’s signature pattern for AI. It always says what it found, why, how sure it is, and what to do.',
  controls: [{ k: 'confidence', t: 'seg', o: ['high', 'medium', 'low'], d: 'high' }, { k: 'state', t: 'seg', o: ['ready', 'thinking', 'applied'], d: 'ready' }, { k: 'sources', t: 'bool', d: true, l: 'Show sources' }],
  render: p => `<div class="h-card fit" style="max-width:520px;border-color:var(--teal-100);background:linear-gradient(170deg,var(--teal-50),var(--bg-surface) 45%)">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span class="h-badge brand">${ic('sparkle', 'ic-sm')}Orchestry AI</span>${p.state === 'ready' ? H.badge(p.confidence === 'high' ? 'success' : p.confidence === 'medium' ? 'warning' : 'neutral', cap(p.confidence) + ' confidence') : ''}</div>
  ${p.state === 'thinking' ? `<div class="h-skel" style="height:16px;width:70%;margin-bottom:10px"></div><div class="h-skel" style="height:12px;width:90%;margin-bottom:6px"></div><div class="h-skel" style="height:12px;width:60%"></div><div style="font:var(--type-caption);color:var(--text-secondary);margin-top:12px">Reading 248 agents and 1,920 sharing links…</div>`
  : `<div style="font:var(--type-heading-m);margin-bottom:6px">${p.state === 'applied' ? 'Sharing limited on 3 agents' : '3 HR agents are shared with the whole company'}</div>
  <div style="font:var(--type-body-s);color:var(--ink-700);margin-bottom:12px">${p.state === 'applied' ? 'Only the HR team can use them now. Their risk dropped from Critical to Moderate.' : 'They answer from sites with salary data. Limiting them to the HR team would lower their risk from <b>Critical</b> to <b>Moderate</b>.'}</div>
  ${p.sources ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px"><span class="h-tag">${ic('file', 'ic-sm')}HR Policies site</span><span class="h-tag">${ic('users', 'ic-sm')}Everyone except external</span><span class="h-tag">+2 sources</span></div>` : ''}
  <div style="display:flex;gap:8px">${p.state === 'applied' ? `<button class="h-btn secondary sm">${ic('refresh')}Undo</button><button class="h-btn subtle sm">View agents</button>` : `<button class="h-btn primary sm">Limit sharing</button><button class="h-btn secondary sm">Review first</button><button class="h-btn subtle sm">Dismiss</button>`}</div>`}
</div>`,
  react: p => `<AIInsight
  state="${p.state}"
  confidence="${p.confidence}"
  title="3 HR agents are shared with the whole company"
  reason="They answer from sites with salary data…"${p.sources ? "\n  sources={['HR Policies site', 'Everyone except external']}" : ''}
  primaryAction={{ label: 'Limit sharing', onClick: apply }}
  secondaryAction={{ label: 'Review first' }}
  onDismiss={dismiss}
/>`,
  anatomy: [['Label', 'brand badge "Orchestry AI" always first'], ['Confidence', 'success / warning / neutral badge'], ['Title', 'the finding, in one sentence'], ['Reason', 'why + what changes'], ['Sources', 'tags, max 2 + more'], ['Actions', 'do it · review · dismiss']],
  tokens: ['--teal-50', '--teal-100', '--teal-800', '--bg-surface', '--type-heading-m', '--type-body-s', '--status-success-bg', '--status-warning-bg'],
  rules: {
    when: ['Orchestry AI found something and can suggest an action'],
    whenNot: ['Plain system messages: use a Callout'],
    do: ['Always label it as AI', 'Show confidence and the sources it used', 'Say what will change before people click', 'Offer Undo after applying'],
    dont: ['Apply changes without a click', 'Hide low-confidence results: show them as low', 'Use sparkle icons on non-AI content'],
    a11y: ['Thinking state uses aria-busy', 'Result is announced with role="status"'],
  },
});
})();
