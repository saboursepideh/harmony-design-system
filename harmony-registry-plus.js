/* =====================================================================
   HARMONY 3.0: the full product set.
   Everything Orchestry needs across every page, not only AI & agents:
   forms, overlays, wizards, workspace lifecycle, M365 labels, AI chat…
   Same contract as harmony-registry.js.
   ===================================================================== */
(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));
const col = (html, gap = 12, extra = '') => `<div style="display:flex;flex-direction:column;gap:${gap}px;${extra}">${html}</div>`;
const row = (html, gap = 8, extra = '') => `<div style="display:flex;align-items:center;flex-wrap:wrap;gap:${gap}px;${extra}">${html}</div>`;
H.col = col; H.row = row;

/* =================================================================== ACTIONS */
C('button-group', {
  name: 'Button Group', group: 'Actions', icon: 'grid', mantine: 'Button.Group',
  desc: 'Joins related buttons. Use it as a view toggle, or as a split button: one main action with more options behind the arrow.',
  controls: [
    { k: 'kind', t: 'seg', o: ['toggle', 'split', 'toolbar'], d: 'toggle' },
    { k: 'selected', t: 'select', o: ['Grid', 'List', 'Board'], d: 'Grid' },
    { k: 'size', t: 'seg', o: ['sm', 'md'], d: 'md' },
  ],
  render: p => {
    const s = p.size === 'sm' ? ' sm' : '';
    if (p.kind === 'split') return `<div class="h-btn-group split"><button class="h-btn primary${s}">${ic('plus')}New workspace</button><button class="h-btn primary${s}" aria-label="More create options">${ic('down')}</button></div>`;
    if (p.kind === 'toolbar') return `<div class="h-btn-group"><button class="h-btn secondary${s}">${ic('download')}Export</button><button class="h-btn secondary${s}">${ic('copy')}Duplicate</button><button class="h-btn secondary${s}">${ic('archive')}Archive</button></div>`;
    return `<div class="h-btn-group" role="radiogroup" aria-label="View">${[['Grid', 'grid'], ['List', 'menu'], ['Board', 'layers']].map(([l, i]) => `<button class="h-btn secondary${s}${p.selected === l ? ' on' : ''}" role="radio" aria-checked="${p.selected === l}" data-pick="${l}">${ic(i)}${l}</button>`).join('')}</div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => set({ selected: b.dataset.pick }))),
  react: p => p.kind === 'split' ? `<Button.Group>
  <Button leftSection={<IconPlus size={16} />}>New workspace</Button>
  <Menu position="bottom-end">
    <Menu.Target>
      <Button px={8} aria-label="More create options"><IconChevronDown size={16} /></Button>
    </Menu.Target>
    <Menu.Dropdown>
      <Menu.Item>From template</Menu.Item>
      <Menu.Item>Import existing team</Menu.Item>
    </Menu.Dropdown>
  </Menu>
</Button.Group>` : p.kind === 'toolbar' ? `<Button.Group>
  <Button variant="secondary" leftSection={<IconDownload size={16} />}>Export</Button>
  <Button variant="secondary" leftSection={<IconCopy size={16} />}>Duplicate</Button>
  <Button variant="secondary" leftSection={<IconArchive size={16} />}>Archive</Button>
</Button.Group>` : `<SegmentedButtons
  value={view}
  onChange={setView}
  data={['Grid', 'List', 'Board']}${p.size === 'sm' ? '\n  size="sm"' : ''}
/>`,
  anatomy: [['Join', 'radius only on the outer corners · -1px overlap'], ['Selected', 'bg-selected · border-brand · text-brand'], ['Split arrow', '8px padding · divider 28% on-brand'], ['Height', 'control-h-sm/md']],
  tokens: ['--bg-surface', '--bg-selected', '--border-default', '--border-brand', '--text-brand', '--action-primary', '--text-on-brand', '--radius-md', '--control-h-md'],
  rules: {
    when: ['2–4 actions that belong together, like Export, Duplicate and Archive', 'Switching the layout of the same data (Grid / List)', 'One main action with a few close variations (split button)'],
    whenNot: ['Filtering data: use Segmented Control or Filter Bar', 'Actions that are not related'],
    do: ['Keep labels short and the same length when you can', 'Put the most used option first', 'Always add an aria-label to the split arrow'],
    dont: ['Mix primary and secondary buttons in one group (except split)', 'Put more than 4 buttons in a group: use a Menu'],
    a11y: ['Toggle groups use role="radiogroup" and aria-checked', 'The split arrow opens a Menu with arrow-key support'],
  },
});

C('link', {
  name: 'Link', group: 'Actions', icon: 'link', mantine: 'Anchor',
  desc: 'Takes people to another page or opens a resource. Links move you somewhere; buttons do something.',
  controls: [
    { k: 'kind', t: 'seg', o: ['standalone', 'inline', 'external'], d: 'standalone' },
    { k: 'tone', t: 'seg', o: ['brand', 'muted'], d: 'brand' },
    { k: 'state', t: 'seg', o: ['default', 'hover', 'focus'], d: 'default' },
  ],
  render: p => {
    const st = { hover: ' is-hover', focus: ' focus' }[p.state] || '';
    const t = p.tone === 'muted' ? ' muted' : '';
    if (p.kind === 'inline') return `<p style="font:var(--type-body-s);color:var(--text-body);max-width:380px;margin:0">This workspace will be archived in 14 days. <a class="h-link inline${t}${st}" href="#" onclick="return false">Review the lifecycle policy</a> to keep it active.</p>`;
    if (p.kind === 'external') return `<a class="h-link${t}${st}" href="#" onclick="return false">Open in SharePoint${ic('external', 'ic-sm')}<span class="sr-only"> (opens in a new tab)</span></a>`;
    return `<a class="h-link${t}${st}" href="#" onclick="return false">View all workspaces${ic('right', 'ic-sm')}</a>`;
  },
  react: p => p.kind === 'external' ? `<Anchor href={siteUrl} target="_blank" rel="noreferrer"${p.tone === 'muted' ? ' c="dimmed"' : ''}>
  Open in SharePoint <IconExternalLink size={14} />
</Anchor>` : p.kind === 'inline' ? `<Text size="sm">
  This workspace will be archived in 14 days.{' '}
  <Anchor component={Link} to="/policies/lifecycle" underline="always">Review the lifecycle policy</Anchor> to keep it active.
</Text>` : `<Anchor component={Link} to="/workspaces"${p.tone === 'muted' ? ' c="dimmed"' : ''}>
  View all workspaces <IconChevronRight size={14} />
</Anchor>`,
  anatomy: [['Type', 'type-button · 13/20 600 (inline inherits)'], ['Color', 'text-brand · muted text-secondary'], ['Icon', '14px · gap 4px'], ['Underline', 'inline only · offset 3px']],
  tokens: ['--text-brand', '--text-secondary', '--type-button', '--focus-ring', '--radius-xs'],
  rules: {
    when: ['Going to another page, a doc or an external app (SharePoint, Teams)', '"View all" at the bottom of a card'],
    whenNot: ['Saving, deleting or starting anything: use a Button'],
    do: ['Say where it goes: "Open in SharePoint"', 'Add the external icon when it leaves Orchestry', 'Underline links inside sentences'],
    dont: ['Write "Click here"', 'Style a link to look like a button'],
    a11y: ['External links say "opens in a new tab" to screen readers', 'Links inside text are underlined, not only colored'],
  },
});

C('action-menu', {
  name: 'Action Menu', group: 'Actions', icon: 'dots', mantine: 'Menu',
  desc: 'The "more actions" menu behind a ⋯ button. Groups actions, shows shortcuts and keeps dangerous actions at the bottom.',
  controls: [
    { k: 'context', t: 'seg', o: ['workspace', 'agent', 'user'], d: 'workspace' },
    { k: 'shortcuts', t: 'bool', d: true, l: 'Show shortcuts' },
    { k: 'danger', t: 'bool', d: true, l: 'Danger action' },
    { k: 'disabled', t: 'bool', d: false, l: 'One item disabled' },
  ],
  render: p => {
    const sets = {
      workspace: [['Open in Teams', 'external', '⌘O'], ['Edit details', 'edit', 'E'], ['Change owners', 'users', ''], ['Apply template', 'layers', ''], ['Archive', 'archive', '']],
      agent: [['Open agent', 'external', '⌘O'], ['Review sharing', 'eye', 'R'], ['Assign owner', 'user', ''], ['Run risk scan', 'refresh', ''], ['Pause agent', 'clock', '']],
      user: [['View profile', 'user', ''], ['Send message', 'mail', 'M'], ['Copy email', 'copy', '⌘C'], ['Reset access', 'key', ''], ['Make owner', 'shield', '']],
    }[p.context];
    const del = { workspace: 'Delete workspace', agent: 'Delete agent', user: 'Remove from tenant' }[p.context];
    const item = ([l, i, k], n) => `<div class="mi${p.disabled && n === 3 ? ' dis' : ''}" role="menuitem"${p.disabled && n === 3 ? ' aria-disabled="true"' : ''}>${ic(i)}${esc(l)}${p.shortcuts && k ? `<span class="kbd-r h-kbd">${k}</span>` : ''}</div>`;
    return `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><button class="h-icon-btn" aria-label="More actions" aria-expanded="true">${ic('dots')}</button><div class="h-menu" role="menu" style="min-width:230px">${sets.slice(0, 3).map(item).join('')}<hr>${sets.slice(3).map((x, n) => item(x, n + 3)).join('')}${p.danger ? `<hr><div class="mi danger" role="menuitem">${ic('trash')}${del}</div>` : ''}</div></div>`;
  },
  react: p => `<Menu position="bottom-end" width={230}>
  <Menu.Target>
    <ActionIcon variant="default" aria-label="More actions"><IconDots size={16} /></ActionIcon>
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Item leftSection={<IconExternalLink size={16} />}${p.shortcuts ? ' rightSection={<Kbd>⌘O</Kbd>}' : ''}>Open in Teams</Menu.Item>
    <Menu.Item leftSection={<IconPencil size={16} />}>Edit details</Menu.Item>
    <Menu.Item leftSection={<IconUsers size={16} />}>Change owners</Menu.Item>
    <Menu.Divider />
    <Menu.Item leftSection={<IconArchive size={16} />}${p.disabled ? ' disabled' : ''}>Archive</Menu.Item>${p.danger ? `
    <Menu.Divider />
    <Menu.Item color="red" leftSection={<IconTrash size={16} />}>Delete workspace</Menu.Item>` : ''}
  </Menu.Dropdown>
</Menu>`,
  anatomy: [['Menu', 'radius-md · shadow-md · padding 6 · min 230'], ['Item', '7/10 padding · type-body-s · icon 16'], ['Shortcut', 'Kbd · right aligned'], ['Danger', 'status-danger-fg · always last, after a divider']],
  tokens: ['--bg-surface', '--border-default', '--shadow-md', '--bg-hover', '--text-secondary', '--status-danger-fg', '--text-disabled', '--radius-md', '--radius-sm', '--z-dropdown'],
  rules: {
    when: ['A row, card or page has more actions than fit as buttons', 'Actions people use less often'],
    whenNot: ['The main action of the page: show it as a Button', 'Picking a value: use Select'],
    do: ['Group with dividers: open, edit, manage, then danger', 'Put destructive actions last and in red', 'Ask for confirmation after a danger item'],
    dont: ['Hide the only way to do something important in a menu', 'Nest menus more than one level deep'],
    a11y: ['role="menu" and role="menuitem"', 'Arrow keys move, Enter runs, Esc closes and returns focus to ⋯', 'Disabled items use aria-disabled and stay focusable'],
  },
});

/* =================================================================== INPUTS */
C('textarea', {
  name: 'Textarea', group: 'Inputs', icon: 'type', mantine: 'Textarea',
  desc: 'Longer text, like a workspace description or a reason for an access request. Type in it: the counter updates live.',
  controls: [
    { k: 'label', t: 'text', d: 'Business justification' },
    { k: 'state', t: 'seg', o: ['default', 'error', 'disabled'], d: 'default' },
    { k: 'counter', t: 'bool', d: true, l: 'Character count' },
    { k: 'max', t: 'range', min: 60, max: 500, d: 200, l: 'Max length' },
  ],
  render: p => `<div class="h-field fit" style="max-width:420px">
  <div class="row"><label for="ta">${esc(p.label)}<span class="req">*</span></label></div>
  <div class="h-textarea${p.state === 'error' ? ' error' : ''}"${p.state === 'disabled' ? ' style="background:var(--bg-hover)"' : ''}><textarea id="ta" maxlength="${p.max}" placeholder="Why does this team need a new workspace?"${p.state === 'disabled' ? ' disabled' : ''}${p.state === 'error' ? ' aria-invalid="true"' : ''}>${p.state === 'error' ? '' : 'Our launch team needs one place to share files with the agency.'}</textarea></div>
  <div class="row"><small class="${p.state === 'error' ? 'err' : ''}">${p.state === 'error' ? 'Add a short reason so approvers can decide.' : 'Approvers see this in their request.'}</small>${p.counter ? `<span class="count" data-count>${p.state === 'error' ? 0 : 62}/${p.max}</span>` : ''}</div>
</div>`,
  wire: (el, p) => { const t = el.querySelector('textarea'), c = el.querySelector('[data-count]'); t && c && t.addEventListener('input', () => { c.textContent = `${t.value.length}/${p.max}`; c.classList.toggle('over', t.value.length >= p.max); }); },
  react: p => `<Textarea
  label="${p.label}"
  placeholder="Why does this team need a new workspace?"
  withAsterisk
  autosize
  minRows={3}
  maxLength={${p.max}}${p.counter ? `\n  description={\`\${value.length}/${p.max}\`}` : ''}${p.state === 'error' ? '\n  error="Add a short reason so approvers can decide."' : ''}${p.state === 'disabled' ? '\n  disabled' : ''}
/>`,
  anatomy: [['Min height', '72px · grows with content'], ['Padding', 'space-2 / space-3'], ['Counter', 'type-caption · right aligned · red at limit'], ['Border', 'same as Text Input']],
  tokens: ['--border-default', '--border-brand', '--focus-ring', '--status-danger-solid', '--status-danger-fg', '--text-secondary', '--radius-md', '--type-body-s', '--type-caption'],
  rules: {
    when: ['Text that may be longer than one line: descriptions, reasons, notes'],
    whenNot: ['Names and short values: use Text Input'],
    do: ['Show a counter when there is a limit', 'Let it grow as people type (autosize)', 'Use a placeholder that is a real example question'],
    dont: ['Cut off text without telling people', 'Make it smaller than 3 lines'],
    a11y: ['Counter is linked with aria-describedby', 'Resizing stays possible for people who zoom'],
  },
});

C('radio', {
  name: 'Radio Group', group: 'Inputs', icon: 'checks', mantine: 'Radio.Group',
  desc: 'Pick exactly one option, with all options visible. Card style works for big decisions, like workspace privacy.',
  controls: [
    { k: 'style', t: 'seg', o: ['list', 'cards'], d: 'cards' },
    { k: 'value', t: 'select', o: ['Private', 'Public', 'Org-wide'], d: 'Private' },
    { k: 'disabled', t: 'bool', d: false, l: 'Disable Org-wide' },
  ],
  render: p => {
    const o = [['Private', 'Only members can see and join.', 'lock'], ['Public', 'Anyone in Contoso can find and join.', 'world'], ['Org-wide', 'Everyone is added automatically.', 'users']];
    return `<div class="h-field" style="width:${p.style === 'cards' ? 360 : 320}px"><label id="rg">Who can join this workspace?</label><div class="h-radio-group${p.style === 'cards' ? ' cards' : ''}" role="radiogroup" aria-labelledby="rg">${o.map(([l, d, i]) => { const dis = p.disabled && l === 'Org-wide', on = p.value === l; return `<div class="h-radio-opt${on ? ' on' : ''}${dis ? ' dis' : ''}" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}"${dis ? ' aria-disabled="true"' : ` data-pick="${l}"`}><span class="h-radio${on ? ' on' : ''}"></span><span style="flex:1"><b>${l}</b><small>${d}${dis ? ' Needs Global admin.' : ''}</small></span>${p.style === 'cards' ? ic(i) : ''}</div>`; }).join('')}</div></div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-pick]').forEach(o => o.addEventListener('click', () => set({ value: o.dataset.pick }))),
  react: p => `<Radio.Group label="Who can join this workspace?" value={privacy} onChange={setPrivacy}>
  <Stack gap="xs">
    <Radio${p.style === 'cards' ? '.Card' : ''} value="private" label="Private" description="Only members can see and join." />
    <Radio${p.style === 'cards' ? '.Card' : ''} value="public" label="Public" description="Anyone in Contoso can find and join." />
    <Radio${p.style === 'cards' ? '.Card' : ''} value="org" label="Org-wide" description="Everyone is added automatically."${p.disabled ? ' disabled' : ''} />
  </Stack>
</Radio.Group>`,
  anatomy: [['Control', '16×16 · dot inset 3px'], ['Card', 'padding space-3 · radius-md'], ['Selected card', 'bg-selected · 2px border-brand'], ['Gap', 'space-2 between options']],
  tokens: ['--action-primary', '--text-disabled', '--bg-surface', '--bg-selected', '--border-brand', '--border-default', '--radius-md', '--type-body-s', '--type-caption'],
  rules: {
    when: ['2–5 options and people should compare them before picking', 'Decisions with a consequence, like privacy or retention'],
    whenNot: ['More than 5 options: use Select', 'On/off: use Switch', 'Several answers allowed: use Checkbox'],
    do: ['Always pre-select the safest option', 'Add a one-line description for each option', 'Say why an option is disabled'],
    dont: ['Leave a group with nothing selected', 'Use radios to trigger actions right away'],
    a11y: ['role="radiogroup" with a label', 'Arrow keys move between options; Tab leaves the group'],
  },
});

