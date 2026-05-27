# Phase 8 — Visual redesign to match `design/overview-mockup.html`

**Status:** ready to execute
**Predecessor:** Phase 0 (commit `467ecfb`) — Cobalt/Frost token layer + Fraunces/General Sans wired alongside existing Apple tokens. No visible change yet.
**Successor:** Phase 9 — performance + accessibility polish (separate doc).

## Why this phase exists

After Phase 0, every dashboard page still renders with the old Apple HIG layout because the new Curie token layer is present but unused by visible components. Phase 8 is the actual visual transformation: every screen the user sees ends up matching the mockup at 1440 × 900, with all four KPI cards, the donut, the onboarding tracker, the notice board, the mini calendar, today's schedule, and the coming-up list all backed by real data wherever it exists.

User decisions already locked (from the phase-planning conversation):

- **Scope:** full migration of every route, not additive
- **Synthetic sections (Open roles / Onboarding / Notice board):** scope new Prisma models — no fixtures, no empty states without backing data
- **Fonts:** Fraunces via `next/font/google`, General Sans via Fontshare CDN (already wired in Phase 0)

Canonical references for execution:

- `design/overview-mockup.html` is the only visual source of truth. The step files in `.claude-steps/phase-8-redesign/` are execution prompts, not separate mockup copies.
- Implementation code uses namespaced Curie tokens during this phase: `--color-curie-*`, `--font-curie-*`, `--radius-curie-*`, `--shadow-curie-*`, plus `--curie-sidebar-w` and `--curie-rail-w`. Do not introduce unprefixed `--color-bg` / `--color-surface` aliases from the static mockup into React components.
- Visual parity screenshots freeze time to **Tuesday, May 26, 2026**. Production rendering uses the real current date.

## How to read this plan

Phase 8 is split into nine ordered sub-phases. The executable prompts in `.claude-steps/phase-8-redesign/` group those sub-phases into Steps 37–47; route migrations are grouped into three route-pair PRs by default. Sub-phases inside the same row of the dependency graph can run in parallel if you have multiple contributors.

```
8.1 Shell ──┬─► 8.5 Overview page ──► 8.6 Per-route migration ──► 8.7 Cleanup ──► 8.8 Tests ──► 8.9 Visual baseline
8.2 Primitives ─┤                                   ▲
8.3 Models + API ──► 8.4 Domain widgets ────────────┘
```

Estimated total with the step files as written: **11 PRs**, ~3,500 LOC net (after Phase 7 cleanup removes legacy). If every 8.6 route is split into its own PR, total becomes **14 PRs**.

---

## 8.1 — App shell (sidebar, topbar, right rail)

**Goal:** Replace the existing `Sidebar` + `Topbar` + `(dashboard)/layout.tsx` with the mockup's 3-column shell so every dashboard route inherits the new identity in one PR, before any per-page work.

**Files**

| Action | Path |
|---|---|
| Rewrite | `src/components/layout/sidebar.tsx` |
| Rewrite | `src/components/layout/topbar.tsx` |
| Rewrite | `src/components/layout/mobile-nav.tsx` (drawer using new tokens) |
| New | `src/components/layout/right-rail.tsx` (slot wrapper + responsive collapse) |
| New | `src/components/layout/app-shell.tsx` (3-column grid wrapper) |
| Rewrite | `src/app/(dashboard)/layout.tsx` (consume AppShell, accept Next parallel route `rail` slot) |
| New | `src/app/(dashboard)/@rail/default.tsx` (returns `null` for routes without rail content) |
| Update | `src/components/layout/nav-items.ts` (add `count` field for Leave; introduce `section: "main" \| "favorites"`) |

**Implementation details**

- Grid template per mockup: `grid-template-columns: 240px 1fr 320px;` for ≥1280px viewports.
- Sidebar: Frost background (`bg-[var(--color-curie-bg)]`), brand mark using `--font-curie-display`, `.nav-overline` overlines ("Main menu" / "Favorites"), active-state with left bar pseudo-element (`::before`, 3px Cobalt), `count` pill aligned right (`pill-count` for unread Leave count, generic mono digits for Employees `128`). Account block pinned to bottom with chevron icon — link to `/profile` for self.
- Topbar: 72px tall (vs current 52px), breadcrumb trail from pathname (`workspace / overview`) in `--font-curie-mono`, Cmd+K search pill (non-functional this PR, just visual), bell `IconBtn` with notification dot. Drop the page-title heading — greeting moves to page content.
- Right rail: 320px Frost background, left-border 1px `--color-curie-border`, sticky top, scrollable. Render only when the `rail` parallel-route slot returns content.
- Rail delivery uses a Next parallel route slot, not React context from page to layout. `(dashboard)/layout.tsx` accepts `{ children, rail }`, and `@rail/default.tsx` returns `null`. Route-specific rails live under `src/app/(dashboard)/@rail/...`.
- Responsive breakpoints (use Tailwind):
  - `<1280px`: rail collapses, content fills remaining width. Rail's contents render below `<main>` as a stacked section.
  - `<1024px`: sidebar collapses to icon-only rail (60px), labels hidden, account block hidden.
  - `<768px`: sidebar hidden entirely; `MobileNav` drawer slides over content. Hamburger lives in topbar.
