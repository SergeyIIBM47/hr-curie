# Step 17 — Leave Approval Page (Admin)

## Prompt for Claude Code

```
Create src/app/(dashboard)/leave/manage/page.tsx:
- requireAuth("ADMIN"). Fetch PENDING with employee info.

Create src/components/leave/leave-approval-card.tsx (client):
- White card, rounded-[10px], shadow-apple-sm, p-5
- Avatar 40px + name, type badge, dates + duration, reason, submitted time
- "Reject" (bg-[#FF3B30]) + "Approve" (bg-[#34C759])
- Confirm dialog. On action: API call, toast, card fade-out
  (opacity 1→0 + height collapse, 350ms apple easing)
- All done: empty state "All caught up!" CheckCircle
```

## Test
- Create requests → admin → Manage → approve/reject → cards animate out → empty state.

## Commit
```bash
git add . && git commit -m "step-17: leave approval page"
```