C('segmented', {
  name: 'Segmented Control', group: 'Inputs', icon: 'layers', mantine: 'SegmentedControl',
  desc: 'A compact switch between 2–5 views or time ranges. Changes apply right away.',
  controls: [
    { k: 'set', t: 'seg', o: ['range', 'scope', 'icons'], d: 'range' },
    { k: 'size', t: 'seg', o: ['sm', 'md'], d: 'md' },
    { k: 'full', t: 'bool', d: false, l: 'Full width' },
    { k: 'value', t: 'select', o: ['0', '1', '2', '3'], d: '1', l: 'Selected index' },
  ],
  render: p => {
    const sets = { range: ['24h', '7 days', '30 days', '90 days'], scope: ['All', 'Teams', 'SharePoint', 'Groups'], icons: [['Grid', 'grid'], ['List', 'menu'], ['Chart', 'chart']] }[p.set];
    return `<div class="h-seg${p.size === 'sm' ? ' sm' : ''}${p.full ? ' full' : ''}" role="radiogroup" aria-label="Time range" style="${p.full ? 'width:360px' : ''}">${sets.map((o, i) => { const lab = Array.isArray(o) ? o[0] : o; return `<button role="radio" aria-checked="${+p.value === i}" class="${+p.value === i ? 'on' : ''}" data-pick="${i}">${Array.isArray(o) ? ic(o[1], 'ic-sm') : ''}${lab}</button>`; }).join('')}</div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => set({ value: b.dataset.pick }))),
  react: p => `<SegmentedControl
  value={range}
  onChange={setRange}
  data={${JSON.stringify(p.set === 'range' ? ['24h', '7 days', '30 days', '90 days'] : p.set === 'scope' ? ['All', 'Teams', 'SharePoint', 'Groups'] : ['Grid', 'List', 'Chart'])}}${p.size === 'sm' ? '\n  size="sm"' : ''}${p.full ? '\n  fullWidth' : ''}
/>`,
  anatomy: [['Track', 'bg-hover · padding 3 · radius-md'], ['Segment', '26 high (sm 22) · type-label'], ['Selected', 'bg-surface · shadow-xs · text-primary']],
  tokens: ['--bg-hover', '--bg-surface', '--shadow-xs', '--text-primary', '--text-secondary', '--radius-md', '--type-label'],
  rules: {
    when: ['Switching time range on a chart', 'Changing the view of the same data'],
    whenNot: ['More than 5 options: use Select', 'Navigating between pages: use Tabs'],
    do: ['Keep labels to 1–2 words', 'Use the same order everywhere (shortest range first)'],
    dont: ['Mix icon-only and text segments', 'Use it inside a form that has a Save button'],
    a11y: ['role="radiogroup" + aria-checked', 'Icon-only segments need aria-label'],
  },
});

C('people-picker', {
  name: 'People Picker', group: 'Inputs', icon: 'users', mantine: 'MultiSelect · Combobox',
  desc: 'Search and pick people or groups from Microsoft Entra ID. Used for owners, members and approvers. Click × to remove someone.',
  controls: [
    { k: 'label', t: 'text', d: 'Owners' },
    { k: 'open', t: 'bool', d: true, l: 'Results open' },
    { k: 'picked', t: 'range', min: 0, max: 3, d: 2, l: 'People picked' },
    { k: 'error', t: 'bool', d: false, l: 'Min 2 owners error' },
  ],
  render: p => {
    const pk = H.people.slice(0, p.picked);
    return `<div class="h-field" style="width:380px;min-height:${p.open ? 280 : 70}px"><label>${esc(p.label)}<span class="req">*</span></label>
<div class="h-combo${p.open ? ' open' : ''}"${p.error ? ' style="border-color:var(--status-danger-solid)"' : ''}>${pk.map(([n], i) => `<span class="h-chip">${H.avatar(n, i)}${n}<button aria-label="Remove ${n}" data-rm>${ic('x')}</button></span>`).join('')}<input placeholder="${pk.length ? 'Add another…' : 'Search people or groups'}" value="${p.open ? 'an' : ''}" aria-expanded="${p.open}" role="combobox"></div>
${p.error ? `<small class="err">Every workspace needs at least 2 owners.</small>` : `<small>Owners can add members and approve guests.</small>`}
${p.open ? `<div class="h-pop" role="listbox"><div class="h-opt" role="option">${H.avatar('Ana Gomez', 3)}<span class="meta"><b>Ana Gomez</b><small>ana.gomez@contoso.com · Marketing</small></span></div><div class="h-opt on" role="option">${H.avatar('Daniel Novak', 5)}<span class="meta"><b>Daniel Novak</b><small>daniel.novak@contoso.com · IT</small></span>${ic('check', 'ic ck')}</div><div class="h-opt" role="option"><span class="h-tile sm" style="background:var(--entity-neutral-bg);color:var(--entity-neutral-fg)">${ic('team', 'ic-sm')}</span><span class="meta"><b>Analytics Team</b><small>Microsoft 365 group · 24 members</small></span></div></div>` : ''}</div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => set({ picked: Math.max(0, p.picked - 1) }))),
  react: p => `<PeoplePicker
  label="${p.label}"
  placeholder="Search people or groups"
  withAsterisk
  source="entra"           // searches Microsoft Entra ID
  include={['users', 'groups']}
  value={owners}
  onChange={setOwners}${p.error ? '\n  error="Every workspace needs at least 2 owners."' : '\n  description="Owners can add members and approve guests."'}
/>`,
  anatomy: [['Field', 'min 32 high · wraps chips · padding 4/6'], ['Chip', '24 high · avatar 20 · remove 18'], ['Result row', 'avatar 32 · name 13/18 500 · email caption'], ['Dropdown', 'shadow-md · radius-md']],
  tokens: ['--bg-surface', '--bg-hover', '--border-default', '--border-brand', '--focus-ring', '--shadow-md', '--text-secondary', '--text-brand', '--radius-full', '--radius-md', '--viz-1'],
  rules: {
    when: ['Picking owners, members, approvers or guests', 'Any field that stores people or groups'],
    whenNot: ['Picking from a short fixed list: use Select'],
    do: ['Show email and department so people pick the right "Ana"', 'Mark groups with an icon tile, not an avatar', 'Start searching after 2 letters'],
    dont: ['Show people outside the tenant unless guests are allowed', 'Remove someone without an undo'],
    a11y: ['role="combobox" with aria-expanded', 'Backspace removes the last chip', 'Each × has "Remove {name}" as its label'],
  },
});
})();

(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));

C('checkbox', {
  name: 'Checkbox', group: 'Inputs', icon: 'check', mantine: 'Checkbox',
  desc: 'Turn on one or more options. Supports a "some selected" state for select-all in tables and trees. Click the boxes.',
  controls: [
    { k: 'layout', t: 'seg', o: ['group', 'single', 'select-all'], d: 'group' },
    { k: 'checked', t: 'range', min: 0, max: 4, d: 2, l: 'Checked items' },
    { k: 'error', t: 'bool', d: false, l: 'Error' },
    { k: 'disabled', t: 'bool', d: false, l: 'Disable last' },
  ],
  render: p => {
    const box = (on, mixed) => `<span class="h-check${on || mixed ? ' on' : ''}" aria-hidden="true">${mixed ? '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' : on ? ic('check', 'ic-sm') : ''}</span>`;
    const opts = [['Teams', 'Channels, chats and meetings'], ['SharePoint sites', 'Communication and team sites'], ['Microsoft 365 groups', 'Groups without a team'], ['Viva Engage', 'Communities']];
    if (p.layout === 'single') return `<label style="display:flex;gap:10px;align-items:flex-start;max-width:340px;cursor:pointer" data-tog>${box(p.checked > 0)}<span style="font:var(--type-body-s)"><b style="font-weight:500;color:var(--text-primary)">I understand this deletes all files</b><br><span style="color:var(--text-secondary);font:var(--type-caption)">Deleted files stay in the recycle bin for 93 days.</span></span></label>`;
    const n = p.checked, all = p.layout === 'select-all';
    return `<fieldset style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;min-width:300px"><legend style="font:var(--type-label);color:var(--text-primary);margin-bottom:10px">Include in the scan</legend>${all ? `<label style="display:flex;gap:10px;align-items:center;font:500 13px/18px var(--font-sans);padding-bottom:10px;border-bottom:1px solid var(--border-subtle);cursor:pointer" data-all>${box(n === 4, n > 0 && n < 4)}Select all <span style="color:var(--text-secondary);font-weight:400">(${n} of 4)</span></label>` : ''}${opts.map(([l, d], i) => { const dis = p.disabled && i === 3, on = i < n; return `<label style="display:flex;gap:10px;align-items:flex-start;cursor:${dis ? 'not-allowed' : 'pointer'};opacity:${dis ? .5 : 1};${all ? 'padding-left:26px' : ''}" ${dis ? '' : `data-i="${i}"`}>${box(on)}<span style="font:var(--type-body-s);color:var(--text-primary)">${l}<br><span style="color:var(--text-secondary);font:var(--type-caption)">${d}</span></span></label>`; }).join('')}${p.error ? '<small class="err" style="font:var(--type-caption);color:var(--status-danger-fg)">Pick at least one service.</small>' : ''}</fieldset>`;
  },
  wire: (el, p, set) => {
    el.querySelectorAll('[data-i]').forEach(l => l.addEventListener('click', e => { e.preventDefault(); const i = +l.dataset.i; set({ checked: i < p.checked ? i : i + 1 }); }));
    const a = el.querySelector('[data-all]'); a && a.addEventListener('click', e => { e.preventDefault(); set({ checked: p.checked === 4 ? 0 : 4 }); });
    const t = el.querySelector('[data-tog]'); t && t.addEventListener('click', e => { e.preventDefault(); set({ checked: p.checked ? 0 : 1 }); });
  },
  react: p => p.layout === 'single' ? `<Checkbox
  label="I understand this deletes all files"
  description="Deleted files stay in the recycle bin for 93 days."
  checked={confirmed}
  onChange={e => setConfirmed(e.currentTarget.checked)}
/>` : `<Checkbox.Group label="Include in the scan" value={services} onChange={setServices}${p.error ? '\n  error="Pick at least one service."' : ''}>${p.layout === 'select-all' ? `
  <Checkbox
    label="Select all"
    checked={services.length === all.length}
    indeterminate={services.length > 0 && services.length < all.length}
    onChange={toggleAll}
  />` : ''}
  <Stack gap="xs"${p.layout === 'select-all' ? ' pl="lg"' : ''}>
    <Checkbox value="teams" label="Teams" description="Channels, chats and meetings" />
    <Checkbox value="sites" label="SharePoint sites" description="Communication and team sites" />
    <Checkbox value="groups" label="Microsoft 365 groups" description="Groups without a team" />
    <Checkbox value="viva" label="Viva Engage" description="Communities"${p.disabled ? ' disabled' : ''} />
  </Stack>
</Checkbox.Group>`,
  anatomy: [['Box', '16×16 · radius-xs · 1.5px border'], ['Checked', 'action-primary fill · white check'], ['Indeterminate', 'same fill · dash'], ['Gap', '10px box to label · space-2 between items']],
  tokens: ['--action-primary', '--text-disabled', '--bg-surface', '--text-primary', '--text-secondary', '--status-danger-fg', '--radius-xs', '--focus-ring'],
  rules: {
    when: ['People can pick zero, one or many options', 'Selecting rows in a table', 'Confirming that they understand a risky action'],
    whenNot: ['Only one answer is allowed: use Radio', 'The change applies right away: use Switch'],
    do: ['Use indeterminate for "select all" when only some are picked', 'Write labels as positive statements', 'Make the whole label clickable'],
    dont: ['Use a checkbox to start an action', 'Use negative labels like "Don’t send emails"'],
    a11y: ['Native input type="checkbox" under the hood', 'Indeterminate sets aria-checked="mixed"', 'Group has a fieldset and legend'],
  },
});

