# Step 37 — App Shell (sidebar 240px, topbar 72px, right rail 320px)

> Phase 8.1 — see `docs/phase-8-redesign-plan.md` §8.1 for full spec.
> Prereq: Phase 0 foundation already merged (commit `467ecfb`).

## Prompt for Claude Code

```
Rebuild the dashboard shell to match design/overview-mockup.html (3-column grid).

New files:
- src/components/layout/app-shell.tsx — server component, grid-template-columns:
  240px 1fr 320px at ≥1280px; takes children + `rail` parallel-route slot prop.
- src/components/layout/right-rail.tsx — sticky aside, Frost bg, left border,
  scrollable; renders nothing when no `rail` content.
- src/app/(dashboard)/@rail/default.tsx — returns null for routes without rail.

Rewrite:
- src/components/layout/sidebar.tsx — 240px Frost bg (no glass), brand mark
  "C" in Cobalt square + "HR Curie" in Fraunces. Nav overline "Main menu" /
  "Favorites". Active state: left bar ::before (3px Cobalt, -16px left).
  Leave item gets <Pill variant="count">N</Pill> right-aligned (count from
  prisma.leaveRequest.count({where:{status:"PENDING"}}) passed via prop).
  Employees item gets mono count "128" right-aligned. Account block pinned
  bottom: avatar + name + role + chevron link to /profile.
- src/components/layout/topbar.tsx — 72px tall. Left: breadcrumb trail from
  pathname in --font-curie-mono ("workspace / overview"). Right: 280px search
  pill (disabled, aria-disabled, "Search people, leave, meetings…" + ⌘K kbd)
  and 36px bell IconBtn with dot indicator. Drop the page-title heading.
- src/components/layout/mobile-nav.tsx — drawer using new tokens (Frost bg,
  same nav items, account block at top).
- src/app/(dashboard)/layout.tsx — use AppShell; resolve session + counts via
  Promise.all; accept `rail: React.ReactNode` from Next parallel route slots.
- src/components/layout/nav-items.ts — add `section: "main" | "favorites"` and
  optional `count?: number` field.

Responsive:
- <1280px: rail renders below main, sidebar stays at 240px
- <1024px: sidebar icon-only at 60px
- <768px: sidebar hidden, hamburger in topbar opens MobileNav
- KPI/page content rules for consumers: KPI row 4→2→1 columns, two-column
  grids collapse below 1024px, search collapses to icon button below 768px.

Use only --color-curie-*, --font-curie-* tokens. No apple-* classes, no glass-*.
Use semantic controls: nav links are Link + aria-current, icon controls have
accessible names, disabled search uses aria-disabled and is not focusable.
```

## Test
- Manually visit /, /profile, /employees, /leave, /calendar, /settings at 1440/1280/1024/768.
- `npx playwright test --project=chromium tests/e2e/flows/navigation.spec.ts` still green.

## Commit
```bash
git add src/components/layout src/app/\(dashboard\)/layout.tsx && \
  git commit -m "step-37: app shell — 3-column grid with sidebar, topbar, right rail"
```
