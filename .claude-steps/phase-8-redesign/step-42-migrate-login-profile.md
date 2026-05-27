# Step 42 — Migrate /login + /profile to New Tokens

> Phase 8.6.a + 8.6.b — see `docs/phase-8-redesign-plan.md` §8.6.

## Prompt for Claude Code

```
Migrate /login and /profile from Apple tokens to Cobalt/Frost. Per-route
template (same for both):

1. Replace hard-coded #F2F2F7, #007AFF, #1D1D1F, etc. with var(--color-curie-*).
2. Headings → font-[var(--font-curie-display)] font-medium.
3. Cards → bg-[var(--color-curie-surface)] rounded-[var(--radius-curie-lg)] p-6.
4. Status/role badges → <Pill variant="..."> from src/components/curie.
5. Buttons → <Btn variant="primary"|"secondary"> or <IconBtn>.
6. Adjust spacing to 16/24/32 px rhythm.
7. Remove all .glass / .glass-heavy / .glass-subtle utility usage.

Files:
  /login:
    - src/app/(auth)/layout.tsx — Frost bg, centered card 440px max-width
    - src/app/(auth)/login/login-form.tsx — inputs restyled (border 1px
      curie-border, bg curie-surface, radius curie-sm). Submit button uses
      <Btn variant="primary" size="md">. Brand mark + "HR Curie" in Fraunces
      above form.
    - src/app/(auth)/login/page.tsx — only if it needs layout changes
    - Keep public/login-bg.png; adjust gradient overlay to match Frost palette

  /profile:
    - src/app/(dashboard)/profile/page.tsx — wrap content in <Card>; section
      headings in Fraunces; role pill becomes <Pill variant="role">.
      Admin "Edit" → <Btn variant="primary" size="sm">.
    - src/components/shared/detail-field.tsx — label in 11px mono-uppercase
      muted, value in 15px curie-fg.
    - src/app/(dashboard)/@rail/profile/page.tsx — profile route rail with
      <TodayScheduleList> for this employee's meetings. Use the Next parallel
      route slot; do not pass rail through React context.

Update existing component tests if they assert removed class names.
Existing E2E specs (login.spec.ts, profile.spec.ts) should pass unchanged.
```

## Test
- `npx playwright test --project=chromium tests/e2e/flows/login.spec.ts tests/e2e/flows/profile.spec.ts tests/e2e/flows/profile-layout.spec.ts`
- Manually screenshot /login and /profile at 1440×900; compare to mockup vibe.

## Commit
```bash
git add src/app/\(auth\) src/app/\(dashboard\)/profile \
  src/app/\(dashboard\)/@rail/profile src/components/shared && \
  git commit -m "step-42: migrate /login + /profile to Cobalt/Frost tokens"
```
