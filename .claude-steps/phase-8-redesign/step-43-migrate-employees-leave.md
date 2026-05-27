# Step 43 — Migrate /employees + /leave to New Tokens

> Phase 8.6.c + 8.6.d — see `docs/phase-8-redesign-plan.md` §8.6.

## Prompt for Claude Code

```
Migrate /employees and /leave from Apple tokens to Cobalt/Frost. Apply the
per-route template from step-42 (replace colors, headings to Fraunces, cards,
pills, btns, remove .glass).

Files:
  /employees:
    - src/app/(dashboard)/employees/page.tsx — list as <Card> wrapping a
      restyled table: header row in 11px mono uppercase muted; cell row uses
      Avatar (name-hash tint via Step 38), name + position, department,
      <Pill variant="role"> for role. Search bar uses curie border + radius.
      "Add Employee" button → <Btn variant="primary" icon={IPlus}>.
    - src/app/(dashboard)/employees/[id]/page.tsx — header with lg Avatar +
      name (Fraunces) + role pill. DetailField groups in <Card> sections.
    - src/app/(dashboard)/employees/[id]/edit/page.tsx and
      src/app/(dashboard)/employees/new/page.tsx — restyle inputs
      (curie border, curie-sm radius, 40px height). Section labels in 11px
      mono uppercase muted. Cancel = <Btn secondary>, Submit = <Btn primary>.

  /leave:
    - src/app/(dashboard)/leave/page.tsx (request + history) — request form
      uses new inputs and date pickers. History table follows /employees
      table styling. Status column uses Pill status variants.
    - src/app/(dashboard)/leave/manage/page.tsx (admin) — approval queue
      mirrors structure. Approve/Reject row actions use <Btn size="sm">.
    - src/app/(dashboard)/leave/request/page.tsx — same form recipe as above.

Existing E2E specs (none specific to leave; navigation.spec.ts asserts links)
should continue to pass.
```

## Test
- `npx playwright test --project=chromium tests/e2e/flows/employee-list.spec.ts tests/e2e/flows/employee-create.spec.ts tests/e2e/flows/employee-edit.spec.ts tests/e2e/flows/employee-profile.spec.ts tests/e2e/flows/employee-role.spec.ts`
- Manually screenshot /employees, /employees/new, /leave, /leave/manage at 1440×900.

## Commit
```bash
git add src/app/\(dashboard\)/employees src/app/\(dashboard\)/leave && \
  git commit -m "step-43: migrate /employees + /leave to Cobalt/Frost tokens"
```
