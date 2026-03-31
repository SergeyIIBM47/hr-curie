# Step 20 — Calendar View

## Prompt for Claude Code

```
Create src/app/(dashboard)/calendar/page.tsx: requireAuth().
ADMIN: "Schedule Meeting" primary button.

Create src/components/calendar/calendar-month-view.tsx (client):
- Month grid. Dots: One-on-One=apple-blue, Review=apple-indigo.
- Today: apple-blue bg circle. Click day → shows meetings in side panel.

Create src/components/calendar/meeting-card.tsx:
- Time (font-semibold), title, type badge, stacked participant
  avatars (max 3 + "+N"). Click expand: notes + full list.

Layout: month/year nav arrows, grid center, day detail right/below.
ADMIN: all meetings. EMPLOYEE: own meetings only.
```

## Test
- Schedule meeting → calendar dot appears. Participant sees it. Non-participant doesn't.

## Commit
```bash
git add . && git commit -m "step-20: calendar view"
```
