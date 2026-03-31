# Step 22 — Dashboard Overview Page

## Prompt for Claude Code

```
Replace src/app/(dashboard)/page.tsx: requireAuth()

ADMIN view — 4 cards (2x2 grid, white rounded-[10px] shadow-apple-sm p-5):
1. "Total Employees" count, Users icon, apple-blue
2. "Pending Requests" count, CalendarOff icon, apple-orange (→ /leave/manage)
3. "Meetings This Week" count, Calendar icon, apple-indigo
4. "New This Month" count, UserPlus icon, apple-green
Number: text-[34px] font-bold. Label: text-[16px] text-gray-1. Icon: 24px top-right.
Below: "Recent Leave Requests" (5) + "Upcoming Meetings" (5).

EMPLOYEE view: Welcome + quick actions (Request Leave, Calendar, Profile) + own data.
```

## Commit
```bash
git add . && git commit -m "step-22: dashboard overview"
```
