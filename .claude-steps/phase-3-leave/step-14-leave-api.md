# Step 14 — Leave Request API

## Prompt for Claude Code

```
Create src/lib/validations/leave.ts:
- createLeaveSchema: type z.enum(["SICK_LEAVE","DAY_OFF","VACATION"]),
  startDate, endDate (coerce date), reason optional.
  Refine: endDate >= startDate.

Create src/app/api/leave/route.ts:
- GET: requireApiAuth(). ADMIN: all (filter ?status). EMPLOYEE: own.
  Include user.employee (firstName, lastName, avatarUrl). Order createdAt desc.
- POST: requireApiAuth() (any). Validate. Create PENDING. Return 201.

Create src/app/api/leave/[id]/approve/route.ts:
- POST: requireApiAuth("ADMIN"). Verify PENDING. Update APPROVED, reviewedBy/At.

Create src/app/api/leave/[id]/reject/route.ts:
- POST: requireApiAuth("ADMIN"). Same but REJECTED.
```

## Test
- POST leave → PENDING. Approve → APPROVED. Re-approve → 400.

## Commit
```bash
git add . && git commit -m "step-14: leave request API"
```