C('date-picker', {
  name: 'Date Picker', group: 'Inputs', icon: 'cal', mantine: 'DatePickerInput',
  desc: 'Pick a single date or a range, with quick presets. Used for report ranges, guest expiry and archive dates. Click a day.',
  controls: [
    { k: 'mode', t: 'seg', o: ['single', 'range'], d: 'range' },
    { k: 'presets', t: 'bool', d: true, l: 'Show presets' },
    { k: 'day', t: 'range', min: 1, max: 30, d: 18, l: 'Selected day' },
  ],
  render: p => {
    const start = p.mode === 'range' ? Math.min(p.day, 11) : p.day, end = p.day;
    const pre = ['Today', 'Last 7 days', 'Last 30 days', 'This quarter', 'Custom'];
    let cells = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => `<span class="dow">${d}</span>`).join('') + [29, 30].map(d => `<span class="mute">${d}</span>`).join('');
    for (let d = 1; d <= 30; d++) {
      const sel = p.mode === 'range' ? d === start || d === end : d === end, inn = p.mode === 'range' && d > start && d < end;
      cells += `<span data-d="${d}" class="${sel ? 'sel' : inn ? 'in' : ''}${d === 14 ? ' today' : ''}" aria-selected="${sel}">${d}</span>`;
    }
    cells += [1, 2, 3].map(d => `<span class="mute">${d}</span>`).join('');
    const fmt = d => `Apr ${d}, 2025`;
    return `<div class="h-field" style="width:${p.presets ? 430 : 290}px"><label>${p.mode === 'range' ? 'Report period' : 'Guest access expires'}</label><div class="h-input focus">${ic('cal')}<span style="color:var(--text-primary)">${p.mode === 'range' ? `${fmt(start)} – ${fmt(end)}` : fmt(end)}</span></div><div class="h-pop" style="display:flex;padding:0;margin-top:4px">${p.presets ? `<div class="h-cal-presets">${pre.map((x, i) => `<span class="${(p.mode === 'range' ? i === 4 : i === 0) ? 'on' : ''}">${x}</span>`).join('')}</div>` : ''}<div class="h-cal"><div class="h-cal-head"><button class="h-icon-btn sm ghost" aria-label="Previous month">${ic('left')}</button>April 2025<button class="h-icon-btn sm ghost" aria-label="Next month">${ic('right')}</button></div><div class="h-cal-grid" role="grid">${cells}</div></div></div></div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-d]').forEach(s => s.addEventListener('click', () => set({ day: +s.dataset.d }))),
  react: p => `<DatePickerInput
  type="${p.mode === 'range' ? 'range' : 'default'}"
  label="${p.mode === 'range' ? 'Report period' : 'Guest access expires'}"
  leftSection={<IconCalendar size={16} />}
  value={value}
  onChange={setValue}${p.presets ? `
  presets={[
    { value: [dayjs(), dayjs()], label: 'Today' },
    { value: [dayjs().subtract(7, 'day'), dayjs()], label: 'Last 7 days' },
    { value: [dayjs().subtract(30, 'day'), dayjs()], label: 'Last 30 days' },
  ]}` : ''}
  valueFormat="MMM D, YYYY"
/>`,
  anatomy: [['Day cell', '34×32 · radius-sm'], ['Selected', 'action-primary · on-brand text'], ['In range', 'bg-selected · text-brand · square'], ['Today', '1px inset border-brand'], ['Presets', '128 wide · divider right']],
  tokens: ['--action-primary', '--text-on-brand', '--bg-selected', '--text-brand', '--border-brand', '--text-disabled', '--shadow-md', '--radius-sm', '--radius-md'],
  rules: {
    when: ['Report ranges, expiry dates, review dates', 'Any date people may not know by heart'],
    whenNot: ['Birthdays or dates far in the past: let people type'],
    do: ['Offer presets for common ranges', 'Show the full date in the field: "Apr 18, 2025"', 'Mark today'],
    dont: ['Allow dates that break a policy, like expiry past 180 days', 'Use only numbers like 04/05 (US and EU read it differently)'],
    a11y: ['role="grid" with arrow-key navigation', 'Each day has a full label: "Friday, April 18, 2025"', 'People can also type the date'],
  },
});

C('file-upload', {
  name: 'File Upload', group: 'Inputs', icon: 'upload', mantine: 'Dropzone',
  desc: 'Drag files in or browse. Used for importing users from CSV, uploading template assets and brand logos.',
  controls: [
    { k: 'state', t: 'seg', o: ['idle', 'dragging', 'uploading', 'done', 'error'], d: 'idle' },
    { k: 'compact', t: 'bool', d: false, l: 'Compact' },
  ],
  render: p => {
    const zone = `<div class="h-drop${p.state === 'dragging' ? ' over' : ''}"${p.compact ? ' style="padding:16px"' : ''}>${p.compact ? '' : `<div class="h-tile">${ic('upload')}</div>`}<div>${p.state === 'dragging' ? '<b style="color:inherit">Drop to upload</b>' : `<b>Drag a CSV here</b> or <a class="h-link" href="#" onclick="return false">browse</a>`}</div><div style="margin-top:4px;font:var(--type-caption)">CSV or XLSX · up to 10 MB · max 5,000 rows</div></div>`;
    const file = { uploading: `<div class="h-file"><div class="h-tile sm" style="background:var(--status-success-bg);color:var(--status-success-fg)">${ic('file', 'ic-sm')}</div><div class="meta"><b>guest-users-q2.csv</b><small>1.2 MB · uploading 64%</small><div class="h-progress" style="margin-top:6px;height:4px"><i style="width:64%"></i></div></div><button class="h-icon-btn sm ghost" aria-label="Cancel upload">${ic('x')}</button></div>`, done: `<div class="h-file"><div class="h-tile sm" style="background:var(--status-success-bg);color:var(--status-success-fg)">${ic('file', 'ic-sm')}</div><div class="meta"><b>guest-users-q2.csv</b><small>1.9 MB · 412 rows ready to import</small></div>${H.badge('success', 'Ready')}<button class="h-icon-btn sm ghost" aria-label="Remove file">${ic('trash')}</button></div>`, error: `<div class="h-file err"><div class="h-tile sm" style="background:var(--status-danger-bg);color:var(--status-danger-fg)">${ic('alert', 'ic-sm')}</div><div class="meta"><b>guest-users-q2.pdf</b><small>PDF is not supported. Upload a CSV or XLSX file.</small></div><button class="h-btn secondary sm">Try again</button></div>` }[p.state] || '';
    return `<div class="h-field fit" style="max-width:440px"><label>Import guest users</label>${zone}${file}</div>`;
  },
  react: p => `<Dropzone
  onDrop={setFiles}
  onReject={showError}
  maxSize={10 * 1024 ** 2}
  accept={[MIME_TYPES.csv, MIME_TYPES.xlsx]}
>
  <Stack align="center" gap={4}>
    <IconUpload size={20} />
    <Text fw={600}>Drag a CSV here or <Anchor>browse</Anchor></Text>
    <Text size="xs" c="dimmed">CSV or XLSX · up to 10 MB · max 5,000 rows</Text>
  </Stack>
</Dropzone>
${p.state === 'uploading' || p.state === 'done' || p.state === 'error' ? `<FileRow file={file} status="${p.state}" />` : ''}`,
  anatomy: [['Zone', '1.5px dashed border-strong · radius-lg · padding space-6'], ['Drag over', 'border-brand · bg-selected'], ['File row', 'tile 28 · name 13/18 · progress 4px'], ['Error row', 'status-danger border + message']],
  tokens: ['--border-strong', '--border-brand', '--bg-subtle', '--bg-selected', '--text-brand', '--status-success-bg', '--status-danger-solid', '--status-danger-fg', '--radius-lg'],
  rules: {
    when: ['Importing data or uploading assets'],
    whenNot: ['Attaching files in chat: use the composer attach button'],
    do: ['Say the file types, size and row limits up front', 'Show progress and let people cancel', 'Check the file and show how many rows are valid before importing'],
    dont: ['Start the import as soon as the file drops: show a preview first', 'Say "Invalid file": say what is wrong and how to fix it'],
    a11y: ['The zone is a real button that opens the file browser', 'Upload progress is announced with aria-live'],
  },
});

C('slider', {
  name: 'Slider', group: 'Inputs', icon: 'filter', mantine: 'Slider',
  desc: 'Set a number in a range, like the risk threshold for alerts or how many days before a workspace is inactive. Drag the control.',
  controls: [
    { k: 'kind', t: 'seg', o: ['threshold', 'days'], d: 'threshold' },
    { k: 'value', t: 'range', min: 0, max: 100, d: 60, l: 'Value' },
    { k: 'focus', t: 'bool', d: false, l: 'Focused' },
  ],
  render: p => {
    const days = p.kind === 'days', v = p.value, out = days ? `${Math.round(30 + v * 3.3)} days` : v;
    const lvl = v >= 80 ? ['critical', 'Critical only'] : v >= 60 ? ['high', 'High and above'] : v >= 40 ? ['elevated', 'Elevated and above'] : ['low', 'Everything'];
    return `<div class="h-field" style="width:360px"><div class="row" style="display:flex;justify-content:space-between;align-items:center"><label>${days ? 'Mark as inactive after' : 'Alert me when risk score is above'}</label><b style="font:var(--type-heading-s);color:var(--text-primary)">${out}</b></div><div class="h-slider" style="margin-top:6px"><div class="tr"></div><div class="fl" style="width:${v}%${days ? '' : `;background:var(--risk-${lvl[0]}-solid)`}"></div><div class="th${p.focus ? ' focus' : ''}" style="left:${v}%${days ? '' : `;border-color:var(--risk-${lvl[0]}-solid)`}" role="slider" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100" tabindex="0"></div></div><input type="range" min="0" max="100" value="${v}" data-sl aria-label="Value" style="position:relative;margin-top:-20px;width:100%;opacity:0;height:20px;cursor:pointer"><div class="h-slider-marks">${days ? '<span>30</span><span>90</span><span>180</span><span>365</span>' : '<span>0</span><span>40</span><span>60</span><span>80</span><span>100</span>'}</div><small>${days ? 'Owners get a review email 14 days before.' : `You will be alerted for: ${lvl[1]}`}</small></div>`;
  },
  wire: (el, p, set) => { const r = el.querySelector('[data-sl]'); r && r.addEventListener('change', () => set({ value: +r.value })); r && r.addEventListener('input', () => { const f = el.querySelector('.fl'), t = el.querySelector('.th'); f.style.width = t.style.left = r.value + '%'; }); },
  react: p => `<Slider
  label={(v) => ${p.kind === 'days' ? '`${v} days`' : 'v'}}
  value={value}
  onChange={setValue}
  min={${p.kind === 'days' ? 30 : 0}} max={${p.kind === 'days' ? 365 : 100}}
  marks={[${p.kind === 'days' ? '{ value: 90 }, { value: 180 }' : '{ value: 40 }, { value: 60 }, { value: 80 }'}]}${p.kind === 'days' ? '' : '\n  color={riskColor(value)}  // uses --risk-* tokens'}
/>`,
  anatomy: [['Track', '4px · border-subtle'], ['Fill', 'action-primary (risk color for thresholds)'], ['Thumb', '16×16 · 2px border · shadow-sm'], ['Marks', 'type-caption under the track'], ['Value', 'type-heading-s · top right']],
  tokens: ['--action-primary', '--border-subtle', '--bg-surface', '--shadow-sm', '--focus-ring', '--risk-low-solid', '--risk-high-solid', '--risk-critical-solid', '--type-caption'],
  rules: {
    when: ['The exact number matters less than the position in a range', 'Thresholds and durations'],
    whenNot: ['People need an exact value: use Number Input', 'Fewer than 5 steps: use Segmented Control'],
    do: ['Show the current value as text next to the label', 'Explain what the value will do under it', 'Add marks at meaningful points'],
    dont: ['Hide the scale', 'Use a slider without a visible value'],
    a11y: ['role="slider" with aria-valuenow/min/max', 'Arrow keys move 1 step; Page Up/Down move 10'],
  },
});

C('filter-bar', {
  name: 'Filter Bar', group: 'Inputs', icon: 'filter', mantine: 'Group · Combobox',
  desc: 'Search plus filter chips above a table. Each chip shows its value. Click × to remove a filter.',
  controls: [
    { k: 'filters', t: 'range', min: 0, max: 3, d: 2, l: 'Active filters' },
    { k: 'search', t: 'bool', d: true, l: 'Search box' },
    { k: 'saved', t: 'bool', d: true, l: 'Saved views' },
  ],
  render: p => {
    const f = [['Type', 'Teams'], ['Owner', 'None'], ['Activity', 'Inactive 90+ days']].slice(0, p.filters);
    return `<div class="fit" style="display:flex;flex-direction:column;gap:12px;max-width:720px"><div class="h-filterbar">${p.search ? `<div class="h-input">${ic('search')}Search 1,284 workspaces</div>` : ''}${f.map(([k, v], i) => `<span class="h-fchip on">${k}: <b style="font-weight:600">${v}</b><button aria-label="Remove ${k} filter" data-rm="${i}">${ic('x')}</button></span>`).join('')}<span class="h-fchip add">${ic('plus', 'ic-sm')}Add filter</span>${p.filters ? '<a class="h-link" href="#" onclick="return false" data-clear style="font-size:12px;margin-left:4px">Clear all</a>' : ''}</div><div style="display:flex;align-items:center;justify-content:space-between;font:var(--type-caption);color:var(--text-secondary)" aria-live="polite"><span>${[1284, 312, 47, 19][p.filters]} workspaces</span>${p.saved ? H.btn('Save view', 'ghost', 'sm', 'tag') : ''}</div></div>`;
  },
  wire: (el, p, set) => { el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => set({ filters: p.filters - 1 }))); const c = el.querySelector('[data-clear]'); c && c.addEventListener('click', () => set({ filters: 0 })); },
  react: p => `<Group gap="xs">${p.search ? `
  <TextInput leftSection={<IconSearch size={16} />} placeholder="Search 1,284 workspaces" size="xs" w={220} />` : ''}
  <FilterChip label="Type" value="Teams" onRemove={() => remove('type')} />
  <FilterChip label="Owner" value="None" onRemove={() => remove('owner')} />
  <AddFilterMenu fields={['Type', 'Owner', 'Activity', 'Sensitivity', 'Template']} />
  <Anchor size="xs" onClick={clearAll}>Clear all</Anchor>${p.saved ? `
  <Button variant="subtle" size="xs" ml="auto">Save view</Button>` : ''}
</Group>`,
  anatomy: [['Chip', '28 high · radius-full · "Field: value"'], ['Active chip', 'bg-selected · border-brand'], ['Add', 'dashed border'], ['Result count', 'type-caption under the bar']],
  tokens: ['--bg-surface', '--bg-selected', '--border-default', '--border-brand', '--text-secondary', '--radius-full', '--type-caption'],
  rules: {
    when: ['Above any table or list with more than ~20 rows'],
    whenNot: ['Switching between 2–4 fixed views: use Tabs or Segmented Control'],
    do: ['Show the value inside the chip, not only the field name', 'Always show the result count', 'Keep filters in the URL so people can share them'],
    dont: ['Hide active filters in a menu', 'Reset filters when people come back to the page'],
    a11y: ['Result count updates with aria-live="polite"', 'Each × says which filter it removes'],
  },
});
})();

(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));
const tenants = [['Contoso', 'CO', 'var(--viz-1)', 'contoso.onmicrosoft.com'], ['Fabrikam', 'FA', 'var(--viz-3)', 'fabrikam.onmicrosoft.com'], ['Northwind', 'NW', 'var(--viz-5)', 'northwind.onmicrosoft.com']];

C('top-bar', {
  name: 'Top Bar', group: 'Navigation', icon: 'home', mantine: 'AppShell.Header',
  desc: 'The bar at the top of every Orchestry page: logo, tenant switcher, global search, AI, notifications and profile.',
  controls: [
    { k: 'tenant', t: 'select', o: tenants.map(t => t[0]), d: 'Contoso' },
    { k: 'switcher', t: 'bool', d: false, l: 'Tenant menu open' },
    { k: 'unread', t: 'range', min: 0, max: 12, d: 3, l: 'Unread' },
    { k: 'search', t: 'bool', d: true, l: 'Search' },
  ],
  render: p => {
    const t = tenants.find(x => x[0] === p.tenant);
    return `<div class="fit" style="max-width:720px;min-height:${p.switcher ? 250 : 56}px;position:relative"><div class="h-topbar" style="border:1px solid var(--border-default);border-radius:var(--radius-lg)"><span class="logo"><i></i>Orchestry</span><span class="sep"></span><span class="h-switcher${p.switcher ? ' open' : ''}" role="button" aria-haspopup="menu" aria-expanded="${p.switcher}" data-sw><span class="h-tile" style="background:${t[2]};color:#fff">${t[1]}</span>${t[0]}${ic('down', 'ic-sm')}</span>${p.search ? `<div class="h-input">${ic('search')}Search…<span class="h-kbd" style="margin-left:auto">⌘K</span></div>` : '<span style="margin-left:auto"></span>'}<span class="tools"><button class="h-icon-btn ghost" aria-label="Ask Orchestry AI">${H.comet('', true)}</button><span class="h-indicator"><button class="h-icon-btn ghost" aria-label="Notifications, ${p.unread} unread">${ic('bell')}</button>${p.unread ? `<span class="n">${p.unread > 9 ? '9+' : p.unread}</span>` : ''}</span><button class="h-icon-btn ghost" aria-label="Settings">${ic('settings')}</button>${H.avatar('Sara Sabour', 4)}</span></div>${p.switcher ? `<div class="h-menu" role="menu" style="position:absolute;left:120px;top:60px;width:280px;z-index:2"><span class="mh">Switch tenant</span>${tenants.map(x => `<div class="mi" role="menuitem" data-t="${x[0]}"><span class="h-tile sm" style="background:${x[2]};color:#fff;width:24px;height:24px;font:700 10px/1 var(--font-sans)">${x[1]}</span><span style="flex:1;display:block"><span style="display:block;font-weight:500">${x[0]}</span><span style="display:block;font:var(--type-caption);color:var(--text-secondary)">${x[3]}</span></span>${x[0] === p.tenant ? ic('check') : ''}</div>`).join('')}<hr><div class="mi">${ic('plus')}Connect a tenant</div></div>` : ''}</div>`;
  },
  wire: (el, p, set) => { const s = el.querySelector('[data-sw]'); s && s.addEventListener('click', () => set({ switcher: !p.switcher })); el.querySelectorAll('[data-t]').forEach(m => m.addEventListener('click', () => set({ tenant: m.dataset.t, switcher: false }))); },
  react: p => `<AppShell.Header h={56} px="md">
  <Group h="100%" gap="sm">
    <OrchestryLogo />
    <Divider orientation="vertical" my="md" />
    <TenantSwitcher value={tenant} tenants={tenants} onChange={setTenant} />${p.search ? `
    <Spotlight.Target ml="auto" w={360}>Search workspaces, people, agents…</Spotlight.Target>` : ''}
    <Group gap={4}${p.search ? '' : ' ml="auto"'}>
      <ActionIcon variant="subtle" aria-label="Ask Orchestry AI"><CometIcon gradient /></ActionIcon>
      <Indicator label={${p.unread}} disabled={${p.unread} === 0} color="red" size={16}>
        <ActionIcon variant="subtle" aria-label="Notifications"><IconBell size={18} /></ActionIcon>
      </Indicator>
      <ActionIcon variant="subtle" aria-label="Settings"><IconSettings size={18} /></ActionIcon>
      <UserMenu />
    </Group>
  </Group>
</AppShell.Header>`,
  anatomy: [['Height', '56px · padding space-4'], ['Logo', '24px brand-gradient mark + heading-s'], ['Tenant switcher', '32 high · 24px tenant tile'], ['Search', 'max 360 · bg-subtle · ⌘K hint'], ['Tools', 'icon buttons 32 · gap 4']],
  tokens: ['--bg-surface', '--border-default', '--brand-gradient', '--bg-hover', '--bg-subtle', '--status-danger-solid', '--type-heading-s', '--z-sticky'],
  rules: {
    when: ['Every signed-in page, always the same'],
    whenNot: ['Inside modals or the setup wizard: use a slim header with only the logo and Exit'],
    do: ['Always show which tenant you are in', 'Keep the order fixed: AI, notifications, settings, profile', 'Show ⌘K so people learn the shortcut'],
    dont: ['Put page actions here: they go in the Page Header', 'Show a count of 0'],
    a11y: ['Wrapped in <header role="banner">', 'Bell label includes the unread count', 'Skip link "Skip to content" before the bar'],
  },
});

