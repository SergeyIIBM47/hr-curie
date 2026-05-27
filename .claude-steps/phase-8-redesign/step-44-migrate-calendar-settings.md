# Step 44 — Migrate /calendar + /settings to New Tokens

> Phase 8.6.e + 8.6.f — see `docs/phase-8-redesign-plan.md` §8.6.

## Prompt for Claude Code

```
Migrate /calendar and /settings from Apple tokens to Cobalt/Frost. Apply the
per-route template from step-42.

Files:
  /calendar:
    - src/app/(dashboard)/calendar/page.tsx
    - src/app/(dashboard)/calendar/calendar-page-client.tsx — full-size
      calendar adopts MiniCalendar's cell vocabulary at scale:
        cell muted (out-of-month gray), today (Cobalt 2px underline + bold),
        selected (Ink filled bg, white fg), has-event (dot pip).
      Each meeting on the day rendered as <ScheduleCard> below the calendar
      (.sched-card styling from mockup: white bg, curie-md radius, 14px/16px
      padding; .now variant when in-progress). Use IClock + mono time row.
      Day detail panel: title 22px Fraunces, list of meetings + day's leave.
    - "+ Schedule meeting" → <Btn variant="primary" icon={IPlus}>.

  /settings:
    - src/app/(dashboard)/settings/page.tsx — page header in Fraunces.
    - src/app/(dashboard)/settings/employment-type-manager.tsx — list each
      employment type as a <Card> row: name + employee count + edit/delete
      <IconBtn>. "Add type" → <Btn variant="primary" icon={IPlus}>.
    - Dialogs use new tokens: header Fraunces, body fg secondary, primary
      action Cobalt, cancel <Btn secondary>.

Existing E2E specs should continue to pass:
  navigation.spec.ts (asserts links/labels)
  access-control.spec.ts (asserts role gating)
```

## Test
- `npx playwright test --project=chromium tests/e2e/flows/navigation.spec.ts tests/e2e/flows/access-control.spec.ts tests/e2e/flows/navigation-mobile.spec.ts`
- Manually screenshot /calendar and /settings at 1440×900.

## Commit
```bash
git add src/app/\(dashboard\)/calendar src/app/\(dashboard\)/settings && \
  git commit -m "step-44: migrate /calendar + /settings to Cobalt/Frost tokens"
```
