# Step 47 — Visual Baseline + Release Tag

> Phase 8.9 — see `docs/phase-8-redesign-plan.md` §8.9. Final step of the
> redesign.

## Prompt for Claude Code

```
Establish a permanent visual baseline for the redesigned app.

1. On a clean main branch, run:
     npx playwright test --project=chromium
   so all Phase 8 screenshots regenerate.
   Freeze visual capture time to 2026-05-26T09:35:00 for mockup parity.

2. Copy baselines into docs/redesign-baseline/:
   - test-results/phase-8.5/overview-admin-1440.png       → overview-admin.png
   - test-results/phase-8.5/overview-employee-1440.png    → overview-employee.png
   - test-results/responsive/login-1440.png               → login.png
   - test-results/responsive/profile-1440.png             → profile.png
   - test-results/responsive/employees-1440.png           → employees.png
   - test-results/responsive/leave-1440.png               → leave.png
   - test-results/responsive/calendar-1440.png            → calendar.png
   - test-results/responsive/settings-1440.png            → settings.png

3. Capture the mockup reference at 1440×900 using headless chromium:
     npx playwright screenshot --viewport-size 1440,900 --full-page \
      design/overview-mockup.html docs/redesign-baseline/_mockup-reference.png
   Treat design/overview-mockup.html as a 1440px desktop reference only;
   responsive baselines are judged against the Phase 8 responsive rules.

4. Create docs/redesign-baseline/README.md with a table pairing each baseline
   screenshot to the mockup section it implements, plus the commit SHA the
   baseline was captured at. This is the regression-diff input for future PRs.

5. Bump package.json version to 0.2.0 (redesign release).

6. Tag the commit:
     git tag -a redesign-v1 -m "HR Curie redesign — Cobalt/Frost + Fraunces/General Sans"

7. Update CLAUDE.md "Project Overview":
   - Remove "blueprint-stage project" language (it's no longer a blueprint).
   - Link docs/design-system.md as the canonical implementation design source.
   - Link docs/redesign-baseline/README.md as the visual regression baseline.

Document any intentional deltas from the mockup in the baseline README
(e.g., synthetic data substituted by real seeded data — Mei Tanaka's
onboarding becomes whoever the live OnboardingPlan points to).
```

## Test
- Manually diff each baseline screenshot against the mockup reference.
- Verify `git tag -l redesign-v1` returns the tag.

## Commit
```bash
git add docs/redesign-baseline package.json package-lock.json CLAUDE.md && \
  git commit -m "step-47: redesign v1 — visual baseline + release tag"
git tag -a redesign-v1 -m "HR Curie redesign — Cobalt/Frost + Fraunces/General Sans"
```
