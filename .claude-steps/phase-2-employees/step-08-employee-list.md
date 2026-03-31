# Step 08 — Employee List + Search

## Prompt for Claude Code

```
Create GET handler at src/app/api/employees/route.ts:
- requireApiAuth(). ADMIN: search across firstName, lastName, workEmail,
  position, department (Prisma contains + insensitive). Include
  employmentType.name, user (select: id, role — NEVER passwordHash).
  Order by lastName asc. EMPLOYEE: own record only.

Create src/app/(dashboard)/employees/page.tsx: requireAuth("ADMIN"),
SSR fetch employees. Title "Employees" + count. "Add Employee" button → /employees/new.

Create src/hooks/use-debounce.ts: debounce hook (300ms).

Create src/components/employees/employee-search.tsx (client):
- Filled input (bg fill-primary, no border, h-[44px], rounded-[8px])
- Search icon prefix. Debounced. Updates URL ?q= params.

Create src/components/employees/employee-table.tsx (client):
- shadcn Table, desktop only (≥768px). Columns: Avatar+Name, Email,
  Role (badge), Department, Employment Type. Clickable rows → /employees/[id].
  h-[52px] rows, hover bg-[#F2F2F7]. Header: text-[13px] font-semibold uppercase.
  Container: bg-white rounded-[10px] shadow-apple-sm.

Create src/components/employees/employee-card.tsx (client):
- Mobile (<768px). White card rounded-[10px] shadow-apple-sm p-4.
  Avatar 40px + name + email + role badge + department. Clickable. 12px gap.
```

## Test
- Employees page shows Sofia. Search "sof" filters. Mobile → cards. "Add Employee" links.

## Commit
```bash
git add . && git commit -m "step-08: employee list page"
```
