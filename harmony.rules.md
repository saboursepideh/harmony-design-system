# harmony.rules.md
**Harmony: Orchestry Design System, v2.2.0**

AI agents (Claude, Copilot) and people read this file before they build or change any Orchestry UI, in Figma or in code. If something is not covered here or in `orchestry-tokens.css`, stop and ask the design system owner. Do not invent it.

Source of truth, in this order:
1. `orchestry-tokens.css`: every value (237 tokens)
2. `orchestry-tokens.json`: the same tokens in W3C DTCG format, synced to Figma variables
3. This file: how to use them
4. `orchestry-design-system.html`: live docs and examples

---

## 1. Tokens

- Never use raw hex, rgb, or px values in product UI. Use a token.
- Use **semantic** tokens: `--bg-*`, `--text-*`, `--border-*`, `--action-*`, `--status-*`, `--risk-*`, `--priority-*`, `--viz-*`, `--agent-*`, `--entity-*`.
- **Primitives** (`--teal-600`, `--ink-400`, `--red-700`…) are only for building semantic tokens. Don't use them in components.
- If a value you need doesn't exist, don't add a one-off. Open a request (see section 10).

### Color rules
| Need | Token | Note |
|---|---|---|
| Main text | `--text-primary` | 12.4:1 on white |
| Secondary text, breadcrumbs, table headers | `--text-secondary` | 5.1:1. Replaces the old `#8F9CAE` (2.8:1) |
| Placeholder text | `--text-secondary` | Placeholders are readable content, so they must pass AA too |
| Disabled only | `--text-disabled` | Exempt from AA because it is inactive. **Never** for readable content or placeholders |
| Primary button and other teal fills | `--action-primary` | Fills only. As text it drops to 2.6–2.9:1 in dark |
| Links, active tab, any teal text | `--text-brand` | 6.1:1 light · 7.4:1 dark |
| Page background | `--bg-page` | |
| Cards | `--bg-surface` + `--border-default` | |
| Side navigation | `--bg-nav`, `--text-nav` | 7.05:1 |

- Every primitive family (teal, lime, ink, green, amber, orange, red, blue, cyan, pink, indigo) runs the same ten steps: 50, 100, 200 … 900. Ink also keeps three helpers: 0, 25, 150.
- Orchestry Teal (`--teal-600`, `#007980`) is the logo color. Use `--action-primary` (teal-700) for interactive UI.
- Orchestry Lime (`--lime-400`, `#96C23A`) is decorative only (2.1:1). Never use it for text, icons that carry meaning, or as the only signal.
- `--brand-gradient` is for marketing moments and the hero. Never inside data UI.

---

## 2. Typography

- **Lexend only.** `--font-mono` (JetBrains Mono) is for code and IDs only.
- Use only the 12 `--type-*` styles. No other font sizes.

| Style | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 32/40 | 500 | Score number |
| `metric-l` | 28/36 | 500 | Hero metric in a metric card |
| `metric-m` | 20/28 | 500 | KPI tile, stat card value |
| `heading-l` | 20/28 | 600 | Page title |
| `heading-m` | 16/24 | 600 | Section and card title |
| `heading-s` | 14/20 | 600 | Small card title, table primary cell |
| `body-m` | 14/20 | 400 | Default text |
| `body-s` | 13/20 | 400 | Subtitles, table cells, descriptions |
| `button` | 13/20 | 600 | Buttons |
| `label` | 12/16 | 600 | Badges, chips |
| `caption` | 12/16 | 400 | Meta text, timestamps |
| `overline` | 11/16 | 600 | Group labels, table headers (uppercase, +0.4px) |

- Metric numbers use `font-variant-numeric: tabular-nums`.
- Sentence case everywhere. Uppercase only through `overline`.

---

## 3. Spacing, radius, elevation, layout