- Responsive content rules:
  - KPI row: 4 columns at ≥1280px, 2 columns at 768–1279px, 1 column below 768px.
  - Two-column content grids collapse to one column below 1024px.
  - Page header actions wrap below the greeting below 768px.
  - Search pill collapses to an icon button below 768px.
- Use existing `nav-items.ts` entries; add `count: () => Promise<number>` server-resolved per item if we want live badges (out of scope this PR — render hard-coded `128` and `7` from queries in `(dashboard)/layout.tsx` and pass down).
- Interactive elements must be semantic from the first PR: sidebar items are `Link`s with `aria-current="page"` when active; icon controls are `button`s with accessible names; disabled search uses `aria-disabled="true"` and is not keyboard-focusable until search exists.

**Verify**

- Manual: load `/`, `/profile`, `/employees`, `/leave`, `/calendar`, `/settings` at 1440 / 1280 / 1024 / 768. Confirm shell renders, nothing within content area is broken.
- Playwright: extend `tests/e2e/flows/navigation.spec.ts` to assert presence of breadcrumb, search trigger, bell. Add a new spec `tests/e2e/flows/shell-responsive.spec.ts` that asserts grid template at three viewports.
- Visual: capture `test-results/phase-8.1/shell-{1440,1280,1024,768}.png` for each route.

**Dependencies:** Phase 0 only.
**PR size:** ~700 LOC. **Visible delta after merge:** the whole app changes identity.

---

## 8.2 — Primitive components (`src/components/curie/`)

**Goal:** Land the design-system primitives used by domain widgets in 8.4. They have no business logic, just visual + behavioral correctness.

**Files**

| Action | Path |
|---|---|
| New | `src/components/curie/avatar.tsx` (size variants xs/sm/md/lg, tint variants a–f, initials computation) |
| New | `src/components/curie/avatar-stack.tsx` (overlapping stack + `+N more`) |
| New | `src/components/curie/pill.tsx` (variants: `role`, `tag`, `count`, `status-pending`, `status-approved`, `status-rejected`, `status-info`) |
| New | `src/components/curie/sparkline.tsx` (props: `points: number[]`, `tone: "neutral" \| "brand"`, optional area gradient) |
| New | `src/components/curie/btn.tsx` (primary cobalt pill, secondary outline pill; sizes sm/md; icon-left support) |
| New | `src/components/curie/icon-btn.tsx` (36px circle, optional `dot` indicator) |
| New | `src/components/curie/icons.tsx` (exports the 20 inline SVG symbols from the mockup — `IHome`, `IUser`, `IUsers`, `ILeave`, `ICal`, `ISettings`, `IStar`, `IBell`, `ISearch`, `IPlus`, `IArrowUp`, `IArrowDown`, `IArrowRight`, `IChevronLeft`, `IChevronRight`, `IClock`, `IPin`, `IMeeting`, `IDoc`, `ICake`) |
| New | `src/components/curie/index.ts` (barrel re-export) |
| New | `src/components/curie/*.test.tsx` for each primitive |

**Implementation details**

- Avatar tint palette per mockup lines 525–530:
  ```
  a #DBE5F4 / #0B0F1A
  b #D2DAE8 / #1E293B
  c #E3E7F1 / #1E3A8A
  d #D8E2F0 / #1F2937
  e #DCE2EE / #1E3A8A
  f #D6DEEA / #1F2937
  ```
  Pick by hashing `firstName + lastName` to keep colors stable per person.
