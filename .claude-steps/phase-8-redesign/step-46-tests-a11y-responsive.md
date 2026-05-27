# Step 46 — Test Coverage, A11y, Responsive Audit

> Phase 8.8 — see `docs/phase-8-redesign-plan.md` §8.8.

## Prompt for Claude Code

```
Lock the redesign behind tests + CI gates.

1. Coverage to ≥80% per .claude/rules/common/testing.md:
   - Add unit tests for src/lib/donut.ts, src/lib/coming-up.ts,
     src/lib/name-hash.ts, week-boundary helpers in page.queries.ts.
   - Add @testing-library/react tests for each Step 38 primitive and each
     Step 40 widget (render with fixture data, assert key markup + classes).
   - Verify with `npm run test:coverage` ≥ 80%.

2. Legacy-token CI gate — create scripts/check-legacy-tokens.sh:
     #!/bin/sh
     set -e
     PATTERN='apple-(blue|green|orange|red|indigo|purple|pink|teal|yellow)|--color-apple-|--font-size-apple-|--radius-apple-|--shadow-apple-|glass-(heavy|subtle|button|overlay)\b|glass\b|--color-bg|--color-surface|--color-fg'
     if rg -q -e "$PATTERN" src/ ; then
       echo "Legacy Apple/glass token found — see Phase 8.7"
       rg -n -e "$PATTERN" src/
       exit 1
     fi
   Make executable: chmod +x scripts/check-legacy-tokens.sh.
   Add to package.json scripts: "lint:tokens": "./scripts/check-legacy-tokens.sh".
   Wire into CI alongside existing lint.

3. Accessibility — Playwright + axe:
   - npm i -D @axe-core/playwright
   - tests/e2e/flows/a11y.spec.ts: for /, /profile, /employees, /leave,
     /calendar, /settings, run `await new AxeBuilder({page}).analyze()`
     and assert no serious/critical violations.
   - Manually verify focus-ring on sidebar nav, search trigger, bell,
     KpiCard (if clickable), MiniCalendar day cells, schedule cards.
   - Assert semantic redesign controls:
       sidebar links use aria-current on active route
       icon buttons have accessible names
       mini-calendar selectable days are buttons
       disabled search uses aria-disabled and is not focusable

4. Responsive audit — tests/e2e/flows/responsive.spec.ts:
   - For each protected route, visit at viewports [1440, 1280, 1024, 768, 390].
   - Assert no horizontal scrollbar:
       await page.evaluate(() => document.body.scrollWidth <= window.innerWidth)
   - Capture test-results/responsive/<route>-<w>.png.
   - Confirm KPI row is 4→2→1 columns and Grid2 collapses below 1024px.

5. Reduced motion — verify @media (prefers-reduced-motion: reduce) block in
   globals.css still applies. Add a Playwright spec that sets
   `media: { reducedMotion: 'reduce' }` and asserts a CSS animation is
   disabled on a known animated element.

6. Visual-date helper:
   - Freeze visual parity specs to 2026-05-26T09:35:00 so the static mockup,
     overview screenshots, calendar highlight, "Now" schedule state,
     birthdays, and anniversaries stay deterministic.
   - Keep production code using real current dates.

CI integration:
   - Update CI workflow (or local equivalent) to run, in order:
       npm run lint
       npm run lint:tokens
       npm run test:run
       npm run test:coverage
       npm run test:e2e
```

## Test
- `npm run lint && npm run lint:tokens` exits 0.
- `npm run test:coverage` ≥ 80%.
- `npm run test:e2e` (chromium + firefox + mobile-chrome) green.
- Manual review of test-results/responsive/.

## Commit
```bash
git add scripts/check-legacy-tokens.sh package.json tests/e2e/flows && \
  git commit -m "step-46: redesign test coverage + a11y + responsive gates"
```
