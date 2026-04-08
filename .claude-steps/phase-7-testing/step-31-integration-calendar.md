# Step 31 — Integration Tests: Meeting & Calendar API Routes

## Prompt for Claude Code

```
Write integration tests for all meeting/calendar API routes.
Use Vitest with Testcontainers (real PostgreSQL). Mock only `auth()` for session simulation.

## 1. Meeting Validation — `src/lib/validations/meeting.test.ts`

Test `scheduleMeetingSchema`:
- Valid complete object → passes
- Missing title → fails
- Title empty string → fails
- Invalid type (not in enum) → fails
- Valid types: "ONE_ON_ONE", "PERFORMANCE_REVIEW" → passes
- scheduledAt not a valid date → fails
- scheduledAt in the past → fails (if enforced)
- durationMinutes < 15 → fails
- durationMinutes > 480 → fails
- durationMinutes = 15 → passes (boundary)
- durationMinutes = 480 → passes (boundary)
- durationMinutes non-integer → fails
- participantUserIds empty array → fails (min 1)
- participantUserIds with 1 valid ID → passes
- participantUserIds with multiple valid IDs → passes
- notes omitted → passes (optional)
- notes included → passes
- syncToGoogleCalendar true/false → passes
- Extra fields are stripped

## 2. List Events — `tests/integration/api/calendar-events-list.test.ts`

Setup: seed DB with 2+ meetings. Meeting A has admin + employee1 as participants.
Meeting B has admin + employee2. Employee1 is NOT in Meeting B.

GET `/api/calendar/events?from=<start>&to=<end>`:
- Admin session → 200, returns all meetings in date range
- Employee1 session → 200, returns only Meeting A (participant filter)
- Employee2 session → 200, returns only Meeting B
- No session → 401
- Response includes: id, title, type, scheduledAt, durationMinutes, googleEventId
- Response includes participants array with: userId, firstName, lastName
- Results ordered by scheduledAt ascending
- Missing `from` or `to` param → 400 (or returns empty)
- `from` after `to` → returns empty results
- Date range with no meetings → 200, empty array

## 3. Schedule Meeting — `tests/integration/api/calendar-schedule.test.ts`

POST `/api/calendar/schedule`:
- Admin session + valid body → 201, returns created meeting with participants
- Admin session + missing required fields → 400, returns Zod errors
- Admin session + invalid participantUserIds (non-existent user) → 400 or 404
- Admin session + empty participantUserIds → 400
- Admin session + durationMinutes out of range → 400
- Employee session → 403, forbidden
- No session → 401
- Meeting and MeetingParticipant records created in transaction
- googleEventId is null in response
- Participants correctly linked to meeting

Test valid body:
```json
{
  "title": "Sprint Planning",
  "type": "ONE_ON_ONE",
  "scheduledAt": "2026-04-15T10:00:00.000Z",
  "durationMinutes": 30,
  "participantUserIds": ["<seeded-user-id-1>", "<seeded-user-id-2>"],
  "notes": "Discuss Q2 goals",
  "syncToGoogleCalendar": false
}
```

## 4. Transaction Integrity — `tests/integration/api/calendar-transaction.test.ts`

- If participant creation fails mid-way, meeting should NOT be created (rollback)
- Verify no orphan Meeting records without participants
- Verify no orphan MeetingParticipant records without a meeting

## Setup / Teardown

- Single Testcontainers instance per file (beforeAll/afterAll)
- Seed test data: admin user, 2 employee users, employment type, 2+ meetings with participants
- Mock `auth()` to return admin/employee/null sessions as needed
- Clean up created meetings between tests to avoid interference

## Acceptance Criteria

- [ ] All calendar endpoints tested with correct status codes
- [ ] Role-based access control verified (ADMIN vs EMPLOYEE)
- [ ] EMPLOYEE only sees meetings where they are a participant
- [ ] Validation errors return meaningful Zod error messages
- [ ] Date range filtering works correctly
- [ ] Transaction creates both Meeting + Participants atomically
- [ ] Response includes participant names
- [ ] Results ordered by scheduledAt ascending
```