C('stepper', {
  name: 'Stepper', group: 'Navigation', icon: 'checks', mantine: 'Stepper',
  desc: 'Shows the steps of a wizard, like creating a workspace from a template. Click Next to move forward.',
  controls: [
    { k: 'orientation', t: 'seg', o: ['horizontal', 'vertical'], d: 'horizontal' },
    { k: 'active', t: 'range', min: 0, max: 4, d: 1, l: 'Current step' },
    { k: 'error', t: 'bool', d: false, l: 'Error on current' },
    { k: 'buttons', t: 'bool', d: true, l: 'Show buttons' },
  ],
  render: p => {
    const s = [['Template', 'Pick a starting point'], ['Details', 'Name and purpose'], ['People', 'Owners and members'], ['Policies', 'Privacy and lifecycle'], ['Review', 'Check and request']];
    const v = p.orientation === 'vertical';
    return `<div class="fit" style="max-width:${v ? 320 : 640}px;display:flex;flex-direction:column;gap:20px"><ol class="h-stepper${v ? ' vertical' : ''}" style="list-style:none;margin:0;padding:0">${s.map(([t, d], i) => { const done = i < p.active, on = i === p.active, err = on && p.error; return `<li class="h-step${done ? ' done' : ''}${on ? ' on' : ''}${err ? ' err' : ''}"${on ? ' aria-current="step"' : ''}><span class="c">${done ? ic('check', 'ic-sm') : err ? '!' : i + 1}</span><span><b>${t}</b><small>${err ? 'Fix 2 fields' : done ? 'Done' : d}</small></span></li>`; }).join('')}</ol>${p.buttons ? `<div style="display:flex;gap:8px;justify-content:${v ? 'flex-start' : 'flex-end'}"><button class="h-btn secondary" data-back${p.active === 0 ? ' disabled' : ''}>Back</button><button class="h-btn primary" data-next>${p.active === 4 ? 'Send request' : 'Next'}</button></div>` : ''}</div>`;
  },
  wire: (el, p, set) => { const n = el.querySelector('[data-next]'), b = el.querySelector('[data-back]'); n && n.addEventListener('click', () => set({ active: p.active >= 4 ? 0 : p.active + 1, error: false })); b && b.addEventListener('click', () => set({ active: Math.max(0, p.active - 1) })); },
  react: p => `<Stepper active={active} onStepClick={setActive}${p.orientation === 'vertical' ? ' orientation="vertical"' : ''}>
  <Stepper.Step label="Template" description="Pick a starting point" />
  <Stepper.Step label="Details" description="Name and purpose"${p.error ? ' color="red" description="Fix 2 fields"' : ''} />
  <Stepper.Step label="People" description="Owners and members" />
  <Stepper.Step label="Policies" description="Privacy and lifecycle" />
  <Stepper.Step label="Review" description="Check and request" />
</Stepper>
<Group justify="flex-end" mt="xl">
  <Button variant="secondary" onClick={prev} disabled={active === 0}>Back</Button>
  <Button onClick={next}>{active === 4 ? 'Send request' : 'Next'}</Button>
</Group>`,
  anatomy: [['Circle', '24×24 · 1.5px border'], ['Current', 'border-brand + focus-ring halo'], ['Done', 'action-primary fill · check'], ['Connector', '2px · brand when done'], ['Label', 'type-label + caption']],
  tokens: ['--action-primary', '--text-on-brand', '--border-default', '--border-strong', '--focus-ring', '--status-danger-solid', '--type-label', '--type-caption'],
  rules: {
    when: ['A task with 3–6 steps in a fixed order: provisioning, onboarding, policy setup'],
    whenNot: ['Steps that can be done in any order: use Tabs or a checklist', 'Only 2 steps: use one page'],
    do: ['Let people go back without losing data', 'Name the last button for what happens: "Send request"', 'Mark errors on the step that has them'],
    dont: ['Let people skip ahead past required steps', 'Change the number of steps in the middle'],
    a11y: ['An <ol> list with aria-current="step"', 'Step changes move focus to the new heading'],
  },
});

C('command-palette', {
  name: 'Command Palette', group: 'Navigation', icon: 'command', mantine: 'Spotlight',
  desc: 'Press ⌘K anywhere to jump to a page, find any workspace or person, run an action, or ask AI. Type to filter.',
  controls: [
    { k: 'query', t: 'text', d: '' },
    { k: 'ai', t: 'bool', d: true, l: 'Ask AI row' },
  ],
  render: p => {
    const all = [['Recent', [['Marketing Hub', 'Workspace · Teams', 'team'], ['HR Policy Assistant', 'Agent · Copilot Studio', 'robot']]], ['Go to', [['Workspace directory', 'G then W', 'folder'], ['Agents & risk', 'G then A', 'shield'], ['Reports', 'G then R', 'chart']]], ['Actions', [['Create workspace', '⌘N', 'plus'], ['Run a health check', '', 'refresh'], ['Invite a guest', '', 'mail']]]];
    const q = (p.query || '').toLowerCase();
    const groups = all.map(([g, it]) => [g, it.filter(x => !q || x[0].toLowerCase().includes(q))]).filter(([, it]) => it.length);
    let first = true;
    const rows = groups.map(([g, it]) => `<div style="font:var(--type-overline);color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em;padding:10px 10px 4px">${g}</div>${it.map(([l, m, i]) => { const on = first; first = false; return `<div class="h-opt${on ? ' on' : ''}" role="option" aria-selected="${on}"><span class="h-tile sm" style="background:var(--bg-hover);color:var(--text-secondary)">${ic(i, 'ic-sm')}</span><span class="meta"><b>${l}</b></span>${/⌘|then/.test(m) ? `<span class="h-kbd">${m}</span>` : `<small>${m}</small>`}</div>`; }).join('')}`).join('');
    const ai = p.ai ? `<div class="h-opt${first ? ' on' : ''}" role="option" style="margin-top:4px">${H.aiMark('sm')}<span class="meta"><b>Ask Orchestry AI${q ? `: “${esc(p.query)}”` : ''}</b><small>Get an answer from your tenant data</small></span><span class="h-kbd">Tab</span></div>` : '';
    return `<div class="h-cmd" role="dialog" aria-label="Command palette"><div class="h-cmd-in">${ic('search')}<input data-q value="${esc(p.query)}" placeholder="Search or type a command…" aria-label="Search" role="combobox" aria-expanded="true"><span class="h-kbd">Esc</span></div><div class="h-cmd-list" role="listbox">${rows || `<div style="padding:24px;text-align:center;font:var(--type-body-s);color:var(--text-secondary)">No pages or actions match “${esc(p.query)}”.</div>`}${ai}</div><div class="h-cmd-foot"><span><span class="h-kbd">↑</span><span class="h-kbd">↓</span>Move</span><span><span class="h-kbd">↵</span>Open</span><span><span class="h-kbd">Tab</span>Ask AI</span></div></div>`;
  },
  wire: (el, p, set) => { const i = el.querySelector('[data-q]'); i && i.addEventListener('change', () => set({ query: i.value })); },
  react: p => `<Spotlight
  shortcut={['mod + K', '/']}
  actions={[
    { group: 'Recent', id: 'mkt', label: 'Marketing Hub', description: 'Workspace · Teams' },
    { group: 'Go to', id: 'dir', label: 'Workspace directory', onClick: () => nav('/workspaces') },
    { group: 'Actions', id: 'new', label: 'Create workspace', onClick: openWizard },
  ]}
  nothingFound="No pages or actions match"
  searchProps={{ placeholder: 'Search or type a command…', leftSection: <IconSearch size={18} /> }}${p.ai ? `
  footer={<AskAIAction query={query} />}  // Tab sends the query to Orchestry AI` : ''}
/>`,
  anatomy: [['Panel', '520 wide · radius-xl · shadow-lg'], ['Input', '48 high · type-body-m'], ['Group label', 'type-overline · uppercase'], ['Row', 'tile 28 · active row bg-hover'], ['Footer', 'key hints · bg-subtle']],
  tokens: ['--bg-surface', '--bg-subtle', '--bg-hover', '--border-default', '--shadow-lg', '--radius-xl', '--type-overline', '--type-body-m', '--z-modal'],
  rules: {
    when: ['Everywhere. ⌘K and / always open it'],
    whenNot: ['As the only way to reach a page: everything must also be in the nav'],
    do: ['Show recent items before typing', 'Show the shortcut next to each action', 'End with "Ask AI" so no search is a dead end'],
    dont: ['Run a destructive action straight from here without a confirm', 'Show more than ~8 results per group'],
    a11y: ['role="dialog" + combobox/listbox pattern', 'Arrow keys move, Enter opens, Esc closes and returns focus'],
  },
});

C('tree-view', {
  name: 'Tree View', group: 'Navigation', icon: 'folder', mantine: 'Tree',
  desc: 'Shows nested structure: a team, its channels, its SharePoint site and libraries. Click arrows to open and close.',
  controls: [
    { k: 'checkable', t: 'bool', d: false, l: 'Checkboxes' },
    { k: 'counts', t: 'bool', d: true, l: 'Counts' },
    { k: 'open', t: 'seg', o: ['some', 'all', 'none'], d: 'some' },
  ],
  render: p => {
    const tree = [['Marketing Hub', 'team', 3, [['General', 'msg', 248], ['Campaigns', 'msg', 96], ['Agency (shared)', 'globe-lock', 31]]], ['Marketing Hub site', 'world', 2, [['Documents', 'folder', 1204], ['Brand assets', 'folder', 386]]], ['Planner', 'checks', 0, null]];
    const isOpen = i => p.open === 'all' || p.open === 'some' && i === 0;
    const node = (lvl, [l, i, n, kids], k, open, on) => `<div class="ti${open ? ' open' : ''}${on ? ' on' : ''}" role="treeitem" aria-level="${lvl}"${kids ? ` aria-expanded="${open}"` : ''} style="padding-left:${(lvl - 1) * 20 + 4}px"${kids ? ` data-k="${k}"` : ''}><span class="tw">${kids ? ic('right') : ''}</span>${p.checkable ? `<span class="h-check${lvl === 1 && k === 0 || lvl === 2 && on ? ' on' : ''}">${lvl === 1 && k === 0 || lvl === 2 && on ? ic('check', 'ic-sm') : ''}</span>` : ''}${ic(i, 'ic-sm')}<span>${l}</span>${p.counts && n ? `<span class="n">${n.toLocaleString()}</span>` : ''}</div>`;
    return `<div class="h-tree" role="tree" aria-label="Workspace structure" style="width:300px">${tree.map((t, k) => node(1, t, k, !!(isOpen(k) && t[3]), false) + (isOpen(k) && t[3] ? t[3].map((c, j) => node(2, c, `${k}-${j}`, false, k === 0 && j === 1)).join('') : '')).join('')}</div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-k]').forEach(n => n.addEventListener('click', () => set({ open: p.open === 'none' ? 'some' : p.open === 'some' ? 'all' : 'none' }))),
  react: p => `<Tree
  data={structure}          // [{ value, label, children }]
  levelOffset={20}
  expandOnClick${p.checkable ? `
  renderNode={({ node, tree, expanded }) => (
    <Group gap={6}>
      <Checkbox.Indicator checked={tree.isNodeChecked(node.value)} />
      {node.label}
    </Group>
  )}` : ''}
/>`,
  anatomy: [['Row', '30 high · radius-sm'], ['Indent', '20px per level'], ['Twisty', '16 · rotates 90° when open'], ['Selected', 'bg-selected · text-brand · 600'], ['Count', 'type-caption · right']],
  tokens: ['--bg-hover', '--bg-selected', '--text-brand', '--text-secondary', '--radius-sm', '--duration-fast', '--type-body-s'],
  rules: {
    when: ['Real parent/child structure: team → channels, site → libraries, policy → rules'],
    whenNot: ['Flat lists: use a List or Table', 'More than 4 levels: rethink the structure'],
    do: ['Show counts so people know what is inside', 'Remember which nodes were open', 'Load deep children only when opened'],
    dont: ['Make the whole row both select and expand: the arrow expands, the row selects'],
    a11y: ['role="tree" / "treeitem" with aria-level and aria-expanded', 'Right arrow opens, Left closes, Up/Down move'],
  },
});
})();

(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));

