# Step 10 — Employee Profile View

## Prompt for Claude Code

```
Create GET at src/app/api/employees/[id]/route.ts:
- requireApiAuth(). Find by ID, include employmentType, user (id, role, email).
  EMPLOYEE + not own → 403. Not found → 404. No passwordHash.

Create src/app/(dashboard)/employees/[id]/page.tsx:
- requireAuth(). const { id } = await params (Next.js 16 async).
  Fetch by ID. EMPLOYEE + not own → redirect /profile. notFound() if missing.
- Top: 96px avatar + name + position + role badge
- ADMIN: "Edit" → /employees/[id]/edit, "Back to List" → /employees
- Info card with detail-field.tsx for all fields
```

## Test
- Click employee in list → profile. Login as EMPLOYEE → own profile only.

## Commit
```bash
git add . && git commit -m "step-10: employee profile view"
```
