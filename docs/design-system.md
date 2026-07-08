# HR Curie Design System — Cobalt / Frost / Ink

The visual source of truth is [`design/overview-mockup.html`](../design/overview-mockup.html).
All implementation tokens live in `src/app/globals.css` inside the `@theme inline`
block and are **namespaced with `curie`** (`--color-curie-*`, `--font-curie-*`,
`--radius-curie-*`, `--shadow-curie-*`). The namespace is canonical — do not
create unprefixed aliases; a repo-wide rename is deliberately out of scope.

shadcn/ui primitives keep their own semantic variables (`--background`,
`--primary`, …) defined in `:root` / `.dark`; Curie tokens style everything
above that layer (app shell, widgets, domain components).

## Palette

### Surfaces (Frost)

| Token | Value | Use |
|---|---|---|
| `--color-curie-bg` | `#F5F7FA` | App background |
| `--color-curie-surface` | `#FFFFFF` | Cards, panels |
| `--color-curie-surface-elev` | `#FFFFFF` | Elevated cards (pair with shadow) |
| `--color-curie-surface-sunken` | `#EEF2F8` | Wells, tag backgrounds, hover fills |

### Foreground (Ink)

| Token | Value | Use |
|---|---|---|
| `--color-curie-fg` | `#0B0F1A` | Primary text |
| `--color-curie-fg-secondary` | `#4B5563` | Secondary text |
| `--color-curie-fg-muted` | `#9AA3B2` | Muted text, placeholders |
| `--color-curie-fg-on-ink` | `#FFFFFF` | Text on dark surfaces |
| `--color-curie-fg-on-brand` | `#FFFFFF` | Text on brand surfaces |

### Brand (Cobalt)

| Token | Value | Use |
|---|---|---|
| `--color-curie-brand` | `#2563EB` | Primary actions, active nav |
| `--color-curie-brand-hover` | `#1D4ED8` | Hover state |
| `--color-curie-brand-soft` | `#DCE7FF` | Soft chips, count pills |
| `--color-curie-brand-wash` | `#EEF4FF` | Tinted washes, selected rows |
| `--color-curie-brand-ink` | `#1E3A8A` | Text on soft brand fills |

### Semantic

| Token | Value | Pairs with |
|---|---|---|
| `--color-curie-success` | `#16A34A` | `--color-curie-success-soft` `#DCFCE7` |
| `--color-curie-warning` | `#D97706` | `--color-curie-warning-soft` `#FEF3C7` |
| `--color-curie-danger` | `#DC2626` | `--color-curie-danger-soft` `#FEE2E2` |
| `--color-curie-info` | `#0891B2` | `--color-curie-info-soft` `#CFFAFE` |

### Borders

| Token | Value |
|---|---|
| `--color-curie-border` | `#E2E8F0` |
| `--color-curie-border-strong` | `#CBD5E1` |

## Typography — Fraunces + General Sans

| Token | Stack | Use |
|---|---|---|
| `--font-curie-display` | Fraunces, ui-serif, Georgia, serif | Page greetings, KPI numbers, display headings |
| `--font-curie-sans` | General Sans, ui-sans-serif, system-ui | Everything else |
| `--font-curie-mono` | ui-monospace, SF Mono, Menlo | Counts, tabular figures |

The Tailwind-level `--font-sans` / `--font-display` / `--font-heading` map to the
same pairing, so `font-sans` and `font-display` utilities resolve correctly.

## Radius scale

| Token | Value | Use |
|---|---|---|
| `--radius-curie-xs` | 4px | Small inline elements |
| `--radius-curie-sm` | 8px | Inputs, small cards |
| `--radius-curie-md` | 12px | Cards |
| `--radius-curie-lg` | 18px | Large cards, rail panels |
| `--radius-curie-xl` | 24px | Hero surfaces |
| `--radius-curie-pill` | 999px | Pills, buttons, avatars |

## Shadow scale

| Token | Use |
|---|---|
| `--shadow-curie-soft` | Resting cards |
| `--shadow-curie-lifted` | Popovers, dragged/elevated states |

## Spacing & shell dimensions

Spacing uses the default Tailwind scale (multiples of 4px). Fixed shell
dimensions from the mockup:

| Token | Value |
|---|---|
| `--curie-sidebar-w` | 240px |
| `--curie-rail-w` | 320px |

## Component vocabularies

Primitives live in `src/components/curie/` and expose `data-curie` attributes
for testing. The core vocabularies:

### Pill (`pill.tsx`)

`variant`: `role` (outlined) · `tag` (sunken fill) · `count` (brand-soft, mono)
· `status-pending` (warning) · `status-approved` (success) ·
`status-rejected` (danger) · `status-info` (info).
Fixed 22px height, 11px medium text, pill radius.

### Avatar (`avatar.tsx`)

`size`: `xs` 20px · `sm` 28px · `md` 36px · `lg` 44px. Renders `imageSrc` or
initials on a deterministic frost tint (`a`–`f`, hashed from the name via
`lib/name-hash.ts`). `bordered` adds a surface ring. `AvatarStack` overlaps
multiple avatars with a `+N` overflow pill.

### Button (`btn.tsx`, `icon-btn.tsx`)

`Btn` — `variant`: `primary` (cobalt fill) · `secondary` (surface + border);
`size`: `sm` (h-8, 12px) · `md` (h-10, 13px); pill radius, optional leading
icon, brand focus-visible outline. `IconBtn` is the square icon-only variant
used in the topbar/rail.

Other primitives: `Sparkline`, `Icons` (stroke icon set), plus the domain
widgets (`kpi-card`, `workforce-composition-donut`, `mini-calendar`, …) that
compose these vocabularies.

## Dark mode & `next-themes`

Dark mode is **deferred to Phase 9**. The `next-themes` dependency is kept —
its only consumer today is `src/components/ui/sonner.tsx` (shadcn toaster), and
the shadcn `.dark` variable block in `globals.css` remains as the hook point.
Curie dark tokens (`--color-curie-*` dark values) will be added in Phase 9.