- 4pt scale: `--space-0-5` (2) · `1` (4) · `1-5` (6) · `2` (8) · `3` (12) · `4` (16) · `5` (20) · `6` (24) · `8` (32) · `10` (40) · `12` (48) · `16` (64).
- Prefer semantic spacing: `--inset-card` (20), `--inset-card-lg` (24), `--gap-cards` (12), `--gap-section` (32), `--gap-stack` (12), `--gap-inline` (8).
- Radius: `xs` 4 (bars, progress) · `sm` 6 (small controls) · `md` 8 (buttons, inputs, nav items) · `lg` 12 (cards, panels, icon tiles) · `xl` 16 (modals) · `full` (badges, avatars).
- Shadows: static cards have **no shadow**. `--shadow-sm` on hover, `--shadow-md` for menus, `--shadow-lg` for modals.
- Layout: sidebar 280 (collapsed 72), content max 1200, page padding 40 × 32, 12-column grid with 12px gutter.
- Control heights: sm 28 · md 32 (default) · lg 40.

---

## 4. Components

Build with **Mantine**. Use the Harmony wrapper when one exists. Never rebuild a component with a custom `div` or `span`.

| Group | Harmony component | Mantine |
|---|---|---|
| Actions | Button, Icon Button, Button Group, Link, Action Menu | `Button`, `ActionIcon`, `Button.Group`, `Anchor`, `Menu` |
| Inputs | Text Input, Select & Menu, Switch, Textarea, Radio Group, Segmented Control, People Picker, Checkbox, Date Picker, File Upload, Slider, Filter Bar | `TextInput`, `Select`, `Switch`, `Textarea`, `Radio`, `SegmentedControl`, `MultiSelect`/`TagsInput`, `Checkbox`, `DatePickerInput`, `Dropzone`, `Slider`, `Group` + `Pill` |
| Navigation | Tabs, Side Nav, Breadcrumbs, Pagination, Top Bar, Stepper, Command Palette, Tree View | `Tabs`, `AppShell.Navbar` + `NavLink`, `Breadcrumbs`, `Pagination`, `AppShell.Header`, `Stepper`, `Spotlight`, `Tree` |
| Containers | Card, Page Header, Section Header, Accordion, Drawer, Popover, Description List, Workspace Card | `Card`/`Paper`, `Group` + `Title`, `Accordion`, `Drawer`, `Popover`/`HoverCard`, `SimpleGrid`, `Card` |
| Data display | Score Card, KPI Tile, Metric Card, Stat Card, Progress Bar, Donut Chart, Data Table, Avatar, Timeline, Avatar Group, Ring Gauge, Code Block | `Card`, `Progress`, `@mantine/charts`, `Table`, `Avatar`, `Timeline`, `Avatar.Group`, `RingProgress`, `Code` |
| Status & labels | Status Badge, Risk Badge, Priority Indicator, Insight Tag, Lifecycle Status, Sensitivity Label, Notification Indicator | `Badge`, `Pill`, `Indicator` |
| Feedback | Callout, Tooltip, Modal, Toast, Empty State, Banner, Skeleton, Loader, Notification Center, Partial Data | `Alert`, `Tooltip`, `Modal`, `Notifications`, `Skeleton`, `Loader`, `Popover` + `ScrollArea`, `Stack` |
| AI patterns | AI Insight, AI Assistant, AI Suggestion, AI Feedback (all marked with the Comet icon) | Custom, built on `Paper`, `Textarea`, `ActionIcon` |

**66 components in total** (the live playground is the exact list). Before creating anything new, search this list and the Figma library for an existing component or variant.

### Key component rules
- **Button:** one primary button per view. Variants: primary, secondary, subtle, danger. Sizes sm/md/lg map to control heights.
- **Card:** `--bg-surface`, `--border-default`, `--radius-lg`, padding `--inset-card`. Cards in a row share equal height. Never nest a card in a card.
- **Score Card:** always shows the scale (0–100), the industry benchmark, the change since last scan, and a "How is this calculated?" link. Fill is `--viz-score-fill`, never red.
- **Metric Card:** one hero number only. Pair the progress color with a matching Status Badge.
- **Data Table:** headers use `overline` + `--text-secondary`. Row padding 12/16, `--border-subtle` dividers, no zebra stripes. Explain risk with Insight Tags in the expandable row, not in a modal.
- **Charts:** series use `--viz-1…8` in order, or `--agent-*` for agent types. Never use status red/green as series colors. Max 6 donut slices. Legends show values, not only colors.
- **Avatar:** initials color is picked from the name (stable), never random per render.

