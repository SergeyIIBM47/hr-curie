# Step 15 — Leave Request Form

## Prompt for Claude Code

```
Create src/app/(dashboard)/leave/request/page.tsx: requireAuth()

Create src/components/leave/leave-request-form.tsx (client):
- Type: select (🤒 Sick Leave, 🏠 Day Off, 🏖️ Vacation)
- Start/End Date: date inputs, Apple filled style
- Reason: textarea optional, 3 rows
- Show "X working days" (date-fns, exclude weekends)
- Submit → POST /api/leave. Toast + redirect /leave.
```

## Test
- Leave → Request → fill → submit → redirects. Prisma: PENDING.

## Commit
```bash
git add . && git commit -m "step-15: leave request form"
```
