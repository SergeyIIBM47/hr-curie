# Phase 8 Redesign — Verification & Completion Checklist (2026-07-08)

Verified against the step specs in `.claude-steps/phase-8-redesign/` by inspecting
the codebase, git history, and test suite.

## Status Summary

| Step | Title | Status | Evidence |
|------|-------|--------|----------|
| 37 | App shell (3-column grid, sidebar, topbar, rail) | ✅ DONE | commit `3cf3525`; app-shell.tsx, right-rail.tsx, @rail/default.tsx all present |
| 38 | Curie primitives (Avatar, Pill, Sparkline, Btn, IconBtn, Icons) | ✅ DONE | no own commit — backfilled into `4903fbb`; all 10 primitives + 7 test files + curie-preview page |
| 39 | Data models (Announcement, OnboardingPlan, JobRequisition) | ✅ DONE | commit `b57ff31`; models, 8 API routes, Zod schemas, seed, 3 integration test files |
| 40 | Domain widgets (KPI, Donut, TimeOff, Onboarding, Notice, MiniCalendar, Schedule, ComingUp, Greeting) | ✅ DONE | commit `4903fbb`; all 9 widgets + coming-up.ts with tests |
| 41 | Overview page rebuild | ✅ DONE | page.tsx / page.queries.ts / @rail/page.tsx implemented; e2e spec committed in `5adb462` |
| 42 | Migrate /login + /profile | ✅ DONE | commit `bc82d52`; spot-checked, Curie tokens only |
| 43 | Migrate /employees + /leave | ✅ DONE | commit `da9b060`; spot-checked, Curie tokens only |
| 44 | Migrate /calendar + /settings | ✅ DONE | commit `a3da28f`; spot-checked, Curie tokens only |
| 45 | Cleanup legacy Apple tokens + glass utilities | ✅ DONE | commit `5039be1`; globals.css 444→234 lines, docs swapped, next-themes kept for Phase 9 |
| 46 | Tests + a11y + responsive + CI gate | ✅ DONE | 2026-07-09: coverage ≥80% all metrics, a11y/responsive/reduced-motion specs, token gate, amplify.yml gates |
| 47 | Visual baseline + release tag | ✅ DONE | 2026-07-09: `docs/redesign-baseline/` (9 PNGs + README), version 0.2.0, `redesign-v1` tag |

Good news from verification: **zero** references to Apple tokens or `.glass` utilities
remain in `src/` application code — step 45 is pure deletion plus docs, low risk.

## Checklist to Complete the Phase

