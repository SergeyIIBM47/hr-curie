# Step 11 — Edit Employee + Role Management

## Prompt for Claude Code

```
Add PUT to src/app/api/employees/[id]/route.ts:
- requireApiAuth("ADMIN"). updateEmployeeSchema. Empty strings → null.

Create PUT at src/app/api/employees/[id]/role/route.ts:
- requireApiAuth("ADMIN"). Validate {role: z.enum(["ADMIN","EMPLOYEE"])}.
  Block self-demotion (400). Update User.role.

Create src/app/(dashboard)/employees/[id]/edit/page.tsx:
- requireAuth("ADMIN"). Pre-fill employee-form. No password field.
  Work email read-only. PUT on submit. Toast + redirect.

Create src/components/employees/role-toggle.tsx (client):
- shadcn Switch, "Admin Access" label. Confirm dialog. API call.
  Self-demotion → error toast. On profile page for ADMIN.
```

## Test
- Edit position → saves. Toggle role → badge changes. Self-demotion → blocked.

## Commit
```bash
git add . && git commit -m "step-11: edit employee and role management"
```
