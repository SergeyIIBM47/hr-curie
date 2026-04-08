# Step 33 — E2E Tests: Calendar & Meeting Scheduling

## Prompt for Claude Code

```
Write Playwright E2E tests for the calendar and meeting scheduling workflow.
Reuse auth fixtures from step-27.

## 1. Calendar Page Access — `tests/e2e/flows/calendar-access.spec.ts`

Test: Admin sees calendar page
- Login as admin
- Navigate to `/calendar`
- Should see month view grid
- Should see current month name and year
- Should see "Schedule Meeting" button
- Today's date is highlighted

Test: Employee sees calendar page
- Login as employee
- Navigate to `/calendar`
- Should see month view grid
- Should NOT see "Schedule Meeting" button
- Only sees meetings where they are a participant

Test: Unauthenticated redirect
- Navigate to `/calendar` without logging in
- Should redirect to `/login`

## 2. Month Navigation — `tests/e2e/flows/calendar-navigation.spec.ts`

Test: Navigate to previous month
- Login as admin
- Click left arrow
- Month name and year update to previous month
- Grid shows correct days for that month

Test: Navigate to next month
- Click right arrow
- Month name and year update to next month
- Grid shows correct days for that month

Test: Navigate multiple months
- Click left arrow 3 times → 3 months back
- Click right arrow 3 times → returns to current month

## 3. Schedule Meeting — `tests/e2e/flows/calendar-schedule.spec.ts`

Test: Admin schedules a meeting successfully
- Login as admin
- Navigate to `/calendar`
- Click "Schedule Meeting" button
- Dialog opens with all fields
- Fill Title: "Sprint Planning"
- Select Type: "One-on-One"
- Set Date + Time: a future date/time
- Select Duration: 30 min
- Select at least 1 participant from the multi-select
- Click "Schedule"
- Dialog closes
- Success toast appears
- Calendar updates — the scheduled date shows a meeting dot

Test: Schedule meeting with all optional fields
- Open schedule dialog
- Fill all required fields + notes
- Click "Schedule"
- Meeting created with notes

Test: Validation prevents empty submission
- Open schedule dialog
- Click "Schedule" without filling any fields
- Should see validation errors for required fields
- Dialog stays open

Test: Cancel does not create meeting
- Open schedule dialog
- Fill some fields
- Click "Cancel"
- Dialog closes
- No meeting created (no dot appears)

## 4. View Meeting Details — `tests/e2e/flows/calendar-meeting-details.spec.ts`

Prerequisite: at least 1 meeting exists (schedule one in beforeAll or use seeded data).

Test: Click day with meeting shows meeting cards
- Login as admin
- Navigate to `/calendar`
- Click on a day that has a meeting
- Side panel / detail area shows meeting card(s)
- Card shows: time, title, type badge, participant avatars

Test: Expand meeting card for full details
- Click on a meeting card
- Expanded view shows: notes, full participant list with names
- Click again → collapses

Test: Meeting dot colors match type
- Day with One-on-One meeting → blue dot
- Day with Performance Review meeting → indigo dot

## 5. Role-Based Meeting Visibility — `tests/e2e/flows/calendar-visibility.spec.ts`

Setup: admin schedules Meeting A with employee1, Meeting B with employee2.

Test: Admin sees all meetings
- Login as admin
- Navigate to `/calendar`
- Both Meeting A and Meeting B dots visible on their dates
- Click each day → both meetings shown

Test: Employee sees only own meetings
- Login as employee1
- Navigate to `/calendar`
- Meeting A dot visible on its date
- Meeting B date has NO dot
- Click Meeting A's date → sees Meeting A card
- Click Meeting B's date → no meetings shown

Test: Non-participant employee
- Login as employee2
- Cannot see Meeting A
- Can see Meeting B

## 6. Mobile Calendar — `tests/e2e/flows/calendar-mobile.spec.ts`

Test: Mobile calendar layout
- Set viewport to mobile (375x667)
- Login as admin
- Navigate to `/calendar`
- Month grid renders responsively (compact)
- "Schedule Meeting" button is accessible
- Day click shows meeting details below (not side panel)

Test: Mobile schedule dialog
- Click "Schedule Meeting"
- Dialog adapts to mobile width
- All fields are usable on mobile
- Submit works on mobile

## Cleanup

After schedule tests, clean up test meetings to avoid polluting the database
for other test runs. Use `afterAll` API calls to delete test data.

## Acceptance Criteria

- [ ] Calendar page loads for both admin and employee
- [ ] Month navigation updates grid correctly
- [ ] Admin can schedule meetings via dialog
- [ ] Validation prevents invalid meeting creation
- [ ] Meeting dots appear on correct dates after scheduling
- [ ] Dot colors correspond to meeting type (blue vs indigo)
- [ ] Click day reveals meeting cards with correct details
- [ ] Meeting card expand/collapse works
- [ ] ADMIN sees all meetings, EMPLOYEE sees only own
- [ ] Mobile layout is responsive and functional
- [ ] Tests are independent and clean up after themselves
```
