# Step 25 — Component Tests: Login & Layout

## Prompt for Claude Code

```
Write component tests for the login form, sidebar, topbar, and mobile navigation.
Use Vitest + Testing Library + jsdom. Mock auth and fetch — no real API calls.

## 1. LoginForm — `src/app/(auth)/login/login-form.test.tsx`

Render:
- Renders email input with placeholder
- Renders password input (type="password")
- Renders "Sign In" button
- Renders "HR Curie" heading

Validation:
- Submit empty form → shows validation errors for email and password
- Submit with invalid email → shows email error
- Submit with valid data → calls fetch with correct endpoint and body

Password toggle:
- Click eye icon → input type changes to "text"
- Click again → input type changes back to "password"

Loading state:
- While submitting → button shows spinner, is disabled
- After error → button re-enables

Error display:
- Mock fetch to return error → displays error message
- Error message disappears when retrying

## 2. Sidebar — `src/components/layout/sidebar.test.tsx`

Render:
- Shows "HR Curie" branding
- Shows navigation items (Overview, My Profile, etc.)
- Shows user card at bottom with name and email

Admin role:
- Admin user → shows Employees, Settings nav items
- Admin user → nav items have admin badge

Employee role:
- Employee user → hides Employees, Settings nav items
- Employee user → shows only My Profile, Leave, Calendar

Active state:
- Current route highlights the matching nav item
- Non-active items are not highlighted

Sign out:
- Sign out button is rendered
- Click sign out → calls signOut function

## 3. Topbar — `src/components/layout/topbar.test.tsx`

- Renders user avatar (or initials fallback)
- Renders correctly with user name

## 4. MobileNav — `src/components/layout/mobile-nav.test.tsx`

- Renders hamburger/menu button
- Click menu button → opens sheet with navigation
- Shows correct nav items based on role
- Navigation items are clickable

## Mocking Strategy

- Mock `next/navigation` (usePathname, useRouter)
- Mock `next-auth/react` (signOut)
- Mock `@/lib/auth` as needed
- Use `@testing-library/user-event` for interactions

## Acceptance Criteria

- [ ] All components render without errors
- [ ] Form validation tested for happy and error paths
- [ ] Role-based rendering verified (admin vs employee)
- [ ] User interactions (click, type, toggle) tested
- [ ] No real API calls or navigation in tests
```
