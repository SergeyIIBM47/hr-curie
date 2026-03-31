# Step 21 — Employment Type Management

## Prompt for Claude Code

```
Create src/app/api/employment-types/route.ts:
- GET: any authenticated. POST: ADMIN, validate name non-empty + unique.

Create src/app/(dashboard)/settings/page.tsx: requireAuth("ADMIN")
- "Employment Types": list as chips (rounded-[6px] bg-[#E5E5EA] text-[16px]).
  Delete X (disabled if employees assigned). "Add Type" input + button.
```

## Commit
```bash
git add . && git commit -m "step-21: employment type management"
```