- Sparkline: pure SVG, no chart library. Compute `viewBox="0 0 100 28"`, map points to polyline coordinates. For `tone="brand"`, add `<defs><linearGradient id="spark-{uniqueId}" ...>` so multiple sparklines can coexist without ID collision.
- Pill `count` variant uses `--font-curie-mono` and Cobalt-soft background — Leave nav badge will be this exact variant.
- Btn primary: `bg-[var(--color-curie-brand)] hover:bg-[var(--color-curie-brand-hover)]`, white text, 40px tall pill. Secondary: white bg, `border border-[var(--color-curie-border)]`, Ink text.
- Icons are inline `<svg>` exports so they're tree-shakable; they all share `width=16 height=16 stroke=currentColor stroke-width=1.5 fill=none` defaults via a wrapper.

**Verify**

- Vitest unit + snapshot tests for each component (sizes, variants, hashed tint stability).
- Add `src/app/(dev)/curie-preview/page.tsx` (dev-only route, 404 in prod via env check) that mounts every primitive variant for visual review.

**Dependencies:** Phase 0 only.
**PR size:** ~1,100 LOC. **Visible delta:** none yet — primitives are unused.

---

## 8.3 — Prisma models, Zod schemas, API routes

**Goal:** Stand up the data backbone for the three new sections (Open roles, Onboarding, Notice board) plus the `Employee.startDate` field needed for accurate anniversaries.

**Migrations** (one file: `prisma/migrations/<timestamp>_phase-8-models/migration.sql`)

```
Announcement
  id            String   @id @default(cuid())
  authorId      String   @map("author_id")
  author        User     @relation(...)
  title         String
  body          String
  tag           AnnouncementTag  // enum: POLICY | TEAM | HR | EVENT
  createdAt     DateTime @default(now())
  @@map("announcements")

OnboardingPlan
  id            String   @id @default(cuid())
  employeeId    String   @unique
  employee      Employee @relation(...)
  startDate     DateTime
  status        OnboardingStatus  // enum: ON_TRACK | AT_RISK | BLOCKED | COMPLETE
  notes         String?
  steps         OnboardingStep[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@map("onboarding_plans")

OnboardingStep
  id            String   @id @default(cuid())
  planId        String
  plan          OnboardingPlan @relation(...)
  ord           Int       // 1..N
  label         String
  status        StepStatus  // enum: DONE | CURRENT | UPCOMING
  completedAt   DateTime?
  @@unique([planId, ord])
  @@map("onboarding_steps")

JobRequisition
  id            String   @id @default(cuid())
  title         String
  department    String
  location      String?
  status        JobStatus  // enum: OPEN | PAUSED | FILLED
  priority      Boolean   @default(false)  // backs the `priority` pill on Open roles KPI
  openedAt      DateTime  @default(now())
  filledAt      DateTime?
  filledById    String?   @unique
  @@index([status])
  @@map("job_requisitions")
```

Also add to `Employee`:
```
startDate     DateTime?   @map("start_date") @db.Date
```
Backfill SQL: `UPDATE employees SET start_date = MAKE_DATE(start_year, 1, 1) WHERE start_date IS NULL;` so anniversaries work immediately even without precise dates. Document that admins should edit the precise date going forward.

**Zod schemas**

| Action | Path |
|---|---|
| New | `src/lib/validations/announcement.ts` |
| New | `src/lib/validations/onboarding.ts` |
| New | `src/lib/validations/job-requisition.ts` |

Mirror the existing pattern (see `src/lib/validations/employment-type.ts` if present, or follow `auth.ts` shape).

**API routes** — all gated through `requireApiAuth()`:

| Method | Path | Role | Returns |
|---|---|---|---|
| GET | `/api/announcements?limit=N` | both | latest N, newest first |
| POST | `/api/announcements` | ADMIN | create |
| GET | `/api/onboarding/active` | both | active plan + steps for current employee if exists; admins see all active |
| POST | `/api/onboarding` | ADMIN | create plan for an employee |
| PATCH | `/api/onboarding/[id]/step/[stepId]` | ADMIN | mark step DONE/CURRENT/UPCOMING |
| GET | `/api/jobs?status=OPEN` | both | open requisitions; supports `?priority=true` |
| POST | `/api/jobs` | ADMIN | create |
| PATCH | `/api/jobs/[id]` | ADMIN | update (incl. fill) |

**Seed updates** (`prisma/seed.ts`)