C('accordion', {
  name: 'Accordion', group: 'Containers', icon: 'menu', mantine: 'Accordion',
  desc: 'Stacks sections that open and close. Good for policy settings and FAQs. Click a header.',
  controls: [
    { k: 'variant', t: 'seg', o: ['contained', 'flush'], d: 'contained' },
    { k: 'open', t: 'select', o: ['0', '1', '2', 'none'], d: '0', l: 'Open section' },
    { k: 'meta', t: 'bool', d: true, l: 'Summary line' },
  ],
  render: p => {
    const it = [['Naming policy', 'Prefix MKT- · blocked words on', 'tag', `Workspace names start with the department prefix. Blocked words: "test", "temp", "copy".<div style="display:flex;gap:8px;margin-top:12px">${H.badge('success', 'Enforced')}${H.badge('neutral', 'Applies to 4 templates', false)}</div>`], ['Guest access', 'Allowed · expires after 90 days', 'globe-lock', 'Owners can invite guests from approved domains. Access is reviewed every 90 days and removed if not renewed.'], ['Lifecycle', 'Archive after 180 days inactive', 'clock', 'Owners get a review email 14 days before. If nobody renews, the workspace becomes read-only and is archived.']];
    return `<div class="h-acc${p.variant === 'flush' ? ' flush' : ''}" style="max-width:520px">${it.map(([t, m, i, b], k) => { const o = String(k) === p.open; return `<div class="h-acc-item${o ? ' open' : ''}"><button class="h-acc-head" aria-expanded="${o}" data-k="${k}"><span class="h-tile sm" style="background:var(--bg-hover);color:var(--text-secondary)">${ic(i, 'ic-sm')}</span><span>${t}${p.meta ? `<small>${m}</small>` : ''}</span>${ic('down', 'ic chev')}</button>${o ? `<div class="h-acc-body" role="region">${b}</div>` : ''}</div>`; }).join('')}</div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => set({ open: p.open === b.dataset.k ? 'none' : b.dataset.k }))),
  react: p => `<Accordion variant="${p.variant === 'flush' ? 'default' : 'contained'}" defaultValue="naming">
  <Accordion.Item value="naming">
    <Accordion.Control icon={<IconTag size={16} />}>
      Naming policy${p.meta ? '\n      <Text size="xs" c="dimmed">Prefix MKT- · blocked words on</Text>' : ''}
    </Accordion.Control>
    <Accordion.Panel>Workspace names start with the department prefix…</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="guests">…</Accordion.Item>
  <Accordion.Item value="lifecycle">…</Accordion.Item>
</Accordion>`,
  anatomy: [['Header', 'padding space-3/space-4 · heading-s · tile 28'], ['Summary', 'type-caption under the title'], ['Chevron', 'rotates 180° · duration-base'], ['Body', 'padding 0/space-4/space-4']],
  tokens: ['--bg-surface', '--bg-subtle', '--border-default', '--border-subtle', '--text-secondary', '--radius-lg', '--duration-base', '--type-heading-s'],
  rules: {
    when: ['Long settings pages where people edit one area at a time', 'FAQs and help'],
    whenNot: ['Content everyone needs to read: show it open', 'Only 1–2 sections: show them both'],
    do: ['Show the current setting as a summary line so people don’t need to open it', 'Open the first section by default'],
    dont: ['Nest accordions', 'Hide errors inside a closed section: open it'],
    a11y: ['Header is a <button> with aria-expanded', 'Body has role="region" labelled by the header'],
  },
});

C('drawer', {
  name: 'Drawer', group: 'Containers', icon: 'layers', mantine: 'Drawer',
  desc: 'A side panel over the page. Shows details of a row or a short form without leaving the list.',
  controls: [
    { k: 'content', t: 'seg', o: ['details', 'form'], d: 'details' },
    { k: 'size', t: 'seg', o: ['md', 'lg'], d: 'md' },
    { k: 'scrim', t: 'bool', d: true, l: 'Dim the page' },
  ],
  render: p => {
    const ghost = `<div class="ghost">${[70, 100, 100, 100, 100, 100].map((w, i) => `<div class="h-skel" style="height:${i ? 34 : 22}px;width:${w}%;animation:none;opacity:.7"></div>`).join('')}</div>`;
    const body = p.content === 'form'
      ? `<div class="h-field"><label>Workspace name</label><div class="h-input focus" style="color:var(--text-primary)">Marketing Hub</div></div><div class="h-field"><label>Owners</label><div class="h-combo">${H.people.slice(0, 2).map(([n], i) => `<span class="h-chip">${H.avatar(n, i)}${n}<button aria-label="Remove ${n}">${ic('x')}</button></span>`).join('')}</div></div><div class="h-field"><label>Sensitivity</label><div class="h-input" style="color:var(--text-primary)"><span class="h-label confidential sm">${ic('lock')}Confidential</span><span style="margin-left:auto">${ic('down', 'ic-sm')}</span></div></div>`
      : `<dl class="h-dl"><dt>Type</dt><dd>${ic('team', 'ic-sm')}Microsoft Teams</dd><dt>Status</dt><dd><span class="h-life active">${ic('check')}Active</span></dd><dt>Sensitivity</dt><dd><span class="h-label confidential sm">${ic('lock')}Confidential</span></dd><dt>Owners</dt><dd><span class="h-avgroup sm">${H.people.slice(0, 2).map(([n], i) => H.avatar(n, i)).join('')}</span>Jordan, Priya</dd><dt>Members</dt><dd>48 · 6 guests</dd><dt>Last activity</dt><dd>2 hours ago</dd></dl>`;
    return `<div class="h-drawer-wrap fit">${ghost}${p.scrim ? '<div class="scrim"></div>' : ''}<aside class="h-drawer${p.size === 'lg' ? ' lg' : ''}" role="dialog" aria-modal="true" aria-labelledby="dh"><div class="h-drawer-head"><span class="h-tile" style="background:var(--entity-neutral-bg);color:var(--text-brand)">${ic('team')}</span><div class="meta"><b id="dh">${p.content === 'form' ? 'Edit workspace' : 'Marketing Hub'}</b><small>${p.content === 'form' ? 'Changes sync to Microsoft 365' : 'Created Mar 2, 2024 · Marketing'}</small></div><button class="h-icon-btn ghost" aria-label="Close">${ic('x')}</button></div><div class="h-drawer-body">${body}</div><div class="h-drawer-foot">${p.content === 'form' ? H.btn('Cancel', 'secondary') + H.btn('Save changes') : H.btn('Open in Teams', 'secondary', '', 'external') + H.btn('Edit')}</div></aside></div>`;
  },
  react: p => `<Drawer
  opened={opened}
  onClose={close}
  position="right"
  size="${p.size === 'lg' ? 480 : 360}"
  title="${p.content === 'form' ? 'Edit workspace' : 'Marketing Hub'}"${p.scrim ? '' : '\n  withOverlay={false}'}
>
  ${p.content === 'form' ? '<WorkspaceForm workspace={ws} />' : '<WorkspaceDetails workspace={ws} />'}
  <Drawer.Footer>
    ${p.content === 'form' ? '<Button variant="secondary" onClick={close}>Cancel</Button>\n    <Button onClick={save}>Save changes</Button>' : '<Button variant="secondary" leftSection={<IconExternalLink size={16} />}>Open in Teams</Button>\n    <Button>Edit</Button>'}
  </Drawer.Footer>
</Drawer>`,
  anatomy: [['Width', '360 (md) · 480 (lg) · max 85%'], ['Header', 'tile 36 · heading-m · close'], ['Body', 'scrolls · padding space-4/space-5'], ['Footer', 'sticky · buttons right'], ['Scrim', 'bg-overlay']],
  tokens: ['--bg-surface', '--bg-overlay', '--shadow-lg', '--border-subtle', '--type-heading-m', '--z-modal', '--duration-base'],
  rules: {
    when: ['Viewing or editing one item from a list while keeping the list in view'],
    whenNot: ['A decision that blocks everything: use Modal', 'Long multi-step work: use a full page or Stepper'],
    do: ['Open from the right', 'Keep the footer actions always visible', 'Update the URL so the drawer can be shared'],
    dont: ['Open a drawer from a drawer', 'Put a whole page of tabs in it'],
    a11y: ['role="dialog" aria-modal="true"', 'Focus moves in and is trapped; Esc closes and returns focus to the row'],
  },
});

C('popover', {
  name: 'Popover', group: 'Containers', icon: 'msg', mantine: 'Popover · HoverCard',
  desc: 'A small floating card opened from an element. Holds more than a tooltip: a person card, a quick explanation or a mini form.',
  controls: [
    { k: 'content', t: 'seg', o: ['person', 'explain', 'form'], d: 'person' },
  ],
  render: p => {
    const trig = { person: `<span class="h-link" style="display:inline-flex;gap:6px;align-items:center">${H.avatar('Jordan Lee', 0)}Jordan Lee</span>`, explain: `<span style="display:inline-flex;gap:6px;align-items:center;font:var(--type-label)">Health score 72 <button class="h-icon-btn sm ghost" aria-label="How is this calculated?" aria-expanded="true">${ic('info')}</button></span>`, form: H.btn('Rename', 'secondary', 'sm', 'edit') }[p.content];
    const body = {
      person: `<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><span class="h-presence">${H.avatar('Jordan Lee', 0, 'lg')}</span><span><b style="margin:0">Jordan Lee</b><small style="font:var(--type-caption);color:var(--text-secondary)">Marketing Lead · Available</small></span></div><dl class="h-dl" style="grid-template-columns:90px 1fr;margin-bottom:12px"><dt>Owns</dt><dd>12 workspaces</dd><dt>Email</dt><dd>jordan.lee@contoso.com</dd></dl><div style="display:flex;gap:8px">${H.btn('Message', 'secondary', 'sm', 'msg')}${H.btn('View profile', 'ghost', 'sm')}</div>`,
      explain: `<b>How we score health</b><p>The score adds up 4 checks. Each is worth 25 points.</p>${[['Has 2+ owners', true], ['Active in last 30 days', true], ['Guests reviewed', false], ['Sensitivity label set', true]].map(([t, ok]) => `<div style="display:flex;gap:8px;align-items:center;font:var(--type-body-s);padding:3px 0;color:${ok ? 'var(--text-primary)' : 'var(--status-warning-fg)'}">${ic(ok ? 'check' : 'alert', 'ic-sm')}${t}</div>`).join('')}`,
      form: `<b>Rename workspace</b><div class="h-input focus" style="color:var(--text-primary);margin:8px 0 12px;min-width:0">MKT-Marketing Hub</div><div style="display:flex;gap:8px;justify-content:flex-end">${H.btn('Cancel', 'ghost', 'sm')}${H.btn('Save', 'primary', 'sm')}</div>`,
    }[p.content];
    return `<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;min-height:250px">${trig}<div class="h-popover" role="dialog">${body}</div></div>`;
  },
  react: p => p.content === 'person' ? `<HoverCard width={300} openDelay={300} withArrow>
  <HoverCard.Target><Anchor>Jordan Lee</Anchor></HoverCard.Target>
  <HoverCard.Dropdown><PersonCard id={userId} /></HoverCard.Dropdown>
</HoverCard>` : `<Popover width={300} position="bottom-start" withArrow trapFocus>
  <Popover.Target>
    ${p.content === 'form' ? '<Button variant="secondary" size="sm">Rename</Button>' : '<ActionIcon aria-label="How is this calculated?"><IconInfoCircle /></ActionIcon>'}
  </Popover.Target>
  <Popover.Dropdown>${p.content === 'form' ? '<RenameForm />' : '<HealthExplainer />'}</Popover.Dropdown>
</Popover>`,
  anatomy: [['Width', '300px'], ['Padding', 'space-4'], ['Arrow', '10px · 24px from the left'], ['Shadow', 'shadow-md · radius-lg']],
  tokens: ['--bg-surface', '--border-default', '--shadow-md', '--radius-lg', '--type-heading-s', '--type-body-s', '--z-popover'],
  rules: {
    when: ['More than a tooltip but less than a drawer: a person card, a quick rename, "how is this calculated?"'],
    whenNot: ['One short sentence: use Tooltip', 'Forms with more than 2 fields: use Drawer or Modal'],
    do: ['Open person cards on hover with a 300ms delay', 'Open forms and explanations on click', 'Close on Esc and outside click'],
    dont: ['Put a popover inside a popover', 'Hide the only copy of important info in one'],
    a11y: ['Trigger has aria-expanded and aria-controls', 'Forms trap focus; hover cards are also reachable by keyboard focus'],
  },
});

C('description-list', {
  name: 'Description List', group: 'Containers', icon: 'book', mantine: 'SimpleGrid · Table',
  desc: 'Label and value pairs, like the properties of a workspace. Use rows on detail pages, or a grid in cards.',
  controls: [
    { k: 'layout', t: 'seg', o: ['rows', 'grid'], d: 'rows' },
    { k: 'copy', t: 'bool', d: true, l: 'Copy on IDs' },
  ],
  render: p => {
    const d = [['Workspace ID', `<code style="font:12px var(--font-mono)">a3f9-21c7-88de</code>${p.copy ? `<button class="h-icon-btn sm ghost" aria-label="Copy ID">${ic('copy')}</button>` : ''}`], ['Template', 'Project workspace'], ['Privacy', `${ic('lock', 'ic-sm')}Private`], ['Sensitivity', `<span class="h-label confidential sm">${ic('lock')}Confidential</span>`], ['Created', 'Mar 2, 2024 by Jordan Lee'], ['Storage', '18.2 GB of 25 GB']];
    if (p.layout === 'grid') return `<dl class="h-dl stack fit" style="max-width:520px">${d.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
    return `<dl class="h-dl fit" style="max-width:520px">${d.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  },
  react: p => `<DescriptionList${p.layout === 'grid' ? ' cols={2}' : ''}>
  <DescriptionList.Item label="Workspace ID"${p.copy ? ' copyable' : ''}><Code>a3f9-21c7-88de</Code></DescriptionList.Item>
  <DescriptionList.Item label="Template">Project workspace</DescriptionList.Item>
  <DescriptionList.Item label="Sensitivity"><SensitivityLabel level="confidential" size="sm" /></DescriptionList.Item>
  <DescriptionList.Item label="Created">Mar 2, 2024 by Jordan Lee</DescriptionList.Item>
</DescriptionList>`,
  anatomy: [['Rows', '140px label column · 10px row padding · divider'], ['Grid', '2 columns · label caption on top'], ['Label', 'text-secondary'], ['Value', 'text-primary · can hold badges']],
  tokens: ['--text-secondary', '--text-primary', '--border-subtle', '--type-body-s', '--type-caption', '--font-mono'],
  rules: {
    when: ['Showing properties of one item: workspace, agent, user, policy'],
    whenNot: ['Comparing many items: use Data Table'],
    do: ['Keep labels short and the same width', 'Show "Not set" instead of leaving a value blank', 'Add copy buttons to IDs and URLs'],
    dont: ['Make values editable inline without a clear edit mode'],
    a11y: ['Real <dl>, <dt>, <dd> elements', 'Copy buttons announce "Copied"'],
  },
});

C('workspace-card', {
  name: 'Workspace Card', group: 'Containers', icon: 'team', mantine: 'Card',
  desc: 'The card for a Team, SharePoint site or group in the directory. Shows type, health, owners, label and lifecycle at a glance.',
  controls: [
    { k: 'type', t: 'seg', o: ['Teams', 'SharePoint', 'Group'], d: 'Teams' },
    { k: 'health', t: 'seg', o: ['healthy', 'attention', 'risk'], d: 'healthy' },
    { k: 'state', t: 'seg', o: ['default', 'hover', 'selected'], d: 'default' },
    { k: 'name', t: 'text', d: 'Marketing Hub' },
  ],
  render: p => {
    const t = { Teams: ['team', 'Microsoft Teams', 'var(--viz-1)'], SharePoint: ['world', 'SharePoint site', 'var(--viz-6)'], Group: ['users', 'Microsoft 365 group', 'var(--viz-3)'] }[p.type];
    const h = { healthy: ['success', 'Healthy', 'Active', 'active', 'check'], attention: ['warning', '1 owner only', 'In review', 'review', 'clock'], risk: ['danger', '6 guests, no review', 'Inactive', 'inactive', 'clock'] }[p.health];
    return `<div class="h-ws${p.state === 'hover' ? ' is-hover' : p.state === 'selected' ? ' sel' : ''}" tabindex="0"><div class="h-ws-top"><div class="h-ws-row"><span class="h-tile" style="background:color-mix(in srgb, ${t[2]} 14%, transparent);color:${t[2]}">${ic(t[0])}</span><div class="meta"><b>${esc(p.name)}</b><small>${t[1]} · Marketing</small></div><button class="h-icon-btn sm ghost" aria-label="More actions">${ic('dots')}</button></div><p>Campaign planning, agency files and launch calendars.</p><div class="tags" style="display:flex;gap:6px;flex-wrap:wrap"><span class="h-label confidential sm">${ic('lock')}Confidential</span><span class="h-life ${h[3]}" style="height:20px;font-size:11px">${ic(h[4])}${h[2]}</span></div></div><div class="h-ws-foot"><span class="h-avgroup sm">${H.people.slice(0, 3).map(([n], i) => H.avatar(n, i)).join('')}<span class="h-avatar more">+45</span></span>${H.badge(h[0], h[1])}</div></div>`;
  },
  react: p => `<WorkspaceCard
  name="${p.name}"
  type="${p.type.toLowerCase()}"
  department="Marketing"
  sensitivity="confidential"
  lifecycle="${p.health === 'healthy' ? 'active' : p.health === 'attention' ? 'review' : 'inactive'}"
  health={{ tone: '${p.health === 'healthy' ? 'success' : p.health === 'attention' ? 'warning' : 'danger'}', label: '${p.health === 'healthy' ? 'Healthy' : p.health === 'attention' ? '1 owner only' : '6 guests, no review'}' }}
  members={members}${p.state === 'selected' ? '\n  selected' : ''}
  onClick={() => openDrawer(id)}
/>`,
  anatomy: [['Card', '300 wide · radius-lg · border-default'], ['Type tile', '36 · type color at 14%'], ['Tags', 'Sensitivity Label + Lifecycle Status (sm)'], ['Footer', 'avatar group + health badge · bg-subtle'], ['Hover', 'border-brand + shadow-sm']],
  tokens: ['--bg-surface', '--bg-subtle', '--border-default', '--border-brand', '--shadow-sm', '--radius-lg', '--viz-1', '--viz-3', '--viz-6', '--type-heading-s'],
  rules: {
    when: ['Workspace directory grid view', 'Search results and "recent" lists'],
    whenNot: ['Comparing many workspaces by numbers: use Data Table view'],
    do: ['Always show type, sensitivity, lifecycle and health in the same places', 'Show the one health problem in words: "1 owner only"', 'Open the Drawer on click'],
    dont: ['Add more than 2 tags', 'Show raw scores without a label'],
    a11y: ['Whole card is one focusable link; ⋯ is a separate button', 'Health is text, not only color'],
  },
});
})();

(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));

/* =================================================================== DATA DISPLAY */
C('timeline', {
  name: 'Activity Timeline', group: 'Data display', icon: 'clock', mantine: 'Timeline',
  desc: 'What happened, in order. The audit trail for a workspace, an agent or an approval request.',
  controls: [
    { k: 'density', t: 'seg', o: ['comfortable', 'dense'], d: 'comfortable' },
    { k: 'items', t: 'range', min: 2, max: 5, d: 4, l: 'Events' },
    { k: 'comments', t: 'bool', d: true, l: 'Show comments' },
  ],
  render: p => {
    const ev = [['brand', 'plus', '<b>Jordan Lee</b> requested <b>Marketing Hub</b> from the Project template', 'Mar 2, 9:14 AM', ''], ['success', 'check', '<b>Daniel Novak</b> approved the request', 'Mar 2, 10:02 AM', 'Looks good. Added the agency domain to the guest allow list.'], ['', 'bolt', '<b>Orchestry</b> created the team, site and 3 channels', 'Mar 2, 10:03 AM', ''], ['warning', 'globe-lock', '<b>Priya Shah</b> invited 2 guests from agency.com', 'Mar 9, 4:40 PM', ''], ['danger', 'alert', '<b>Orchestry AI</b> flagged: guest has not signed in for 60 days', 'Today, 8:00 AM', '']].slice(0, p.items);
    const d = p.density === 'dense';
    return `<div class="h-timeline" style="max-width:460px" role="list">${ev.map(([t, i, b, time, q]) => `<div class="h-tl${d ? ' dense' : ''}" role="listitem"><span class="ico ${t}">${ic(i)}</span><div class="body">${b}<time>${time}</time>${p.comments && q && !d ? `<div class="quote">“${q}”</div>` : ''}</div></div>`).join('')}</div>`;
  },
  react: p => `<Timeline bulletSize={${p.density === 'dense' ? 20 : 28}} lineWidth={2}>
  {events.map(e => (
    <Timeline.Item key={e.id} bullet={<EventIcon type={e.type} />} color={toneFor(e.type)}>
      <Text size="sm"><b>{e.actor}</b> {e.action}</Text>
      <Text size="xs" c="dimmed">{formatTime(e.at)}</Text>${p.comments ? '\n      {e.comment && <Quote>{e.comment}</Quote>}' : ''}
    </Timeline.Item>
  ))}
</Timeline>`,
  anatomy: [['Icon', '28 circle (dense 20) · tone bg + fg'], ['Line', '2px · border-subtle'], ['Text', 'type-body-s · actor bold'], ['Time', 'type-caption · under text'], ['Comment', 'bg-subtle box · radius-md']],
  tokens: ['--border-subtle', '--bg-hover', '--action-primary-subtle', '--text-brand', '--status-success-bg', '--status-warning-bg', '--status-danger-bg', '--type-body-s', '--type-caption'],
  rules: {
    when: ['Audit history, approval trails, agent activity'],
    whenNot: ['Comparing numbers over time: use a Chart'],
    do: ['Write "who did what": "Daniel approved the request"', 'Newest at the bottom on detail pages; newest at top in feeds', 'Use relative time for today, full date for older'],
    dont: ['Color every event: only success, warning and danger get color'],
    a11y: ['A list with role="listitem" per event', 'Time uses <time datetime="…">'],
  },
});

