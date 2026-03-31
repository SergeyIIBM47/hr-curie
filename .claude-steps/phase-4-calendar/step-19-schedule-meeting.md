# Step 19 — Schedule Meeting Dialog

## Prompt for Claude Code

```
Create src/components/calendar/schedule-meeting-dialog.tsx (client):
- shadcn Dialog, max-w-[480px], rounded-[14px], shadow-apple-xl
- Glass overlay. Title: text-[20px] font-semibold centered.
- Fields: Title, Type (select: One-on-One / Performance Review),
  Date+Time (datetime-local), Duration (select 15/30/45/60/90 min),
  Participants (multi-select from /api/employees, avatar+name),
  Notes (textarea optional)
- Cancel (ghost) + Schedule (primary). Close + toast + refresh on success.
```

## Commit
```bash
git add . && git commit -m "step-19: schedule meeting dialog"
```
