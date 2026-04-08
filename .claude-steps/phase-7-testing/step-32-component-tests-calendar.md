# Step 32 — Component Tests: Calendar Components

## Prompt for Claude Code

```
Write component tests for all calendar-related components.
Use Vitest + Testing Library + jsdom. Mock fetch and router.

## 1. ScheduleMeetingDialog — `src/components/calendar/schedule-meeting-dialog.test.tsx`

Rendering:
- Renders trigger button
- Opens dialog on trigger click
- Dialog shows title "Schedule Meeting" (or similar)
- Dialog has glass overlay styling
- Dialog renders all form fields: Title, Type, Date+Time, Duration, Participants, Notes
- Cancel and Schedule buttons are visible

Form fields:
- Type select shows options: "One-on-One", "Performance Review"
- Duration select shows options: 15, 30, 45, 60, 90 min
- Participants multi-select fetches from `/api/employees` on open
- Participants shows avatar + name for each option
- Notes field is optional (no required indicator)

Validation:
- Submit with empty title → shows validation error
- Submit without selecting participants → shows validation error
- Submit without date/time → shows validation error
- Submit with all required fields → calls POST `/api/calendar/schedule`

Submission:
- Shows loading state on Schedule button during API call
- On success → closes dialog, shows success toast, triggers refresh
- On API error → shows error toast, dialog stays open

Cancel behavior:
- Click Cancel → closes dialog without API call
- Click overlay → closes dialog without API call
- Form state resets when dialog reopens

## 2. CalendarMonthView — `src/components/calendar/calendar-month-view.test.tsx`

Setup: provide mock meetings array with meetings on different days.

Rendering:
- Renders month name and year in header
- Renders 7 day-of-week column headers (Mon–Sun or Sun–Sat)
- Renders correct number of day cells for current month
- Today's date has blue highlight circle
- Days with meetings show colored dots

Meeting dots:
- One-on-One meetings → apple-blue dot
- Performance Review meetings → apple-indigo dot
- Day with multiple meetings → shows multiple dots
- Day with no meetings → no dots

Navigation:
- Left arrow navigates to previous month
- Right arrow navigates to next month
- Month/year header updates after navigation
- Day cells update to show correct month

Day interaction:
- Click on a day → triggers onDaySelect callback with date
- Selected day shows visual highlight (different from today)

Edge cases:
- Month starting on different weekdays renders correctly
- February in leap year → 29 days
- Days from adjacent months shown as dimmed (if displayed)

## 3. MeetingCard — `src/components/calendar/meeting-card.test.tsx`

Setup: provide mock meeting object with participants.

Rendering:
- Renders meeting time (font-semibold)
- Renders meeting title
- Renders type badge (One-on-One / Performance Review)
- Badge colors differ by type
- Renders participant avatars (stacked)
- Max 3 avatars shown, then "+N" overflow indicator

Overflow:
- 2 participants → shows 2 avatars, no overflow
- 3 participants → shows 3 avatars, no overflow
- 5 participants → shows 3 avatars + "+2"

Expand/collapse:
- Click card → expands to show notes and full participant list
- Expanded view shows all participant names
- Click again → collapses back
- Notes field shows "No notes" or similar when notes is null

## Mocking Strategy

- Mock `next/navigation` (useRouter, usePathname)
- Mock `fetch` for `/api/employees` (participant multi-select) and `/api/calendar/schedule` (form submit)
- Mock `sonner` toast for notifications
- Provide mock data matching Meeting and Participant types

## Acceptance Criteria

- [ ] Schedule dialog renders all fields and validates input
- [ ] Dialog opens, submits, and closes correctly
- [ ] Calendar month view renders correct grid with meeting dots
- [ ] Month navigation works (prev/next)
- [ ] Today highlighted, selected day highlighted differently
- [ ] Meeting card shows time, title, type badge, and participant avatars
- [ ] Participant avatar overflow ("+N") works correctly
- [ ] Card expand/collapse shows full details
- [ ] Loading and error states tested
```