- 3 announcements matching the mockup vibe (Policy, Team, HR tags).
- 1 active `OnboardingPlan` with 5 steps for any seeded employee.
- 7 `JobRequisition` rows with `status=OPEN`, two flagged `priority=true`.
- Update existing seeded employees: set `startDate` so the anniversary date is meaningful (one ~3 years ago in the next 14 days, matching the mockup's "Lina Okafor · 3 years").

**Verify**

- `npm run db:migrate` clean against a fresh DB.
- `npm run db:seed` populates the new tables.
- Vitest integration tests in `tests/integration/api/`:
  - `announcements.test.ts`, `onboarding.test.ts`, `jobs.test.ts`
  - Use the existing Testcontainers-backed test setup.
  - Cover: auth gating (employee cannot POST), Zod rejection of bad input, basic CRUD round-trip.

**Dependencies:** Phase 0.
**PR size:** ~900 LOC.
**Visible delta:** none in UI.

---

## 8.4 — Domain widgets

**Goal:** Build the data-aware components the overview page will compose. Each widget is a server component that takes typed props and renders pure markup using 8.2 primitives.

**Files** (all under `src/components/curie/`)

| Component | Source data | Notes |
|---|---|---|
| `kpi-card.tsx` | props only | Props: `label`, `value`, `unit?`, `pill?` (e.g. priority), `delta?: { dir, label }`, `footer: { kind: "sparkline", points, tone } \| { kind: "stack", avatars, trailing? } \| { kind: "text", text }` |
| `workforce-composition-donut.tsx` | `prisma.employee.groupBy({ by: ['employmentTypeId'] })` | Computes `stroke-dasharray` + cumulative `stroke-dashoffset` from group counts. Pure SVG donut centered with total in `--font-curie-display`. 4-slice palette: Ink / Slate `#64748B` / Ash `#CBD5E1` / Cobalt for the "Intern" slice (or smallest slice) so the brand color always has a visible presence |
| `time-off-this-week-card.tsx` | `LeaveRequest` overlapping Monday→Sunday of current week | Join `Employee` for name + position. Sort by `startDate` asc. Status pill maps `PENDING→pill-status-pending`, `APPROVED→pill-status-approved`, `REJECTED→pill-status-rejected`. Header shows total day count |
| `onboarding-tracker-card.tsx` | `OnboardingPlan` for the currently displayed person | Horizontal stepper (done/current/upcoming dot styles per mockup). Footer chips for any extra notes (Slack invite, VPN, etc.) — these come from a `tags String[]` we can add to `OnboardingPlan` in a follow-up; v1 omits the chip row if no tags |
| `notice-board-card.tsx` | `prisma.announcement.findMany({ take: 3, orderBy: { createdAt: 'desc' } })` | Unread dot on the most recent if `createdAt > sessionLastVisited` — for v1, always mark the most recent as unread. Author avatar uses tint from name hash |
| `mini-calendar.tsx` | events: `Date[]` (union of `Meeting.scheduledAt` and `LeaveRequest` ranges expanded per-day) | Week-starts-Monday. `has-event`, `today`, `selected`, `muted` cell states per mockup. Prev/next month nav is internal state for now (no URL sync). Day cells with selection are real `button`s, not clickable `div`s |
| `today-schedule-list.tsx` | `Meeting` where same calendar day, joined with participants | `.now` card detected when `start <= new Date() < end`. Avatar stack with `+N` more. Pill for meeting type ("Final", "Meet", "Room 4B" derived from `Meeting.notes` or location) |
| `coming-up-list.tsx` | `Employee` where birthday in next 14 days, OR `startDate` anniversary in next 14 days | Two rows max. Birthday uses `ICake` icon, anniversary uses `IStar` and label `N years`. Computation lives in `src/lib/coming-up.ts` (pure function, unit-tested) |
| `page-greeting.tsx` | props: `name`, `date` | Renders mockup line 876–882 markup: date overline + "Good morning, *Name*." in Fraunces, italic name |

**Implementation details**

- All eight widgets are server components by default. Mini-calendar can be client (`'use client'`) only because of prev/next nav state — accept that trade-off, keep its data fetching server-side via parent.
- Date math for `coming-up.ts` must handle Feb 29 birthdays (use March 1 in non-leap years) and the year-boundary case where today is Dec 28 and birthdays in Jan match. Cover both with unit tests.
- Donut math (`src/lib/donut.ts`):
  ```ts
  function computeSlices(counts: number[]): { dasharray: string; dashoffset: number; color: string }[]
  ```
  Returns dasharrays summing to 100 (using stroke-width 3 + r=15.9 from mockup). Unit test asserts sum equals 100 within rounding and offsets accumulate correctly.

**Verify**

- Vitest unit tests for `donut.ts`, `coming-up.ts`, and the "now" detection in `today-schedule-list`.
- Component tests via `@testing-library/react` that render with fixture data and assert pill classes + counts.
- `(dev)/curie-preview/page.tsx` from 8.2 expands to mount each widget with fixture data for visual review.

**Dependencies:** 8.2 (primitives), 8.3 (Prisma models for the data-backed ones).
**PR size:** ~1,400 LOC.
**Visible delta:** none in the live app — only the preview route.

---

## 8.5 — Rebuild `/` (overview page) to match mockup

**Goal:** First page that visibly matches the mockup at 1440×900.

**Files**

| Action | Path |
|---|---|
| Rewrite | `src/app/(dashboard)/page.tsx` |
| New | `src/app/(dashboard)/page.queries.ts` (Promise.all data fetch, returns typed view-model) |
| New | `src/app/(dashboard)/@rail/page.tsx` (overview rail content for `/`) |

**Implementation details**

- Two code paths: `AdminOverview` and `EmployeeOverview`, mirroring the current split.
- Admin composition matches mockup:
  ```
  <PageGreeting name={firstName} date={today} />
  <Actions>
    <Btn variant="secondary" icon={IDoc}>Export report</Btn>
    <Btn variant="primary" icon={IPlus}>New request</Btn>
  </Actions>
  <KpiRow>
    <KpiCard label="Headcount" value={hc} delta={...} footer={sparkline}/>
    <KpiCard label="Open roles" pill={priority} value={open} delta={...} footer={brandSparkline}/>
    <KpiCard label="On leave today" value={onLeave} footer={avatarStack}/>
    <KpiCard label="Pending approvals" value={pending} unit={`/${pendingTotal}`} delta={...} footer={sparkline}/>
  </KpiRow>
  <Grid2>
    <WorkforceCompositionDonut counts={...}/>
    <TimeOffThisWeekCard items={...}/>
  </Grid2>
  <Grid2>
    <OnboardingTrackerCard plan={...}/>
    <NoticeBoardCard announcements={...}/>
  </Grid2>
  ```
- Right rail provided by the `@rail` parallel route for `/`:
  ```
  // src/app/(dashboard)/@rail/page.tsx
  <>
    <MiniCalendar events={calendarEvents} selected={today}/>
    <TodayScheduleList items={todayMeetings}/>
    <ComingUpList items={comingUp}/>
  </>
  ```
- `page.queries.ts` exports shared helpers so `page.tsx` and `@rail/page.tsx` can use the same date window and data-shaping logic without a page-to-layout context bridge.
- All data in one `Promise.all` in `page.queries.ts` to keep TTFB tight. The function takes a session and returns the full typed view-model so the JSX is pure markup.
- Sparkline series for KPIs: pull last 8 weeks of `Employee` counts via `groupBy` on `createdAt::date` for headcount; pending approvals series from `LeaveRequest.updatedAt` daily counts for last 7 days.
- Employee composition (simpler):
  ```
  <PageGreeting name={firstName} date={today}/>
  <QuickActions> (Leave request / Calendar / Profile)
  <Grid2>
    <MyLeaveCard/>
    <UpcomingMeetingsCard/>
  </Grid2>
  // employee rail route uses the same @rail slot for the matching route
  <>
    <MiniCalendar events={myEvents}/>
    <TodayScheduleList items={myToday}/>
  </>
  ```
- Tests that compare against `design/overview-mockup.html` freeze browser time to `2026-05-26T09:35:00` so the greeting, calendar, schedule "Now" state, birthdays, and anniversaries are deterministic. Non-visual tests can use real time.

**Verify**

- Playwright: extend `tests/e2e/flows/phase-0-redesign.spec.ts` (or add `phase-8-overview.spec.ts`):
  - Assert presence of KPI labels: `Headcount`, `Open roles`, `On leave today`, `Pending approvals`.
  - Assert the donut SVG renders four slices with combined dasharray ≈ 100.
  - Assert the right-rail mini-calendar shows today highlighted.
  - Capture `test-results/phase-8.5/overview-{admin,employee}-1440.png` for diff.
- Visual diff: open mockup side-by-side at 1440px, eyeball drift on spacing.

**Dependencies:** 8.1 (shell), 8.4 (widgets).
**PR size:** ~500 LOC.
**Visible delta:** `/` matches the mockup.

---

## 8.6 — Per-route migration to new tokens + shell

**Goal:** Bring every remaining route under the new design language. No more Apple-styled screens.

Run as **3 route-pair PRs by default** (matching Steps 42–44). If multiple contributors are available, these can be split into **6 parallel route PRs** because the route folders are mostly independent. Each PR follows the same template:

1. Replace hard-coded `#F2F2F7`, `#007AFF`, `#1D1D1F` etc. with `var(--color-curie-*)` equivalents.
2. Replace `font-bold`/`font-semibold` headings with `font-[var(--font-curie-display)] font-medium` per Fraunces character.
3. Wrap content cards in the standard card recipe: `bg-[var(--color-curie-surface)] rounded-[var(--radius-curie-lg)] p-6`.
4. Replace local pills/badges with `<Pill variant="…">` from 8.2.
5. Replace icon-bearing buttons with `<Btn>` / `<IconBtn>` primitives.
6. Adjust spacing to mockup's 16/24/32 rhythm.
7. Drop `glass`/`glass-heavy`/`glass-subtle` utility usage — the redesign is opaque-surface, not Liquid Glass.

| PR | Route(s) | Files (approx) | Notable |
|---|---|---|---|
| 8.6.a + 8.6.b / Step 42 | `/login`, `/profile` | `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/*`, `src/app/(dashboard)/profile/page.tsx`, `src/components/shared/detail-field.tsx`, `src/app/(dashboard)/@rail/profile/page.tsx` | Login gets Frost centered card; profile detail-field becomes label+value; admin "Edit" uses `<Btn variant="primary">`; profile rail renders through the `@rail` slot |
| 8.6.c + 8.6.d / Step 43 | `/employees`, `/leave` | `src/app/(dashboard)/employees/*`, `src/app/(dashboard)/leave/*` | Employee tables/forms use Curie cards, avatars, role pills, and buttons. Leave request/history/manage pages use Curie forms, tables, and status pills |
| 8.6.e + 8.6.f / Step 44 | `/calendar`, `/settings` | `src/app/(dashboard)/calendar/*`, `src/components/calendar/*`, `src/app/(dashboard)/settings/*` | Full-size calendar adopts mini-calendar vocabulary; settings lists/dialogs use Curie cards/buttons |

**Verify (per PR)**

- Existing Playwright specs continue to pass (text + selector assertions are token-agnostic).
- New visual snapshot: `test-results/phase-8.6.X/<route>-1440.png`.
- No reference to `#F2F2F7`, `#007AFF`, `apple-*` color class, or `glass*` class remains in the migrated file (grep gate added to CI in 8.8).

**Dependencies:** 8.1, 8.2. Route-pair PRs are independent of each other except for shared component imports.
**PR size:** ~200–400 LOC each.
**Visible delta:** every route now matches the redesign system; only legacy cleanup remains.

---

## 8.7 — Cleanup of legacy tokens and dead utilities

**Goal:** Strip Apple HIG remnants now that every page has migrated. Keeps `globals.css` tight and removes confusion for future contributors.

**Steps**

1. Grep for any remaining `apple-*` Tailwind class or `--color-apple-*` var reference. Migrate any holdouts (Phase 8.6 should have caught all; this is the safety net).
2. Delete from `src/app/globals.css`:
   - Entire `Apple System Colors`, `Apple Dark Mode System Colors`, `Apple System Grays`, `Apple Dark Mode Grays` blocks
   - `Semantic Surface Colors`, `Semantic Label Colors`, `Semantic Separator Colors`, `Semantic Fill Colors`
   - `Apple HIG Typography Scale` (eleven `--font-size-apple-*` triplets)
   - `Apple Border Radius`
   - `Apple Layered Shadows`
   - `Apple Spacing`
   - `Apple Easing Curves`
   - `Apple Backdrop Blur`
   - All `.glass`, `.glass-heavy`, `.glass-subtle`, `.glass-button`, `.glass-overlay` rules in `@layer components`
3. Keep `--color-curie-*`, `--font-curie-*`, `--radius-curie-*`, and `--shadow-curie-*` as the canonical application tokens. Do not rename them to unprefixed aliases in this phase; avoiding a second repo-wide rename keeps the migration reviewable.
4. Delete `apple-design-system.md` and `DESIGN_SYSTEM.md` (root). Replace with `docs/design-system.md` describing the new Cobalt/Frost/Ink + Fraunces/General Sans system, derived from the mockup. Use the mockup's CSS as the visual reference, but document the namespaced implementation tokens.
5. Update `CLAUDE.md` references from "Apple HIG-aligned design system" to "Cobalt/Frost design system".
6. Remove `next-themes` if dark mode isn't planned for v1 (the mockup is light-only). Keep `.dark` class hooks if a future dark mode is on the roadmap — document the decision.

**Verify**

- `npm run build` green.
- `npm run lint` green.
- Repo-wide grep: zero matches for `apple-blue`, `apple-green`, `apple-orange`, `glass-`, `--color-apple-`, `--font-size-apple-`, `--radius-apple-`, `--shadow-apple-`.
- All existing tests still green.

**Dependencies:** 8.6 (all routes migrated).
**PR size:** ~−800 LOC (net removal).
**Visible delta:** none — purely internal.

---

## 8.8 — Test coverage, accessibility, responsive audit

**Goal:** Lock the redesign behind tests so it can't regress, and confirm a11y + responsive promises hold.

**Steps**

1. **Coverage gate** — bring overall coverage back to ≥80% per `.claude/rules/common/testing.md`:
   - Add unit tests for `donut.ts`, `coming-up.ts`, `name-hash.ts` (avatar tint), date-window utilities.
   - Add `@testing-library/react` tests for each primitive in 8.2 and each widget in 8.4.
   - Verify with `npm run test:coverage`.
2. **Token regression grep** — add a CI script `scripts/check-legacy-tokens.sh`:
   ```sh
   #!/bin/sh
   PATTERN='apple-(blue|green|orange|red|indigo|purple|pink|teal|yellow)|--color-apple-|--font-size-apple-|--radius-apple-|--shadow-apple-|glass-(heavy|subtle|button|overlay)\b|glass\b|--color-bg|--color-surface|--color-fg'
   if rg -q -e "$PATTERN" src/ ; then
     echo "Legacy Apple/glass token found — see Phase 8.7"
     exit 1
   fi
   ```
   Wire into `package.json` scripts as `lint:tokens` and run in CI alongside `lint`.
3. **Accessibility** — add Playwright + axe-core run:
   - `npm i -D @axe-core/playwright`
   - `tests/e2e/flows/a11y.spec.ts`: for `/`, `/profile`, `/employees`, `/leave`, `/calendar`, `/settings`, run `await new AxeBuilder({ page }).analyze()` and assert `violations` is empty for serious/critical.
   - Manually verify focus-ring on every interactive element (sidebar nav, search trigger, bell, KpiCard if clickable, MiniCalendar day cells, schedule cards).
   - Confirm Cobalt-on-Frost contrast for buttons (4.5:1 minimum) — already passes per WCAG calculators, document in `docs/design-system.md`.
4. **Responsive audit** — Playwright spec `responsive.spec.ts`:
   - For each protected route, visit at viewports `[1440, 1280, 1024, 768, 390]`.
   - Assert no horizontal scrollbar (`page.evaluate(() => document.body.scrollWidth <= window.innerWidth)`).
   - Capture screenshots into `test-results/responsive/<route>-<w>.png` for manual review.
5. **Reduced-motion** — verify the `@media (prefers-reduced-motion: reduce)` block in `globals.css` still applies. Add a Playwright spec that sets `media: { reducedMotion: 'reduce' }` and asserts a CSS animation is disabled on a known element.

**Verify**

- `npm run test:coverage` ≥ 80%.
- `npm run lint && npm run lint:tokens` exit 0.
- Playwright suite (chromium + firefox + mobile-chrome projects) passes.
- `test-results/responsive/` reviewed manually, no obvious overflow/clipping.

**Dependencies:** 8.7.
**PR size:** ~700 LOC tests + ~50 LOC scripts.
**Visible delta:** none in app; visible in CI.

---

## 8.9 — Visual baseline capture + sign-off

**Goal:** Establish a permanent visual baseline of the redesigned app, side-by-side with the mockup, for future regression diffing.

**Steps**

1. With everything merged, run `npx playwright test --project=chromium` once on a clean main branch checkout.
2. Copy `test-results/phase-8.5/overview-admin-1440.png` and `test-results/phase-8.6.*/*-1440.png` into `docs/redesign-baseline/`.
3. Open `design/overview-mockup.html` in a headless Chromium at 1440×900, screenshot, save as `docs/redesign-baseline/_mockup-reference-1440.png`.
4. Create `docs/redesign-baseline/README.md` table that pairs each route's baseline screenshot with the mockup, plus the commit SHA the baseline was captured at. This becomes the regression-diff input for future PRs (manual or via `pixelmatch` in CI).
5. Bump version in `package.json` to mark the redesign release (e.g., `0.2.0`).
6. Tag the commit: `git tag -a redesign-v1 -m "HR Curie redesign — Cobalt/Frost/Fraunces"`.
7. Update `CLAUDE.md` "Project Overview" section to remove the "blueprint-stage project" language and link to `docs/design-system.md` + `docs/redesign-baseline/README.md`.

**Verify**

- Manual diff of each baseline vs mockup; document any intentional deltas (e.g., synthetic data substituted by real data — the Mei Tanaka onboarding becomes whoever the live onboarding plan points to).

**Dependencies:** 8.8.
**PR size:** ~150 LOC docs + screenshots.
**Visible delta:** none in app; new docs in repo.

---

## Cross-cutting risks and mitigations

| Risk | Where it bites | Mitigation |
|---|---|---|
| Right rail steals horizontal room on 1280–1366 laptops, content feels cramped | 8.1 | Cap rail at 320px and shrink to 280px at 1280–1366. Move rail below content at <1280px as already specified |
| Static mockup has fixed viewport width and overflows below desktop sizes | 8.1, 8.5, 8.8 | Treat `design/overview-mockup.html` as a 1440px desktop reference only. Implement explicit responsive rules for KPI/grid/header/search/rail and assert no horizontal overflow at 1024, 768, and 390 |
| Page-to-layout rail content is implemented with React context and fails under server layouts | 8.1, 8.5 | Use Next parallel route slots: `(dashboard)/layout.tsx` accepts `rail`, `@rail/default.tsx` returns null, and route-specific rail pages render the content |
| Fraunces FOUT on slow connections shows fallback serif first | 8.5 | `next/font/google` already inlines `font-display: swap` + size-adjust to minimize CLS. Verify in Lighthouse |
| Fontshare CDN outage breaks General Sans | 8.1 onward | `--font-curie-sans` falls back to system-ui chain. Document a contingency to self-host via `next/font/local` if the CDN ever flaps in production |
| Donut math off by one degree | 8.4 | Pure-function unit test asserts sum = 100 and offsets accumulate correctly |
| New Prisma models cause migration drift between dev DBs | 8.3 | Single migration file generated by `prisma migrate dev`. Document `npm run db:reset` recovery path |
| Per-route PRs in 8.6 race on `globals.css` | 8.6 | 8.6 PRs touch route files only; `globals.css` is frozen between 8.1 and 8.7 |
| Existing Playwright specs assert hard-coded text that's no longer rendered (e.g., "Dashboard" heading) | 8.1, 8.5 | Audit `tests/e2e/flows/*.spec.ts` for hard-coded titles in the 8.1 PR; update in-place rather than letting them fail later |
| Visual tests drift because the real date differs from the static mockup date | 8.5, 8.9 | Freeze visual test time to `2026-05-26T09:35:00`; production code still renders real dates |
| Employee `startDate` backfill defaults to Jan 1 — anniversary list shows everyone's anniversary on Jan 1 | 8.3 | Backfill is fine for v1 (rail shows two upcoming; Jan-1 ties won't all surface). Add an admin tooltip on `/employees/[id]` prompting precise date entry |
| The mockup's "Search people, leave, meetings…" Cmd+K is non-functional in 8.1 — risks user confusion | 8.1 | Render it as a disabled-looking pill (no focus ring); add `aria-disabled="true"`. Real implementation tracked as Phase 9 |
| Notice board "unread" semantics need persistence | 8.4 | v1 marks only the most recent announcement as unread. Real per-user unread state tracked in Phase 9 (`AnnouncementRead` join table) |

---

## What Phase 8 explicitly does NOT do

- Cmd+K search — visible pill, no behavior. Phase 9.
- Per-user notification preferences. Phase 9.
- Dark mode. The mockup is light-only. Decision deferred.
- E2E tests for the new API routes (covered by integration tests in 8.3).
- Animations beyond what the primitives ship with (no scroll-driven, no Liquid Glass effects).
- Internationalization. Strings stay in English; i18n is Phase 10.

---

## Suggested execution order

1. Land 8.1 and 8.2 in parallel (different file trees, no conflicts).
2. Land 8.3 (models) — blocking for 8.4.
3. Land 8.4 (widgets) — blocking for 8.5.
4. Land 8.5 (overview page).
5. Open Steps 42–44 in parallel, or split them into six per-route PRs if staffing makes that useful.
6. Once all 8.6.* merge, land 8.7 (cleanup) — must be last so the grep gate isn't tripped early.
7. Land 8.8 (tests) — adds the grep gate that protects future PRs.
8. Land 8.9 (baseline + tag).

Total wall-clock with one engineer: ~10–14 working days. With two engineers running 8.1+8.2 then splitting or pairing 8.6.* across them: ~6–8 days.
