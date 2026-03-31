# Step 16 — Leave History Page

## Prompt for Claude Code

```
Create src/app/(dashboard)/leave/page.tsx:
- requireAuth(). Fetch requests. "Request Leave" button.
  ADMIN: "Manage Requests" link → /leave/manage.

Create src/components/leave/leave-status-badge.tsx:
- PENDING: bg-[#FF9500]/15 text-[#FF9500]
- APPROVED: bg-[#34C759]/15 text-[#34C759]
- REJECTED: bg-[#FF3B30]/15 text-[#FF3B30]
- rounded-[6px] px-2.5 py-0.5 text-[12px] font-semibold uppercase

Create src/components/leave/leave-history-table.tsx:
- Desktop table: Type, Dates, Duration, Status, Reason, Submitted
- Mobile: cards. Empty state with CTA.
```

## Test
- Requests visible, badges colored, mobile → cards.

## Commit
```bash
git add . && git commit -m "step-16: leave history page"
```