### Step 41 — close out (5 min)
- [x] `git add tests/e2e/flows/phase-8-overview.spec.ts` and commit (spec's own commit template expects this file; it currently exists only untracked) — done in `5adb462`

### Step 45 — cleanup legacy (≈1 hr) — DONE in `5039be1`
- [x] Delete Apple token blocks from `src/app/globals.css` (97 declarations)
- [x] Delete Liquid Glass utility classes from `src/app/globals.css` (`.glass*` + `.dark` variants)
- [x] Delete root files `apple-design-system.md` and `DESIGN_SYSTEM.md`
- [x] Create `docs/design-system.md` (Cobalt/Frost/Ink palette, Fraunces + General Sans pairing, spacing/radius/shadow scales, Pill/Avatar/Button vocabularies, pointer to `design/overview-mockup.html`)
- [x] Update `CLAUDE.md`: "Apple HIG design system" → "Cobalt/Frost design system"; repoint the `apple-design-system.md` reference to `docs/design-system.md`
- [x] Decide on `next-themes`: KEPT as Phase 9 dark-mode dependency (only consumer: `src/components/ui/sonner.tsx`), documented in `docs/design-system.md`
- [x] Verify: `npm run build` green, `npm run lint` 0 errors, legacy-identifier grep returns 0 matches in `src/`, e2e introduces NO regressions — see note below

> **⚠️ Pre-existing e2e failures (NOT caused by step 45 — verified by running the same
> specs on stashed baseline HEAD: identical 8 failures).** Chromium suite: 64 passed,
> 8 failed both before and after the cleanup:
> `phase-8-overview.spec.ts` (2: donut expects 4 employment-type slices, but seed
> creates only 3 types with ALL employees in "CY" → 1 slice; spec can never pass
> against the current seed), `employee-list.spec.ts` (3), `employee-profile.spec.ts`
> (1, expects initials "SA"), `login.spec.ts` logout (1, Sign out not visible),
> `capture-user-guide.spec.ts` (1). DB also drifted from seed (6 employees vs 3
> seeded). Fix belongs in step 46: align seed with spec expectations (4 employment
> types with spread) or fix specs, and re-baseline.

### Step 46 — tests, a11y, responsive, CI gate — DONE 2026-07-09
- [x] Fixed the 8 pre-existing e2e failures: seed now creates 4 employment types
      (CY/GIG/Contractor/Intern) with employees spread across them (donut = 4 slices);
      stale locators updated for the Curie markup (table columns, mobile cards,
      `data-curie="avatar"`, page-greeting instead of "Dashboard" heading,
      quick-actions scoping, `:visible` mini-calendar)
- [x] **Restored desktop sign-out** — the step-37 shell rebuild dropped it; it now
      lives in the topbar next to the bell (`aria-label="Sign out"`, md+ only,
      mobile keeps the drawer button)
- [x] Component tests for kpi-card + mini-calendar AND the 7 other untested
      widgets/components (notice-board, onboarding-tracker, today-schedule,
      coming-up-list, time-off, donut, page-greeting, meeting-card, right-rail,
      app-shell) plus `page.queries.ts` (mocked prisma) and the 3 redesign Zod
      schema modules — coverage was actually ~51%, now ≥80% on all four metrics
      (stmts 84.7 / branch 81.9 / funcs 81.5 / lines 85.8)
- [x] `@axe-core/playwright` + `tests/e2e/flows/a11y.spec.ts` (6 routes, no
      serious/critical; semantic checks: aria-current, icon-button names,
      day-cell buttons, aria-disabled search, keyboard focus ring)
- [x] WCAG AA token fixes (documented in `docs/design-system.md`): fg-muted
      `#9AA3B2→#636F82`; success/warning/danger/info darkened one shade;
      focus ring `#007AFF` (Apple leftover) → `var(--color-curie-brand)`;
      notice unread dot got `role="img"`
- [x] `tests/e2e/flows/responsive.spec.ts` (6 routes × 5 viewports, no h-scroll,
      KPI 4→2→1, Grid2 collapse, screenshots) + `reduced-motion.spec.ts`
- [x] `scripts/check-legacy-tokens.sh` (rg with grep fallback) + `lint:tokens`
- [x] amplify.yml preBuild gates: lint, lint:tokens, unit tests + coverage —
      placed before `prisma migrate deploy`; integration/e2e excluded there
      (need disposable DB + browsers)
- [x] Desktop-only specs guarded with `test.skip(isMobile)` for the
      mobile-chrome project; firefox browser installed (had never run)

> **Known flake (environment, not app):** firefox against `next dev` on a busy
> machine intermittently starves the `load` event / re-commits pages, failing
> 1-3 random tests per full run — each passes in isolation and on retry
> (`retries: 1` now set). chromium 72/72 and mobile-chrome 68/68 are
> consistently green.

### Step 47 — baseline + release — DONE 2026-07-09
- [x] Chromium suite run with `OVERVIEW_FREEZE_DATE=2026-05-26T09:35:00.000Z`
      (92/92 green) to regenerate the screenshot set; e2e-generated
      `create-*@company.com` rows purged first so the baseline shows the
      clean seed (6 employees, 4-slice donut)
- [x] `docs/redesign-baseline/`: overview-admin/employee + 6 route PNGs +
      `login.png`, `_mockup-reference.png` (mockup at 1440×900), README with
      the baseline→mockup mapping, capture SHA, intentional deltas, and
      regeneration steps
- [x] `package.json` version 0.1.0 → 0.2.0
- [x] `CLAUDE.md` Project Overview de-blueprinted; links `docs/design-system.md`
      (canonical design source) and `docs/redesign-baseline/README.md`
      (visual regression baseline)
- [x] `git tag -a redesign-v1` — NOTE: tag push blocked by the known 403
      (machine authenticated as `svolokh-tech`, no write access to
      `SergeyIIBM47/hr-curie`); push once access is fixed

### Suggested order
41-closeout → 45 → 46 → 47 (46's token gate needs 45's cleanup; 47's baselines need 46's specs).
