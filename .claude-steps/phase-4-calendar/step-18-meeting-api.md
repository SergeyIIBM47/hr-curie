# Step 18 — Meeting API

## Prompt for Claude Code

```
Create src/lib/validations/meeting.ts: scheduleMeetingSchema
(title, type enum, scheduledAt date, durationMinutes 15-480,
participantUserIds array min 1, notes optional, syncToGoogleCalendar bool).

Create src/app/api/calendar/events/route.ts:
- GET ?from=&to=: requireApiAuth(). ADMIN → all. EMPLOYEE → participant only.
  Include participants with names. Order scheduledAt asc.

Create src/app/api/calendar/schedule/route.ts:
- POST: requireApiAuth("ADMIN"). Validate. Transaction: Meeting + Participants.
  googleEventId null (for now). Return 201.
```

## Commit
```bash
git add . && git commit -m "step-18: meeting API"
```
