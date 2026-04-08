# Step 36 — E2E Tests: Settings, Dashboard & Responsive Audit

## Prompt for Claude Code

```
Write Playwright E2E tests for settings, dashboard, and responsive behavior.
Reuse auth fixtures from step-27.

## 1. Settings Page — `tests/e2e/flows/settings-access.spec.ts`

Test: Admin accesses settings
- Login as admin
- Navigate to `/settings`
- Should see "Employment Types" section
- Should see existing chips (at least "CY" from seed)
- Should see "Add Type" input and button

Test: Employee blocked from settings
- Login as employee
- Navigate to `/settings` → redirected to `/profile` (or shows access denied)

## 2. Employment Type CRUD — `tests/e2e/flows/settings-employment-types.spec.ts`

Test: Add employment type
- Login as admin
- Navigate to `/settings`
- Type "TEST_TYPE" in the add input
- Click "Add Type" (or press Enter)
- New chip "TEST_TYPE" appears in the list
- Success toast shown

Test: Add duplicate type
- Type "CY" in the add input (already exists)
- Click "Add Type"
- Error message shown (duplicate)
- No duplicate chip created

Test: Add empty type
- Click "Add Type" with empty input
- Validation error shown
- No chip created

Test: Delete type with no employees
- Add a new type "TEMP_TYPE"
- Click X on "TEMP_TYPE" chip
- Chip removed from list
- Success toast shown

Test: Cannot delete type with employees
- "CY" has assigned employees (from seed)
- X button on "CY" chip is disabled
- Click does nothing (or shows tooltip/message explaining why)

## 3. Dashboard — Admin View — `tests/e2e/flows/dashboard-admin.spec.ts`

Test: Admin dashboard loads
- Login as admin
- Navigate to `/` (dashboard root)
- Should see 4 stat cards in 2x2 grid

Test: Stat cards display
- "Total Employees" card shows a number ≥ 1
- "Pending Requests" card shows a number ≥ 0
- "Meetings This Week" card shows a number ≥ 0
- "New This Month" card shows a number ≥ 0
- Each card has the correct icon
- Numbers are styled: large text (34px), bold

Test: Pending Requests card navigation
- Click "Pending Requests" card → navigates to `/leave/manage`

Test: Recent Leave Requests section
- Should see "Recent Leave Requests" heading
- Shows up to 5 items (or empty state message)
- Each item shows requester name and status badge

Test: Upcoming Meetings section
- Should see "Upcoming Meetings" heading
- Shows up to 5 items (or empty state message)
- Each item shows meeting title and date/time

## 4. Dashboard — Employee View — `tests/e2e/flows/dashboard-employee.spec.ts`

Test: Employee dashboard loads
- Login as employee
- Navigate to `/`
- Should see welcome message with employee name
- Should NOT see the 4 admin stat cards

Test: Quick actions
- Should see "Request Leave" button → click → navigates to `/leave/request`
- Should see "Calendar" button → click → navigates to `/calendar`
- Should see "Profile" button → click → navigates to `/profile`

Test: Employee own data
- Should see own recent leave requests (or empty state)
- Should see own upcoming meetings (or empty state)
- Should NOT see other employees' data

## 5. Responsive Audit — `tests/e2e/flows/responsive-audit.spec.ts`

Test all breakpoints with these viewport sizes:
- Mobile: 375x667 (iPhone SE)
- Mobile large: 390x844 (iPhone 14)
- Tablet: 768x1024 (iPad)
- Desktop: 1280x800

### Mobile (<768px)

Test: Sidebar becomes sheet
- Set viewport to 375x667
- Login as admin
- Sidebar is NOT visible on the left
- Hamburger menu button is visible
- Click hamburger → navigation sheet slides in
- Click nav item → sheet closes, page navigates

Test: Tables become cards
- Navigate to `/employees` on mobile
- Employee data shown as cards, NOT table rows
- Cards show name, email, role
- Cards are tappable

Test: Forms single column
- Navigate to `/employees/new` on mobile
- Form fields stack in single column
- Buttons are full-width
- All fields usable on mobile

Test: Modals adapt
- Open schedule meeting dialog (or similar dialog) on mobile
- Dialog adapts to mobile width (bottom sheet or full-width)
- All fields accessible and scrollable

Test: Touch targets
- All interactive elements are at least 44x44px tap targets
- Buttons, links, toggles meet minimum size

### Tablet (768-1024px)

Test: Sidebar toggleable
- Set viewport to 768x1024
- Sidebar is collapsible (toggle button visible)
- Content area uses available space
- 2-column grids for cards/forms

### Desktop (>1024px)

Test: Full layout
- Set viewport to 1280x800
- Sidebar always visible
- Tables use full table layout
- Content constrained to max-w-[1200px]
- Dashboard cards in 2x2 grid

## 6. Accessibility — `tests/e2e/flows/accessibility.spec.ts`

Test: Focus rings
- Tab through the login page → focus rings visible on every interactive element
- Focus ring: 2px apple-blue, outline-offset 2px
- Tab through sidebar navigation → all items receive focus
- Tab through a form → all inputs, selects, buttons receive focus

Test: Keyboard navigation
- Login via keyboard only (Tab to fields, Enter to submit)
- Navigate sidebar via keyboard (Tab + Enter)
- Open and close dialogs via keyboard (Escape to close)

Test: ARIA labels
- Icon-only buttons have aria-label (e.g., hamburger menu, delete X, nav arrows)
- Verify with `page.locator('button:not([aria-label])').filter({ hasNot: page.locator('text') })` → empty

Test: Semantic HTML
- Page has `<nav>` element for sidebar navigation
- Page has `<main>` element for content area
- Page has `<header>` element for topbar
- Form sections use `<section>` or `<fieldset>`

Test: Reduced motion
- Emulate `prefers-reduced-motion: reduce`
- Animations are disabled or simplified
- Page transitions don't animate
- Toasts appear without slide animation

Test: Color contrast
- Use Playwright's accessibility snapshot or axe-core integration
- Run `@axe-core/playwright` on key pages: login, dashboard, employees, calendar, settings
- No critical contrast violations (4.5:1 ratio for text)

## Cleanup

Clean up test employment types ("TEST_TYPE", "TEMP_TYPE") in afterAll.

## Acceptance Criteria

- [ ] Settings page accessible to ADMIN only
- [ ] Employment type add/delete works end-to-end
- [ ] Duplicate and empty type names rejected
- [ ] Delete blocked for types with assigned employees
- [ ] Admin dashboard shows 4 stat cards with correct data
- [ ] Pending Requests card navigates to leave management
- [ ] Recent leave requests and upcoming meetings lists render
- [ ] Employee dashboard shows welcome + quick actions + own data
- [ ] Mobile: sidebar→sheet, tables→cards, forms single-col, full-width buttons
- [ ] Tablet: toggleable sidebar, 2-column grids
- [ ] Desktop: full sidebar, full tables, max-w-[1200px]
- [ ] Touch targets ≥ 44px on mobile
- [ ] Focus rings visible on all interactive elements via keyboard
- [ ] Icon buttons have aria-labels
- [ ] Semantic HTML elements used (nav, main, header)
- [ ] prefers-reduced-motion disables animations
- [ ] No critical color contrast violations (axe-core)
- [ ] Tests are independent and clean up after themselves
```