---

## 5. Status, risk, and priority

These are three **different** scales. Don't mix them.

| Scale | Values | Tokens | Component |
|---|---|---|---|
| Status (state of a thing) | Ready · Needs review · At risk · Scanning · Inactive | `--status-{success,warning,danger,info,neutral}-{fg,bg,solid}` | Status Badge |
| Risk (how dangerous an agent or site is) | Critical · High · Elevated · Moderate · Low | `--risk-{critical,high,elevated,moderate,low}-{fg,bg,solid}` | Risk Badge |
| Priority (order of recommendations) | Urgent · Important · Standard | `--priority-*` | Priority Indicator |

- Moderate and Elevated share the amber hue: Moderate is light amber (`amber-300` solid), Elevated is deep amber (`amber-600` solid). The word tells them apart.
- **Always pair color with a word.** Never color alone. Critical risk also gets an icon.
- Risk Badge shows the score (0–100) when the list is sorted by risk.
- Don't invent a sixth risk level or a new status color.

---

## 6. Data states

Every data component must design for all five states. When AI generates a component, it generates all five.

| State | When | Show |
|---|---|---|
| Loading | First load, under 10s | Skeleton shaped like the real content. No full-page spinners |
| Empty | Nothing set up yet | What it is, why it's empty, one action |
| Partial | Some sources failed | Real data + hatch pattern for missing + warning badge + retry |
| Stale | Last scan over 24h ago | Neutral callout with the scan time + "Run scan" |
| Error | Scan failed | Warning callout, plain reason, retry link |

Never show `0` when data is missing. Missing is not zero.

---

## 7. Writing (including AI-generated insights)

- **Lead with the fact.** "47 agents have no owner." Not "It looks like some agents may be missing owners."
- **Say what to do next.** "Assign owners to 12 critical agents first."
- **Show your source.** "Based on Entra ID sign-ins, last 30 days." Not "Our AI detected…"
- Use numbers, not adjectives. Keep badges to 1–2 words, nav labels to 1–3 words.
- Write switch labels as the "on" state. Write tags as facts ("Shared externally").
- Tooltips explain a term or icon. No links or actions inside tooltips.

---

## 8. Accessibility

- All text meets WCAG 2.2 AA (4.5:1 normal, 3:1 large). Check every new text/background pair.
- Interactive elements show `--focus-ring` on keyboard focus.
- Minimum target 28px (sm controls), 32px default.
- Charts have a text alternative (legend values or a summary sentence).
- Modals close with Esc and the X, and trap focus.

---

## 9. Figma rules

- Every instance is linked to the Harmony library. **No detached components.**
- All fills, strokes, text, radius, and spacing use Figma variables that match the token names.
- Components use variants and boolean properties (for example: Risk Badge `level` × `size`, booleans `score` and `icon`).
- Every component has Code Connect pointing to its Mantine/Harmony code.
- Feature files never define new components. New things go through the request path below.

---

## 10. How to add or change something

1. **Request:** anyone opens a request with the use case.
2. **Check:** AI searches Harmony for an existing component or variant first.
3. **Draft:** AI drafts variants, tokens, docs, all five data states, and the Mantine mapping from this file.
4. **Review:** design reviews the design; engineering reviews the Mantine mapping.
5. **Publish:** library published, tokens versioned, changelog written.

**Versioning (semver):** Major = token renamed or removed, or component API changed. Minor = new component, variant, or token. Patch = value tweak, docs fix, contrast fix. The Figma library, CSS tokens, Mantine theme, and this file always share one version number.

**Weekly drift audit (AI):** finds detached instances, flags raw hex values and off-scale font sizes, compares Figma variables to `orchestry-tokens.css`, re-checks every text pair for AA, and posts a short report.

---

## Prompt template for AI

> Using harmony.rules.md and orchestry-tokens.css, create a **[component]** for **[use case]**.
> Map it to Mantine **[component]**. Use only semantic tokens.
> Include variants **[list]**, boolean properties **[list]**, all five data states if it shows data, and do/don't guidance.
> Check AA contrast for every text pair and report the ratios.
