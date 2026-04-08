# Step 35 — Component Tests: Settings & Dashboard Components

## Prompt for Claude Code

```
Write component tests for settings and dashboard components.
Use Vitest + Testing Library + jsdom. Mock fetch and router.

## 1. Employment Type Chips — `src/components/settings/employment-type-list.test.tsx`

(Test the component that renders employment types as chips on the settings page)

Rendering:
- Renders a chip for each employment type
- Chip shows type name (e.g., "CY", "CZ")
- Chip styled: rounded-[6px], bg-[#E5E5EA], text-[16px]
- Each chip has a delete (X) button

Delete button state:
- Type with 0 employees → X button enabled
- Type with assigned employees → X button disabled
- Disabled X button has visual indicator (opacity, cursor)
- Hover on disabled X → shows tooltip "Cannot delete: employees assigned" (or similar)

Delete interaction:
- Click enabled X → calls delete API
- Shows confirmation dialog before delete (if implemented)
- On success → chip removed from list, success toast
- On API error → chip stays, error toast

## 2. Add Employment Type — `src/components/settings/add-employment-type.test.tsx`

(Test the "Add Type" input + button component)

Rendering:
- Renders text input with placeholder
- Renders "Add Type" button

Interaction:
- Type name in input + click "Add Type" → calls POST `/api/employment-types`
- Empty input + click → shows validation error or button disabled
- On success → input clears, new chip appears, success toast
- On duplicate name error → shows error message
- Shows loading state during API call
- Enter key in input also submits

## 3. Dashboard Stat Cards — `src/components/dashboard/stat-cards.test.tsx`

(Test the 4 stat cards: Total Employees, Pending Requests, Meetings This Week, New This Month)

Setup: provide mock stats { totalEmployees: 42, pendingRequests: 3, meetingsThisWeek: 7, newThisMonth: 2 }.

Rendering:
- Renders 4 cards in 2x2 grid
- Each card shows: number (text-[34px] font-bold), label (text-[16px]), icon (24px)
- Card 1: "Total Employees" with count, Users icon, apple-blue accent
- Card 2: "Pending Requests" with count, CalendarOff icon, apple-orange accent
- Card 3: "Meetings This Week" with count, Calendar icon, apple-indigo accent
- Card 4: "New This Month" with count, UserPlus icon, apple-green accent
- Cards styled: white bg, rounded-[10px], shadow-apple-sm, p-5

Click behavior:
- "Pending Requests" card → navigates to `/leave/manage` (if clickable)
- Other cards → navigate to respective pages (if clickable)

Edge cases:
- Zero counts render as "0" not empty
- Large numbers render correctly (e.g., 1,234)

## 4. Recent Leave Requests List — `src/components/dashboard/recent-leave-requests.test.tsx`

Setup: provide mock leave requests array (5 items).

Rendering:
- Renders up to 5 leave request items
- Each item shows: requester name, leave type, date range, status badge
- Status badge colors: pending=orange, approved=green, rejected=red
- Items ordered by most recent first

Empty state:
- No requests → shows "No recent leave requests" message

## 5. Upcoming Meetings List — `src/components/dashboard/upcoming-meetings.test.tsx`

Setup: provide mock meetings array (5 items).

Rendering:
- Renders up to 5 meeting items
- Each item shows: title, date/time, participant count or names
- Items ordered by soonest first

Empty state:
- No meetings → shows "No upcoming meetings" message

## 6. Employee Dashboard — `src/components/dashboard/employee-dashboard.test.tsx`

(Test the EMPLOYEE view of the dashboard)

Rendering:
- Shows welcome message with employee name
- Shows quick action buttons: "Request Leave", "Calendar", "Profile"
- Shows own recent leave requests
- Shows own upcoming meetings

Quick actions:
- Click "Request Leave" → navigates to `/leave/request`
- Click "Calendar" → navigates to `/calendar`
- Click "Profile" → navigates to `/profile`

## 7. Settings Page Access — `src/app/(dashboard)/settings/page.test.tsx`

(Test the settings page wrapper)

- Renders employment type list for ADMIN
- ADMIN session → page renders with all settings sections
- EMPLOYEE session → redirects or shows access denied (requireAuth("ADMIN"))

## Mocking Strategy

- Mock `next/navigation` (useRouter, usePathname)
- Mock `fetch` for all API calls (employment-types, dashboard data)
- Mock `sonner` toast for notifications
- Mock `auth()` for page-level access control tests
- Provide mock data matching API response types

## Acceptance Criteria

- [ ] Employment type chips render with correct styling
- [ ] Delete disabled for types with employees, enabled for empty types
- [ ] Add type validates input and calls API
- [ ] All 4 stat cards render with correct number, label, icon, and color
- [ ] Recent leave requests and upcoming meetings lists render correctly
- [ ] Empty states handled for all lists
- [ ] Employee dashboard shows welcome + quick actions + own data
- [ ] Settings page enforces ADMIN-only access
- [ ] Loading and error states tested
```