C('avatar-group', {
  name: 'Avatar Group', group: 'Data display', icon: 'users', mantine: 'Avatar.Group',
  desc: 'Shows a few people and a "+N" for the rest. Used for owners, members and approvers. Presence dots show who is online.',
  controls: [
    { k: 'count', t: 'range', min: 1, max: 48, d: 12, l: 'People' },
    { k: 'max', t: 'range', min: 2, max: 5, d: 3, l: 'Max shown' },
    { k: 'size', t: 'seg', o: ['sm', 'md'], d: 'md' },
    { k: 'presence', t: 'bool', d: false, l: 'Single with presence' },
  ],
  render: p => {
    if (p.presence) return `<div style="display:flex;gap:20px;align-items:center">${[['Jordan Lee', ''], ['Priya Shah', 'away'], ['Marcus Chen', 'off']].map(([n, s], i) => `<span style="display:flex;gap:8px;align-items:center;font:var(--type-body-s)"><span class="h-presence ${s}" aria-label="${s === 'away' ? 'Away' : s === 'off' ? 'Offline' : 'Available'}">${H.avatar(n, i)}</span>${n}</span>`).join('')}</div>`;
    const names = ['Jordan Lee', 'Priya Shah', 'Marcus Chen', 'Ana Gomez', 'Daniel Novak'];
    const shown = Math.min(p.count, p.max), rest = p.count - shown;
    return `<div style="display:flex;align-items:center;gap:10px"><span class="h-avgroup${p.size === 'sm' ? ' sm' : ''}" role="group" aria-label="${p.count} members">${names.slice(0, shown).map((n, i) => H.avatar(n, i)).join('')}${rest > 0 ? `<span class="h-avatar more">+${rest}</span>` : ''}</span><span style="font:var(--type-body-s);color:var(--text-secondary)">${p.count} ${p.count === 1 ? 'member' : 'members'}</span></div>`;
  },
  react: p => p.presence ? `<Indicator color="${'green'}" position="bottom-end" size={9} withBorder offset={3}>
  <Avatar name="Jordan Lee" color="initials" />
</Indicator>` : `<Tooltip.Group>
  <Avatar.Group spacing="sm">
    {members.slice(0, ${p.max}).map(m => (
      <Tooltip key={m.id} label={m.name}><Avatar name={m.name} color="initials"${p.size === 'sm' ? ' size="sm"' : ''} /></Tooltip>
    ))}
    {members.length > ${p.max} && <Avatar>+{members.length - ${p.max}}</Avatar>}
  </Avatar.Group>
</Tooltip.Group>`,
  anatomy: [['Overlap', '-8px (sm -6px)'], ['Ring', '2px bg-surface'], ['+N', 'bg-hover · text-secondary · 600'], ['Presence', '9px dot · green / amber / grey']],
  tokens: ['--bg-surface', '--bg-hover', '--text-secondary', '--viz-1', '--viz-2', '--viz-3', '--status-success-solid', '--status-warning-solid', '--text-disabled'],
  rules: {
    when: ['Showing who owns or belongs to something, in cards and tables'],
    whenNot: ['When people need to act on each person: use a list'],
    do: ['Show 3 avatars max in tables, 5 in headers', 'Always add the total as text next to it', 'Show names on hover'],
    dont: ['Use presence for guests or service accounts'],
    a11y: ['Group has aria-label "12 members"', 'Presence is also in the label, not only color'],
  },
});

C('ring-gauge', {
  name: 'Ring Gauge', group: 'Data display', icon: 'chart', mantine: 'RingProgress',
  desc: 'One percentage as a ring: storage used, adoption, policy compliance. Color changes with the value.',
  controls: [
    { k: 'metric', t: 'seg', o: ['compliance', 'storage', 'adoption'], d: 'compliance' },
    { k: 'value', t: 'range', min: 0, max: 100, d: 82 },
    { k: 'size', t: 'seg', o: ['sm', 'md', 'lg'], d: 'md' },
  ],
  render: p => {
    const sz = { sm: 56, md: 96, lg: 140 }[p.size], sw = { sm: 6, md: 9, lg: 12 }[p.size], r = (sz - sw) / 2, c = 2 * Math.PI * r, v = p.value;
    const inv = p.metric === 'storage';
    const tone = inv ? (v >= 90 ? 'danger' : v >= 75 ? 'warning' : 'success') : (v >= 80 ? 'success' : v >= 50 ? 'warning' : 'danger');
    const lab = { compliance: ['Policy compliance', `${Math.round(v * 12.84)} of 1,284 workspaces follow all policies`], storage: ['Storage used', `${(v * .25).toFixed(1)} TB of 25 TB`], adoption: ['Copilot adoption', `${Math.round(v * 31)} of 3,100 licensed users active`] }[p.metric];
    const ring = `<div class="h-ring" role="img" aria-label="${lab[0]}: ${v}%"><svg width="${sz}" height="${sz}"><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="var(--border-subtle)" stroke-width="${sw}"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="var(--status-${tone}-solid)" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v / 100)}"/></svg><span class="v">${p.size === 'sm' ? `<b style="font:var(--type-label)">${v}%</b>` : `<b>${v}%</b>`}</span></div>`;
    return `<div class="h-ring-wrap">${ring}<div><b>${lab[0]}</b><p>${lab[1]}</p></div></div>`;
  },
  react: p => `<RingProgress
  size={${{ sm: 56, md: 96, lg: 140 }[p.size]}}
  thickness={${{ sm: 6, md: 9, lg: 12 }[p.size]}}
  roundCaps
  sections={[{ value: ${p.value}, color: toneFor(${p.value}${p.metric === 'storage' ? ', { inverse: true }' : ''}) }]}
  label={<Text ta="center" fw={700}>${p.value}%</Text>}
/>`,
  anatomy: [['Sizes', '56 / 96 / 140'], ['Stroke', '6 / 9 / 12 · round caps'], ['Track', 'border-subtle'], ['Value', 'type-metric-m (sm: label)'], ['Caption', 'heading-s + body-s next to the ring']],
  tokens: ['--border-subtle', '--status-success-solid', '--status-warning-solid', '--status-danger-solid', '--type-metric-m', '--type-heading-s'],
  rules: {
    when: ['One part-of-a-whole number: storage, compliance, adoption'],
    whenNot: ['Several parts: use Donut', 'Risk scores: use Score Card with risk tokens'],
    do: ['Always say what the % is of, in words next to it', 'Flip the colors when high is bad (storage)'],
    dont: ['Show more than one value in a ring', 'Use rings for numbers that can pass 100%'],
    a11y: ['role="img" with the value in aria-label', 'The % is real text inside the ring'],
  },
});

C('code-block', {
  name: 'Code Block', group: 'Data display', icon: 'code', mantine: 'CodeHighlight · CopyButton',
  desc: 'Shows code, scripts or IDs with a copy button. Used for PowerShell, API keys, webhook URLs and tenant IDs. Click Copy.',
  controls: [
    { k: 'kind', t: 'seg', o: ['script', 'inline-copy'], d: 'script' },
    { k: 'copied', t: 'bool', d: false, l: 'Copied state' },
  ],
  render: p => {
    const btn = `<button class="h-btn ghost sm${p.copied ? ' done' : ''}" data-copy style="${p.copied ? 'color:var(--status-success-fg)' : ''}">${ic(p.copied ? 'check' : 'copy')}${p.copied ? 'Copied' : 'Copy'}</button>`;
    if (p.kind === 'inline-copy') return `<div class="h-field" style="width:420px"><label>Webhook URL</label><div class="h-copy"><span>https://api.orchestry.com/hooks/contoso/7f3a9c21e8</span><button data-copy class="${p.copied ? 'done' : ''}">${ic(p.copied ? 'check' : 'copy', 'ic-sm')}${p.copied ? 'Copied' : 'Copy'}</button></div><small>Paste this into Power Automate to get workspace events.</small></div>`;
    return `<div class="h-code fit" style="max-width:520px"><div class="h-code-head"><span>PowerShell</span>${btn}</div><pre><span class="c"># Give Orchestry read access to Teams</span>
<span class="k">Connect-MgGraph</span> -Scopes <span class="s">"Team.ReadBasic.All"</span>
<span class="k">New-MgServicePrincipal</span> -AppId <span class="s">"9b1c…e21f"</span>
<span class="k">Grant-OrchestryConsent</span> -Tenant <span class="s">"contoso"</span></pre></div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => { set({ copied: true }); })),
  react: p => p.kind === 'inline-copy' ? `<TextInput
  label="Webhook URL"
  value={url}
  readOnly
  rightSection={
    <CopyButton value={url}>
      {({ copied, copy }) => <Button size="xs" variant="subtle" onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>}
    </CopyButton>
  }
/>` : `<CodeHighlight
  language="powershell"
  code={script}
  copyLabel="Copy"
  copiedLabel="Copied"
/>`,
  anatomy: [['Header', 'language + Copy · bg-subtle'], ['Code', '12.5/20 mono · padding space-3/space-4'], ['Syntax', 'keyword text-brand · string warning-fg · comment secondary'], ['Copied', 'success-fg for 2s']],
  tokens: ['--font-mono', '--bg-surface', '--bg-subtle', '--border-default', '--text-brand', '--status-warning-fg', '--status-success-fg', '--radius-lg'],
  rules: {
    when: ['Scripts people run, IDs and URLs people paste somewhere else'],
    whenNot: ['Secrets shown in full: mask them and add Reveal'],
    do: ['Always add Copy', 'Show "Copied" for 2 seconds', 'Say what to do with it under the field'],
    dont: ['Wrap long lines in scripts: scroll instead'],
    a11y: ['"Copied" is announced with aria-live', 'Code blocks are focusable so they can be scrolled with keys'],
  },
});

/* =================================================================== STATUS */
const LIFE = { active: ['Active', 'check'], inactive: ['Inactive', 'clock'], review: ['Pending review', 'eye'], archived: ['Archived', 'archive'], deleted: ['Deleted', 'trash'] };
H.life = (k, sm) => `<span class="h-life ${k}"${sm ? ' style="height:20px;font-size:11px"' : ''}>${ic(LIFE[k][1])}${LIFE[k][0]}</span>`;
C('lifecycle-status', {
  name: 'Lifecycle Status', group: 'Status', icon: 'refresh', mantine: 'Badge',
  desc: 'Where a workspace is in its life: Active → Inactive → Pending review → Archived → Deleted. The track shows the whole journey.',
  controls: [
    { k: 'state', t: 'seg', o: Object.keys(LIFE), d: 'active' },
    { k: 'track', t: 'bool', d: true, l: 'Show track' },
  ],
  render: p => {
    const keys = Object.keys(LIFE), at = keys.indexOf(p.state);
    const tone = { active: 'var(--status-success-fg)', inactive: 'var(--text-secondary)', review: 'var(--status-warning-fg)', archived: 'var(--status-info-fg)', deleted: 'var(--status-danger-fg)' }[p.state];
    const note = { active: 'Last activity 2 hours ago.', inactive: 'No activity for 94 days. Owners will be asked to review it.', review: 'Owners have 14 days to keep or archive it.', archived: 'Read-only. Owners can restore it for 1 year.', deleted: 'In the recycle bin for 93 days, then gone.' }[p.state];
    return `<div style="display:flex;flex-direction:column;gap:16px;width:440px">${row1(p.state, note)}${p.track ? `<div class="h-life-track" style="color:${tone}">${keys.map((k, i) => `<div class="st${i < at ? ' done' : ''}${i === at ? ' on' : ''}"><div class="bar"></div><small>${LIFE[k][0]}</small></div>`).join('')}</div>` : ''}</div>`;
    function row1(s, n) { return `<div style="display:flex;gap:12px;align-items:center">${H.life(s)}<span style="font:var(--type-body-s);color:var(--text-secondary)">${n}</span></div>`; }
  },
  react: p => `<LifecycleStatus
  state="${p.state}"   // 'active' | 'inactive' | 'review' | 'archived' | 'deleted'${p.track ? '\n  withTrack' : ''}
/>`,
  anatomy: [['Badge', '24 high · radius-full · icon 14'], ['Track', '5 equal steps · 4px bars'], ['Current step', 'state color · label 600'], ['Past steps', 'neutral solid']],
  tokens: ['--status-success-fg', '--status-success-bg', '--status-warning-fg', '--status-warning-bg', '--status-info-fg', '--status-info-bg', '--status-danger-fg', '--status-danger-bg', '--bg-hover', '--radius-full'],
  rules: {
    when: ['Anywhere a workspace, site or team appears: tables, cards, detail headers'],
    whenNot: ['Health or risk: use Status Badge or Risk Badge'],
    do: ['Always use these 5 states with these exact names', 'Each state has its own icon, so color is never the only hint', 'Explain what happens next, next to the badge'],
    dont: ['Invent new states like "Dormant" or "Stale"', 'Use red for anything but Deleted'],
    a11y: ['Icon is decorative; the label is real text', 'Track is a list with aria-current on the current step'],
  },
});

const SENS = { public: ['Public', 'world', 'Anyone, even outside Contoso'], general: ['General', 'info', 'Everyone in Contoso'], confidential: ['Confidential', 'lock', 'Only members · no guests'], highly: ['Highly confidential', 'shield', 'Members only · no download · encrypted'] };
H.sens = (k, sm) => `<span class="h-label ${k}${sm ? ' sm' : ''}">${ic(SENS[k][1])}${SENS[k][0]}</span>`;
C('sensitivity-label', {
  name: 'Sensitivity Label', group: 'Status', icon: 'lock', mantine: 'Badge',
  desc: 'The Microsoft Purview label on a workspace or file. Four levels, from Public to Highly confidential. Each one adds more protection.',
  controls: [
    { k: 'level', t: 'seg', o: Object.keys(SENS), d: 'confidential' },
    { k: 'size', t: 'seg', o: ['sm', 'md'], d: 'md' },
    { k: 'all', t: 'bool', d: true, l: 'Show the scale' },
  ],
  render: p => p.all
    ? `<div style="display:flex;flex-direction:column;gap:10px;width:440px">${Object.keys(SENS).map(k => `<div style="display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:var(--radius-md);${k === p.level ? 'background:var(--bg-subtle);box-shadow:inset 0 0 0 1px var(--border-default)' : ''}"><span style="width:170px">${H.sens(k, p.size === 'sm')}</span><span style="font:var(--type-caption);color:var(--text-secondary)">${SENS[k][2]}</span></div>`).join('')}</div>`
    : H.sens(p.level, p.size === 'sm'),
  react: p => `<SensitivityLabel level="${p.level}"${p.size === 'sm' ? ' size="sm"' : ''} />
// level: 'public' | 'general' | 'confidential' | 'highly'
// Names come from the tenant's Purview labels; levels map to colors.`,
  anatomy: [['Shape', 'radius-sm (square-ish, unlike status pills)'], ['Border', '1px · 40–45% of the solid color'], ['Icon', 'world · info · lock · shield'], ['Sizes', '24 / 20 high']],
  tokens: ['--status-neutral-fg', '--status-info-fg', '--status-info-bg', '--status-warning-fg', '--status-warning-bg', '--status-danger-fg', '--status-danger-bg', '--border-default', '--radius-sm'],
  rules: {
    when: ['Anywhere a workspace, site, file or agent knowledge source shows its label'],
    whenNot: ['Showing risk or health: those are different things'],
    do: ['Use the tenant’s own label names, mapped to these 4 levels', 'Keep the square shape so labels never look like status pills', 'Show "No label" in grey when one is missing'],
    dont: ['Let people change a label without saying what protection changes', 'Use the danger color for Confidential'],
    a11y: ['Level is in the text, not only the color', 'Icons differ by level'],
  },
});

C('notification-indicator', {
  name: 'Notification Indicator', group: 'Status', icon: 'bell', mantine: 'Indicator',
  desc: 'A count or dot on an icon or nav item, to say something new is waiting. Use counts for actions, dots for "new".',
  controls: [
    { k: 'kind', t: 'seg', o: ['count', 'dot', 'pulse'], d: 'count' },
    { k: 'count', t: 'range', min: 0, max: 120, d: 4 },
    { k: 'tone', t: 'seg', o: ['danger', 'brand'], d: 'danger' },
  ],
  render: p => {
    const mark = p.kind === 'count' ? (p.count ? `<span class="n"${p.tone === 'brand' ? ' style="background:var(--action-primary);color:var(--text-on-brand)"' : ''}>${p.count > 99 ? '99+' : p.count}</span>` : '') : `<span class="d${p.tone === 'brand' ? ' brand' : ''}${p.kind === 'pulse' ? ' pulse' : ''}"></span>`;
    return `<div style="display:flex;align-items:center;gap:28px"><span class="h-indicator"><button class="h-icon-btn" aria-label="Notifications${p.kind === 'count' ? `, ${p.count} unread` : ', new'}">${ic('bell')}</button>${mark}</span><span class="h-indicator"><button class="h-icon-btn" aria-label="Approvals">${ic('checks')}</button>${mark}</span><div style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:var(--radius-md);background:var(--bg-hover);font:500 13px/18px var(--font-sans);width:180px">${ic('checks')}Approvals${p.kind === 'count' && p.count ? `<span style="margin-left:auto">${H.badge(p.tone === 'brand' ? 'info' : 'danger', String(p.count > 99 ? '99+' : p.count), false)}</span>` : p.kind !== 'count' ? `<span style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:${p.tone === 'brand' ? 'var(--action-primary)' : 'var(--status-danger-solid)'}"></span>` : ''}</div></div>`;
  },
  react: p => `<Indicator
  ${p.kind === 'count' ? `label={${p.count}}\n  size={16}\n  disabled={${p.count} === 0}` : `size={8}${p.kind === 'pulse' ? '\n  processing' : ''}`}
  color="${p.tone === 'brand' ? 'teal' : 'red'}"
  withBorder
>
  <ActionIcon variant="default" aria-label="Notifications${p.kind === 'count' ? ', ' + p.count + ' unread' : ''}"><IconBell size={18} /></ActionIcon>
</Indicator>`,
  anatomy: [['Count', '16 high · min 16 wide · 600 10px'], ['Max', '99+'], ['Dot', '8px · 2px surface ring'], ['Pulse', 'ring scales 0.6→1.6 · 1.6s']],
  tokens: ['--status-danger-solid', '--action-primary', '--text-on-brand', '--bg-surface', '--radius-full'],
  rules: {
    when: ['Something needs the person: approvals waiting, unread alerts'],
    whenNot: ['Marketing or "what’s new" in the product: use a Banner once'],
    do: ['Red counts = things to do. Teal dot = new but no action', 'Hide at 0', 'Cap at 99+'],
    dont: ['Pulse more than one thing on a page', 'Pulse forever: stop after the person opens it'],
    a11y: ['The count is in the button label: "Notifications, 4 unread"', 'Pulse respects prefers-reduced-motion'],
  },
});
})();

