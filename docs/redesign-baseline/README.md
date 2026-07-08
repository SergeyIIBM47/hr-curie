# Redesign Visual Baseline (redesign-v1)

Permanent visual baseline for the HR Curie redesign (Cobalt/Frost palette,
Fraunces + General Sans). Captured at commit `04f64f1` against the seeded
dev database, viewport 1440×900, with the overview clock frozen to
`2026-05-26T09:35:00Z` for mockup parity. This directory is the
regression-diff input for future PRs that touch styling or layout.

## Baseline → mockup mapping

`_mockup-reference.png` is `design/overview-mockup.html` captured at
1440×900. It is a **1440px desktop reference for the overview only** —
all other routes and the responsive behavior are judged against the
Phase 8 responsive rules (see `tests/e2e/flows/responsive.spec.ts`).

| Baseline | Route | Mockup section it implements |
|---|---|---|
| `overview-admin.png` | `/` (admin) | Entire mockup: app shell (sidebar / topbar / right rail), greeting, KPI row, workforce donut, time-off card, onboarding tracker, notice board, mini calendar |
| `overview-employee.png` | `/` (employee) | Shell + greeting + quick-action cards (mockup shows the admin view; employee view reuses its vocabulary) |
| `login.png` | `/login` | Design-system application only (no mockup section) |
| `profile.png` | `/profile` | Shell + card/pill/avatar vocabulary |
| `employees.png` | `/employees` | Shell + table vocabulary (header mono-caps, avatar cells, role pills) |
| `leave.png` | `/leave` | Shell + status-pill vocabulary |
| `calendar.png` | `/calendar` | Shell + month grid + schedule-card vocabulary (mirrors the mini calendar) |
| `settings.png` | `/settings` | Shell + form/card vocabulary |

## Intentional deltas from the mockup

- **Real seeded data replaces synthetic mockup data.** Headcount is 6 (not
  128); the onboarding card tracks Kai Nguyen (the live `OnboardingPlan`),
  not Mei Tanaka; notices, names, and counts come from `prisma/seed.ts`.
- **WCAG AA color adjustments (step 46).** `--color-curie-fg-muted` is
  `#636F82` (mockup used `#9AA3B2`, 2.6:1); success/warning/danger/info
  text tokens are one shade darker than the mockup values. See
  `docs/design-system.md`.
- **Desktop sign-out button** in the topbar next to the bell — the mockup
  has no sign-out affordance, but the app needs one outside the mobile
  drawer.
- **Workforce donut slice labels** use the seeded employment types
  (CY / GIG / Contractor / Intern), not the mockup's full-time/contract/
  part-time/intern captions.

## Regenerating the baseline

```bash
# 1. Server with the frozen overview clock
OVERVIEW_FREEZE_DATE=2026-05-26T09:35:00.000Z npm run dev

# 2. Regenerate the screenshot set
npx playwright test --project=chromium phase-8-overview responsive.spec

# 3. Copy into this directory
cp test-results/phase-8.5/overview-admin-1440.png    docs/redesign-baseline/overview-admin.png
cp test-results/phase-8.5/overview-employee-1440.png docs/redesign-baseline/overview-employee.png
for r in profile employees leave calendar settings; do
  cp "test-results/responsive/$r-1440.png" "docs/redesign-baseline/$r.png"
done

# 4. Login page + mockup reference
npx playwright screenshot --viewport-size 1440,900 --full-page \
  http://localhost:3000/login docs/redesign-baseline/login.png
npx playwright screenshot --viewport-size 1440,900 --full-page \
  design/overview-mockup.html docs/redesign-baseline/_mockup-reference.png
```

The dev database must contain only the seeded rows (5 seeded employees +
the e2e `Test Employee`); repeated e2e runs add `create-*@company.com`
rows that inflate the headcount — clean them before recapturing.
