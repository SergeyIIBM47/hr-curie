# Step 28 — E2E Tests: Profile Page

## Prompt for Claude Code

```
Write Playwright E2E tests for the profile page functionality.
Reuse auth fixtures from step-27.

## 1. View Own Profile — `tests/e2e/flows/profile.spec.ts`

Test: Admin sees own profile
- Login as admin (sofia@company.com)
- Navigate to `/profile`
- Should see name "Sofia Admin"
- Should see avatar (or initials "SA")
- Should see role badge "ADMIN"
- Should see "Personal Information" section
- Should see fields: First Name, Last Name, Work Email, Employment Type, Date of Birth, Actual Residence, Start Year
- Field values match seeded data:
  - Work Email: sofia@company.com
  - Employment Type: CY
  - Actual Residence: Prague, CZ
  - Start Year: 2024

Test: Employee sees own profile
- Login as employee
- Navigate to `/profile`
- Should see own name and details
- Should NOT see "Edit" button (employees can't edit via admin UI)

## 2. Profile Page Layout — `tests/e2e/flows/profile-layout.spec.ts`

Test: Responsive layout
- Desktop (1280px): detail fields in 2-column grid
- Mobile (375px): detail fields stack vertically

Test: Avatar display
- If employee has avatar URL → shows image
- If employee has no avatar → shows initials circle

## Acceptance Criteria

- [ ] Profile displays correct data from database
- [ ] All detail fields are visible and correctly labeled
- [ ] Responsive layout works on desktop and mobile
- [ ] Avatar/initials fallback works
```