(function () {
const H = window.H, { ic, esc, cap, P } = H;
const C = (id, def) => H.registry.push(Object.assign({ id }, def));

/* =================================================================== FEEDBACK */
C('banner', {
  name: 'Banner', group: 'Feedback', icon: 'info', mantine: 'Alert (full width)',
  desc: 'A full-width message at the top of the app or a page. For things that affect the whole tenant: expiring consent, maintenance, new AI features.',
  controls: [
    { k: 'tone', t: 'seg', o: ['info', 'warning', 'danger', 'brand'], d: 'warning' },
    { k: 'action', t: 'bool', d: true, l: 'Action link' },
    { k: 'dismiss', t: 'bool', d: true, l: 'Dismissible' },
  ],
  render: p => {
    const m = { info: ['info', '<b>Scheduled maintenance</b> Saturday 2–4 AM UTC. Reports may be delayed.', 'See status page'], warning: ['alert', '<b>Admin consent expires in 6 days.</b> Orchestry will stop syncing Teams.', 'Renew consent'], danger: ['alert', '<b>Sync stopped.</b> We lost access to Microsoft Graph 2 hours ago.', 'Reconnect'], brand: ['', '<b>New:</b> Orchestry AI can now explain any risk score in plain words.', 'Try it'] }[p.tone];
    return `<div class="fit" style="max-width:720px;border:1px solid var(--border-default);border-radius:var(--radius-lg);overflow:hidden;background:var(--bg-page)"><div class="h-banner ${p.tone}" role="${p.tone === 'danger' ? 'alert' : 'status'}">${p.tone === 'brand' ? H.aiMark('') : ic(m[0])}<span class="msg">${m[1]}${p.action ? ` <a class="h-link" href="#" onclick="return false">${m[2]}</a>` : ''}</span>${p.dismiss && p.tone !== 'danger' ? `<button class="x" aria-label="Dismiss">${ic('x')}</button>` : ''}</div><div style="padding:16px;display:flex;flex-direction:column;gap:8px">${[60, 100, 85].map(w => `<div class="h-skel" style="height:12px;width:${w}%;animation:none;opacity:.6"></div>`).join('')}</div></div>`;
  },
  react: p => `<Banner
  tone="${p.tone}"${p.tone === 'brand' ? '\n  icon={<CometIcon />}' : ''}
  title="${{ info: 'Scheduled maintenance', warning: 'Admin consent expires in 6 days.', danger: 'Sync stopped.', brand: 'New:' }[p.tone]}"${p.action ? `\n  action={<Anchor onClick={fix}>${{ info: 'See status page', warning: 'Renew consent', danger: 'Reconnect', brand: 'Try it' }[p.tone]}</Anchor>}` : ''}${p.dismiss && p.tone !== 'danger' ? '\n  onDismiss={dismiss}' : ''}
>
  ${{ info: 'Saturday 2–4 AM UTC. Reports may be delayed.', warning: 'Orchestry will stop syncing Teams.', danger: 'We lost access to Microsoft Graph 2 hours ago.', brand: 'Orchestry AI can now explain any risk score in plain words.' }[p.tone]}
</Banner>`,
  anatomy: [['Height', '≈44 · padding 10/space-4'], ['Icon', '16 · same color as text'], ['Action', 'underlined link, same color'], ['Brand', 'bg-inverse + Comet mark'], ['Close', 'right · 10% hover']],
  tokens: ['--status-info-bg', '--status-info-fg', '--status-warning-bg', '--status-warning-fg', '--status-danger-bg', '--status-danger-fg', '--bg-inverse', '--type-body-s'],
  rules: {
    when: ['Something that affects the whole tenant or the whole page'],
    whenNot: ['Feedback on one action: use Toast', 'Info about one section: use Callout'],
    do: ['Show only one banner at a time (the most urgent)', 'Always say what to do: "Renew consent"', 'Remember dismissals per person'],
    dont: ['Let people dismiss a danger banner while the problem is still there', 'Use the brand banner more than once per release'],
    a11y: ['Danger uses role="alert"; others role="status"', 'Close button has aria-label "Dismiss"'],
  },
});

C('skeleton', {
  name: 'Skeleton', group: 'Feedback', icon: 'layers', mantine: 'Skeleton',
  desc: 'Grey shapes that show where content will appear while it loads. Feels faster than a spinner and stops the page from jumping.',
  controls: [
    { k: 'layout', t: 'seg', o: ['table', 'card', 'kpis'], d: 'table' },
    { k: 'animate', t: 'bool', d: true, l: 'Shimmer' },
  ],
  render: p => {
    const s = (w, h, r = '') => `<div class="h-skel" style="width:${w};height:${h}px;${r}${p.animate ? '' : 'animation:none'}"></div>`;
    if (p.layout === 'card') return `<div class="h-ws" aria-busy="true" aria-label="Loading workspace"><div class="h-ws-top"><div class="h-ws-row">${s('36px', 36, 'border-radius:10px;')}<div class="meta" style="display:flex;flex-direction:column;gap:6px">${s('70%', 14)}${s('45%', 10)}</div></div>${s('100%', 10)}${s('80%', 10)}<div style="display:flex;gap:6px">${s('90px', 20)}${s('70px', 20)}</div></div><div class="h-ws-foot">${s('80px', 24, 'border-radius:12px;')}${s('70px', 20, 'border-radius:12px;')}</div></div>`;
    if (p.layout === 'kpis') return `<div class="fit" style="display:flex;gap:12px;max-width:640px" aria-busy="true">${[1, 2, 3].map(() => `<div class="h-kpi" style="display:flex;flex-direction:column;gap:10px">${s('60%', 10)}${s('45%', 24)}${s('100%', 28)}</div>`).join('')}</div>`;
    return `<div class="h-card fit" style="max-width:640px;padding:0;overflow:hidden" aria-busy="true" aria-label="Loading workspaces"><div style="display:flex;gap:16px;padding:12px 16px;border-bottom:1px solid var(--border-subtle);background:var(--bg-subtle)">${['30%', '15%', '20%', '15%'].map(w => s(w, 10)).join('')}</div>${[1, 2, 3, 4].map(() => `<div style="display:flex;gap:16px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border-subtle)"><div style="width:30%;display:flex;gap:8px;align-items:center">${s('28px', 28, 'border-radius:8px;flex-shrink:0;')}${s('70%', 12)}</div>${s('15%', 12)}${s('20%', 20, 'border-radius:12px;')}${s('15%', 12)}</div>`).join('')}</div>`;
  },
  react: p => p.layout === 'table' ? `{loading ? <DataTable.Skeleton rows={4} columns={4} /> : <DataTable … />}` : p.layout === 'card' ? `{loading ? <WorkspaceCard.Skeleton /> : <WorkspaceCard … />}` : `<Group grow>
  {[0, 1, 2].map(i => (
    <Paper key={i} p="md">
      <Skeleton h={10} w="60%" />
      <Skeleton h={24} w="45%" mt="sm"${p.animate ? '' : ' animate={false}'} />
    </Paper>
  ))}
</Group>`,
  anatomy: [['Fill', 'bg-hover → bg-pressed shimmer'], ['Speed', '1.4s linear'], ['Shapes', 'match the real layout: same heights and radii'], ['Text lines', '10–14px tall']],
  tokens: ['--bg-hover', '--bg-pressed', '--radius-xs', '--border-subtle'],
  rules: {
    when: ['First load of a table, card grid or dashboard', 'Anything that takes more than ~300ms'],
    whenNot: ['Short actions like Save: use a loading Button', 'Very long jobs: use Progress with a message'],
    do: ['Match the shape of the real content', 'Show the real header and filters right away; skeleton only the data'],
    dont: ['Show a skeleton for under 300ms (it flashes)', 'Skeleton the whole page, including the nav'],
    a11y: ['Container has aria-busy="true"', 'Shimmer stops with prefers-reduced-motion'],
  },
});

C('loader', {
  name: 'Spinner & Loader', group: 'Feedback', icon: 'refresh', mantine: 'Loader · Progress',
  desc: 'Shows that something is working. Spinner for short waits; a loader with steps for long jobs like a full tenant scan.',
  controls: [
    { k: 'kind', t: 'seg', o: ['spinner', 'inline', 'page', 'bar'], d: 'page' },
    { k: 'size', t: 'seg', o: ['sm', 'md', 'lg'], d: 'md' },
  ],
  render: p => {
    const sp = `<span class="h-spinner${p.size === 'md' ? '' : ' ' + p.size}" role="status" aria-label="Loading"></span>`;
    if (p.kind === 'spinner') return `<div style="display:flex;gap:24px;align-items:center">${sp}${H.btn('', 'primary').replace('</button>', '<span class="h-spinner sm" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>Saving…</button>').replace('<button', '<button disabled style="opacity:1"')}</div>`;
    if (p.kind === 'inline') return `<div style="display:flex;align-items:center;gap:8px;font:var(--type-body-s);color:var(--text-secondary)"><span class="h-spinner sm"></span>Checking 1,284 workspaces…</div>`;
    if (p.kind === 'bar') return `<div style="width:420px;display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;font:var(--type-label)"><span>Syncing from Microsoft 365</span><span style="color:var(--text-secondary);font-weight:400">This may take a few minutes</span></div><div class="h-progress indet" style="height:6px"><i></i></div></div>`;
    return `<div class="h-loading" style="width:340px">${H.aiMark('lg', true)}<div><b>Scanning your tenant</b>Step 2 of 4 · Checking sharing on 214 agents</div><div class="h-progress" style="width:240px;height:6px"><i style="width:45%"></i></div><small style="font:var(--type-caption)">You can leave this page. We’ll notify you when it’s done.</small></div>`;
  },
  react: p => p.kind === 'page' ? `<Stack align="center" gap="sm">
  <CometMark size="lg" animated />
  <Title order={4}>Scanning your tenant</Title>
  <Text size="sm" c="dimmed">Step {step} of 4 · {stepLabel}</Text>
  <Progress value={pct} w={240} />
</Stack>` : p.kind === 'bar' ? `<Progress value={100} animated striped={false} />  // indeterminate` : p.kind === 'inline' ? `<Group gap={8}><Loader size="xs" /><Text size="sm" c="dimmed">Checking 1,284 workspaces…</Text></Group>` : `<Loader size="${p.size}" />
<Button loading loaderProps={{ type: 'oval' }}>Saving…</Button>`,
  anatomy: [['Spinner', '14 / 20 / 32 · 2–3px ring'], ['Speed', '0.7s per turn'], ['Bar', '6px · indeterminate 35% slide'], ['Page loader', 'animated Comet + step + progress']],
  tokens: ['--action-primary', '--border-subtle', '--text-secondary', '--type-heading-s', '--ease-standard'],
  rules: {
    when: ['Spinner: under ~3 seconds', 'Steps + progress: anything that can take minutes'],
    whenNot: ['Loading layout you can predict: use Skeleton'],
    do: ['Say what is happening: "Checking 1,284 workspaces…"', 'For long jobs, let people leave and notify them', 'Use the animated Comet only for AI work'],
    dont: ['Show more than one spinner on a page', 'Block the whole app for a background job'],
    a11y: ['role="status" with a label', 'Animations stop with prefers-reduced-motion'],
  },
});

C('notification-center', {
  name: 'Notification Center', group: 'Feedback', icon: 'bell', mantine: 'Popover · Tabs',
  desc: 'The panel behind the bell. Approvals, alerts and AI findings in one place, with actions right in the list. Click an item to mark it read.',
  controls: [
    { k: 'tab', t: 'seg', o: ['All', 'Approvals', 'Alerts'], d: 'All' },
    { k: 'read', t: 'range', min: 0, max: 3, d: 0, l: 'Marked read' },
    { k: 'empty', t: 'bool', d: false, l: 'Empty' },
  ],
  render: p => {
    const items = [['Approvals', H.avatar('Jordan Lee', 0), '<b>Jordan Lee</b> wants to create <b>Q3 Launch</b> from the Project template', '5 min ago', true], ['Alerts', `<span class="h-tile sm" style="background:var(--status-danger-bg);color:var(--status-danger-fg)">${ic('shield', 'ic-sm')}</span>`, '<b>HR Policy Assistant</b> is now shared with Everyone', '1 hour ago', false], ['Alerts', H.aiMark('sm'), '<b>Orchestry AI</b> found 14 inactive workspaces with guests', '3 hours ago', false], ['Approvals', H.avatar('Priya Shah', 1), '<b>Priya Shah</b> asked to add a guest from agency.com', 'Yesterday', true]];
    const list = items.filter(x => p.tab === 'All' || x[0] === p.tab);
    const body = p.empty ? `<div style="padding:40px 24px;text-align:center"><div class="h-tile" style="margin:0 auto 12px;background:var(--status-success-bg);color:var(--status-success-fg)">${ic('check')}</div><b style="font:var(--type-heading-s)">You’re all caught up</b><p style="font:var(--type-body-s);color:var(--text-secondary);margin:4px 0 0">New approvals and alerts will show up here.</p></div>` : list.map((x, i) => `<div class="h-notif-item${i >= p.read ? ' unread' : ''}" data-r="${i}">${x[1]}<div class="body">${x[2]}<time>${x[3]}</time>${x[4] ? `<div class="acts">${H.btn('Approve', 'primary', 'sm')}${H.btn('Decline', 'secondary', 'sm')}</div>` : ''}</div></div>`).join('');
    const unread = p.empty ? 0 : Math.max(0, list.length - p.read);
    return `<div class="h-notif" role="dialog" aria-label="Notifications"><div class="h-notif-head"><b>Notifications</b>${unread ? `<a class="h-link" href="#" onclick="return false" data-all style="font-size:12px">Mark all as read</a>` : ''}</div><div class="h-tabs" role="tablist">${['All', 'Approvals', 'Alerts'].map(t => `<button class="h-tab${t === p.tab ? ' on' : ''}" role="tab" aria-selected="${t === p.tab}" data-tab="${t}">${t}</button>`).join('')}</div>${body}<div class="h-notif-foot"><a class="h-link" href="#" onclick="return false" style="font-size:12px">View all activity</a></div></div>`;
  },
  wire: (el, p, set) => {
    el.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => set({ tab: b.dataset.tab, read: 0 })));
    el.querySelectorAll('[data-r]').forEach(r => r.addEventListener('click', e => { if (e.target.closest('button')) return; set({ read: Math.max(p.read, +r.dataset.r + 1) }); }));
    const a = el.querySelector('[data-all]'); a && a.addEventListener('click', () => set({ read: 3 }));
  },
  react: p => `<Popover width={380} position="bottom-end" shadow="lg">
  <Popover.Target>
    <Indicator label={unread} disabled={!unread}><ActionIcon aria-label={\`Notifications, \${unread} unread\`}><IconBell /></ActionIcon></Indicator>
  </Popover.Target>
  <Popover.Dropdown p={0}>
    <NotificationCenter
      tabs={['All', 'Approvals', 'Alerts']}
      defaultTab="${p.tab}"
      items={items}
      onApprove={approve}
      onMarkAllRead={markAllRead}
    />
  </Popover.Dropdown>
</Popover>`,
  anatomy: [['Panel', '380 wide · radius-lg · shadow-lg'], ['Item', 'padding space-3/space-4 · avatar or tile 28–32'], ['Unread', 'bg-selected 60% + 8px brand dot'], ['Inline actions', 'sm buttons under the text'], ['Footer', '"View all activity" · bg-subtle']],
  tokens: ['--bg-surface', '--bg-subtle', '--bg-selected', '--action-primary', '--border-subtle', '--shadow-lg', '--radius-lg', '--type-body-s', '--type-caption'],
  rules: {
    when: ['Anything that happened while the person was away and may need them'],
    whenNot: ['Instant feedback on their own action: use Toast'],
    do: ['Let people approve or decline right from the list', 'Group by type with tabs', 'Show a friendly empty state'],
    dont: ['Notify people about their own actions', 'Keep more than 90 days: link to Activity instead'],
    a11y: ['Opens as a dialog from the bell; focus goes to the first item', 'Unread is announced, not only shown with the dot'],
  },
});

C('partial-data', {
  name: 'Partial Data', group: 'Feedback', icon: 'alert', mantine: 'Custom',
  desc: 'Shows when only some data could load, for example when one tenant or one service did not answer. Better than an empty or wrong chart.',
  controls: [
    { k: 'kind', t: 'seg', o: ['chart', 'table-row', 'stale'], d: 'chart' },
  ],
  render: p => {
    if (p.kind === 'stale') return `<div class="h-card" style="width:320px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font:var(--type-caption);color:var(--text-secondary)">Active guests</span><span class="h-badge warning" title="Last updated 26 hours ago">${ic('clock', 'ic-sm')}26h old</span></div><div style="font:var(--type-metric-m);color:var(--text-primary)">1,402</div><div style="font:var(--type-caption);color:var(--text-secondary);margin-top:4px">Last synced yesterday 9:12 AM · <a class="h-link inline" href="#" onclick="return false">Sync now</a></div></div>`;
    if (p.kind === 'table-row') return `<div class="h-card fit" style="max-width:560px;padding:0;overflow:hidden"><div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:10px 16px;background:var(--bg-subtle);font:var(--type-caption);color:var(--text-secondary);border-bottom:1px solid var(--border-subtle)"><span>Workspace</span><span>Members</span><span>Storage</span></div>${[['Marketing Hub', '48', '18.2 GB'], ['Finance Team', '22', null], ['Q3 Launch', '15', '2.1 GB']].map(([n, m, s]) => `<div style="display:grid;grid-template-columns:2fr 1fr 1fr;padding:12px 16px;font:var(--type-body-s);border-bottom:1px solid var(--border-subtle);align-items:center"><span>${n}</span><span>${m}</span><span>${s ?? `<span style="display:inline-flex;align-items:center;gap:6px;color:var(--text-secondary)" title="SharePoint did not answer">${ic('alert', 'ic-sm')}Unavailable</span>`}</span></div>`).join('')}</div>`;
    return `<div class="h-card fit h-partial" style="max-width:560px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b style="font:var(--type-heading-s)">Agents created per week</b><span class="h-badge warning">${ic('alert', 'ic-sm')}Partial data</span></div><div style="display:flex;align-items:flex-end;gap:10px;height:110px">${[40, 62, 55, 80, 0, 0, 70].map((h, i) => h ? `<div style="flex:1;height:${h}%;background:var(--viz-1);border-radius:4px 4px 0 0"></div>` : `<div class="h-hatch" style="flex:1;height:100%;font-size:0"></div>`).join('')}</div><p style="margin:10px 0 0;font:var(--type-caption);color:var(--text-secondary)">Weeks 5–6 are missing: Power Platform did not answer. <a class="h-link inline" href="#" onclick="return false">Retry</a></p></div>`;
  },
  react: p => `<PartialData
  kind="${p.kind}"
  reason="${p.kind === 'stale' ? 'stale' : 'source-unavailable'}"
  source="${p.kind === 'table-row' ? 'SharePoint' : 'Power Platform'}"${p.kind === 'stale' ? '\n  lastSynced={syncedAt}' : ''}
  onRetry={refetch}
>
  {children}
</PartialData>`,
  anatomy: [['Missing area', 'hatch pattern · dashed border-strong'], ['Badge', 'warning · "Partial data" or age'], ['Cell', '"Unavailable" + icon, never 0 or blank'], ['Note', 'type-caption: what is missing, why, retry']],
  tokens: ['--bg-subtle', '--bg-hover', '--border-strong', '--status-warning-bg', '--status-warning-fg', '--text-secondary', '--viz-1'],
  rules: {
    when: ['Some sources failed or are slow and the rest is still useful'],
    whenNot: ['Everything failed: use an error Empty State'],
    do: ['Show exactly what is missing and why', 'Never show missing data as 0', 'Offer Retry'],
    dont: ['Hide the problem and show a smooth chart', 'Block the whole page because one part failed'],
    a11y: ['Missing parts have a text label, not only a pattern', 'Badge text is read before the chart'],
  },
});

/* =================================================================== AI PATTERNS */
C('ai-assistant', {
  name: 'AI Assistant Panel', group: 'AI patterns', icon: 'comet', mantine: 'Custom · Paper',
  desc: 'Chat with Orchestry AI about your tenant. Answers show their sources and suggest next steps. Click a suggested prompt.',
  controls: [
    { k: 'state', t: 'seg', o: ['welcome', 'answer', 'thinking'], d: 'answer' },
    { k: 'sources', t: 'bool', d: true, l: 'Show sources' },
  ],
  render: p => {
    const sugg = `<div class="h-ai-sugg">${['Which workspaces have no owner?', 'Show risky agents', 'Summarize guest access'].map(s => `<button data-s>${s}</button>`).join('')}</div>`;
    let body;
    if (p.state === 'welcome') body = `<div class="h-ai-chat-body" style="align-items:center;text-align:center;padding:28px 20px 16px">${H.aiMark('lg')}<b style="font:var(--type-heading-m);margin-top:8px">How can I help?</b><span style="font:var(--type-body-s);color:var(--text-secondary)">Ask about workspaces, people, agents or policies in Contoso.</span></div>${sugg}`;
    else body = `<div class="h-ai-chat-body"><div class="h-msg user"><div class="bub">Which workspaces have no owner?</div></div><div class="h-msg ai">${H.aiMark('sm')}<div class="bub">${p.state === 'thinking' ? '<span class="h-typing"><i></i><i></i><i></i></span><div style="font:var(--type-caption);color:var(--text-secondary)">Checking 1,284 workspaces…</div>' : `<b>7 workspaces</b> have no active owner. 3 of them have guests:<ul><li>Q2 Agency Brief · 4 guests</li><li>Partner Portal · 2 guests</li><li>Vendor Onboarding · 1 guest</li></ul>${p.sources ? `<div class="src"><span class="h-chip plain">${ic('folder', 'ic-sm')}Workspace directory</span><span class="h-chip plain">${ic('users', 'ic-sm')}Entra ID</span></div>` : ''}<div style="display:flex;gap:6px;margin-top:10px">${H.btn('Assign owners', 'primary', 'sm')}${H.btn('Open list', 'secondary', 'sm')}</div>`}</div></div></div>`;
    return `<div class="h-ai-chat" role="complementary" aria-label="Orchestry AI"><div class="h-ai-chat-head">${H.aiMark('')}<b>Orchestry AI<small>Answers from your Contoso data</small></b><button class="h-icon-btn sm ghost" aria-label="New chat">${ic('plus')}</button><button class="h-icon-btn sm ghost" aria-label="Close">${ic('x')}</button></div>${body}<div class="h-ai-compose"><textarea placeholder="Ask about your tenant…" aria-label="Message"></textarea><button class="h-icon-btn" aria-label="Send">${ic('send')}</button></div><div class="h-ai-foot">AI can make mistakes. Check before you act.</div></div>`;
  },
  wire: (el, p, set) => el.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { set({ state: 'thinking' }); setTimeout(() => set({ state: 'answer' }), 1200); })),
  react: p => `<AIAssistant
  title="Orchestry AI"
  context={{ tenant: 'contoso' }}
  suggestions={['Which workspaces have no owner?', 'Show risky agents', 'Summarize guest access']}${p.sources ? '\n  showSources' : ''}
  renderActions={(answer) => answer.actions.map(a => <Button size="xs" key={a.id} onClick={a.run}>{a.label}</Button>)}
  disclaimer="AI can make mistakes. Check before you act."
/>`,
  anatomy: [['Panel', '400 wide · radius-xl · shadow-md'], ['User bubble', 'action-primary · 4px corner bottom-right'], ['AI bubble', 'surface + border · Comet avatar 24'], ['Sources', 'plain chips under the answer'], ['Composer', 'textarea + teal send · disclaimer under']],
  tokens: ['--action-primary', '--text-on-brand', '--bg-surface', '--bg-subtle', '--border-subtle', '--brand-gradient', '--shadow-md', '--radius-xl', '--type-body-s'],
  rules: {
    when: ['Open questions about the tenant that would take many clicks to answer'],
    whenNot: ['A single known action: use a Button', 'AI help on one field: use AI Suggestion'],
    do: ['Show sources for every answer', 'End answers with 1–2 actions people can take', 'Show what the AI is doing while it thinks'],
    dont: ['Let the AI change anything without a confirm step', 'Hide the disclaimer'],
    a11y: ['New answers announced with aria-live="polite"', 'Enter sends, Shift+Enter adds a line', 'Typing dots stop with reduced motion'],
  },
});

C('ai-suggestion', {
  name: 'AI Suggestion', group: 'AI patterns', icon: 'wand', mantine: 'TextInput + custom',
  desc: 'AI fills in a value for you inside a normal field, like a workspace name or description. Press Tab or click Accept to keep it.',
  controls: [
    { k: 'field', t: 'seg', o: ['name', 'description', 'template'], d: 'name' },
    { k: 'state', t: 'seg', o: ['suggesting', 'accepted', 'off'], d: 'suggesting' },
  ],
  render: p => {
    const f = { name: ['Workspace name', 'MKT-', 'Q3 Product Launch', 'Follows your naming policy: department prefix + project.'], description: ['Description', 'Launch ', 'planning for the Q3 product release with the agency team.', 'Based on the name and the people you added.'], template: ['Template', '', 'Project workspace (recommended)', '8 of 10 Marketing projects used this template.'] }[p.field];
    const acc = p.state === 'accepted', off = p.state === 'off';
    const val = acc ? `<span style="color:var(--text-primary)">${f[1]}${f[2]}</span>` : off ? `<span style="color:var(--text-primary)">${f[1]}</span>` : `<span style="color:var(--text-primary)">${f[1]}</span><span class="ghost">${f[2]}</span>`;
    const field = `<div class="h-input${off ? ' focus' : ''}" style="min-width:0;${acc || off ? '' : 'border:0;'}">${val}${acc ? `<span style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;font:var(--type-caption);color:var(--text-brand)">${H.comet('', true)}AI</span>` : ''}${p.state === 'suggesting' ? '<span class="h-kbd" style="margin-left:auto">Tab</span>' : ''}</div>`;
    return `<div class="h-field" style="width:400px"><label>${f[0]}</label>${p.state === 'suggesting' ? `<div class="h-ai-field">${field}</div>` : field}${p.state === 'suggesting' ? `<div class="h-ai-hint">${H.comet('', true)}<span style="flex:1">${f[3]}</span><button class="h-btn ghost sm" data-acc>Accept</button><button class="h-btn ghost sm" data-off>Dismiss</button></div>` : acc ? `<small>Suggested by AI · <a class="h-link inline" href="#" onclick="return false" data-undo>Undo</a></small>` : '<small>Type a name, or wait and AI will suggest one.</small>'}</div>`;
  },
  wire: (el, p, set) => { const a = el.querySelector('[data-acc]'), o = el.querySelector('[data-off]'), u = el.querySelector('[data-undo]'); a && a.addEventListener('click', () => set({ state: 'accepted' })); o && o.addEventListener('click', () => set({ state: 'off' })); u && u.addEventListener('click', () => set({ state: 'suggesting' })); },
  react: p => `<AISuggestInput
  label="${{ name: 'Workspace name', description: 'Description', template: 'Template' }[p.field]}"
  value={value}
  onChange={setValue}
  suggest={(ctx) => ai.suggest('${p.field}', ctx)}   // debounced 400ms
  acceptKey="Tab"
  onAccept={(v) => track('ai_suggestion_accepted', { field: '${p.field}' })}
/>`,
  anatomy: [['Border', '1px brand-gradient while suggesting'], ['Ghost text', 'text-disabled after the typed text'], ['Hint', 'Comet 12 · reason · Accept / Dismiss'], ['Accepted', 'normal field + small "AI" tag + Undo']],
  tokens: ['--brand-gradient', '--text-disabled', '--text-brand', '--text-secondary', '--type-caption', '--radius-md'],
  rules: {
    when: ['Fields where a good default saves time: names, descriptions, templates'],
    whenNot: ['Legal or security choices (privacy, sensitivity): suggest in a Callout and let people pick'],
    do: ['Say why: "Follows your naming policy"', 'Tab accepts, Esc dismisses', 'Keep an Undo after accepting'],
    dont: ['Overwrite what people typed', 'Suggest again right after a dismiss'],
    a11y: ['Suggestion is announced: "Suggestion: Q3 Product Launch. Press Tab to accept"', 'Ghost text is not the field value until accepted'],
  },
});

C('ai-feedback', {
  name: 'AI Feedback', group: 'AI patterns', icon: 'thumb-up', mantine: 'Group · Chip',
  desc: 'Thumbs up or down under every AI answer. A thumbs down asks why, in one click. This is how the AI gets better.',
  controls: [
    { k: 'vote', t: 'seg', o: ['none', 'up', 'down'], d: 'none' },
    { k: 'reason', t: 'select', o: ['none', 'Wrong data', 'Not helpful', 'Too long', 'Unsafe'], d: 'none' },
    { k: 'copy', t: 'bool', d: true, l: 'Copy & retry' },
  ],
  render: p => {
    const thanks = p.vote === 'up' || p.vote === 'down' && p.reason !== 'none';
    return `<div style="width:420px"><div class="h-msg ai" style="margin-bottom:10px">${H.aiMark('sm')}<div class="bub" style="background:var(--bg-surface);border:1px solid var(--border-subtle)"><b>3 agents</b> are shared with Everyone and use HR data. The riskiest is <b>HR Policy Assistant</b> (score 86).</div></div><div class="h-ai-fb" style="padding-left:32px"><button class="h-icon-btn${p.vote === 'up' ? ' on' : ''}" aria-label="Good answer" aria-pressed="${p.vote === 'up'}" data-v="up">${ic('thumb-up')}</button><button class="h-icon-btn${p.vote === 'down' ? ' on neg' : ''}" aria-label="Bad answer" aria-pressed="${p.vote === 'down'}" data-v="down">${ic('thumb-down')}</button>${p.copy ? `<button class="h-icon-btn" aria-label="Copy answer">${ic('copy')}</button><button class="h-icon-btn" aria-label="Try again">${ic('refresh')}</button>` : ''}${thanks ? `<span style="margin-left:4px">Thanks. This helps Orchestry AI learn.</span>` : ''}</div>${p.vote === 'down' && p.reason === 'none' ? `<div class="h-ai-fb-panel" style="margin-left:32px;width:auto"><b>What went wrong?</b><div style="display:flex;gap:6px;flex-wrap:wrap">${['Wrong data', 'Not helpful', 'Too long', 'Unsafe'].map(r => `<span class="h-fchip" style="padding:0 10px;cursor:pointer" data-r="${r}">${r}</span>`).join('')}</div><div class="h-textarea" style="min-height:0"><textarea style="min-height:52px" placeholder="Tell us more (optional)"></textarea></div><div style="display:flex;justify-content:flex-end;gap:6px">${H.btn('Skip', 'ghost', 'sm')}${H.btn('Send', 'primary', 'sm')}</div></div>` : ''}</div>`;
  },
  wire: (el, p, set) => { el.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => set({ vote: p.vote === b.dataset.v ? 'none' : b.dataset.v, reason: 'none' }))); el.querySelectorAll('[data-r]').forEach(c => c.addEventListener('click', () => set({ reason: c.dataset.r }))); },
  react: p => `<AIFeedback
  answerId={answer.id}
  reasons={['Wrong data', 'Not helpful', 'Too long', 'Unsafe']}
  onVote={(vote, reason, note) => api.feedback({ answerId, vote, reason, note })}${p.copy ? '\n  onCopy={copyAnswer}\n  onRetry={regenerate}' : ''}
/>`,
  anatomy: [['Buttons', '28×28 icon buttons · gap space-2'], ['Up on', 'action-primary-subtle · text-brand'], ['Down on', 'status-danger-bg · danger-fg'], ['Reason panel', 'chips + optional note · Skip / Send']],
  tokens: ['--action-primary-subtle', '--text-brand', '--status-danger-bg', '--status-danger-fg', '--border-default', '--bg-surface', '--type-caption'],
  rules: {
    when: ['Under every AI answer, summary and insight'],
    whenNot: ['Under AI Suggestions in fields: accept/dismiss is the feedback'],
    do: ['Ask "why" only after a thumbs down', 'Make the reason one click; the note optional', 'Say thanks in one line'],
    dont: ['Show a pop-up survey', 'Ask for feedback again on the same answer'],
    a11y: ['Thumbs use aria-pressed', 'Reason chips are buttons in a group with a label'],
  },
});
})();
