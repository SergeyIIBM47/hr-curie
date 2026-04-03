# Step 27 — E2E Tests: Authentication & Navigation

## Prompt for Claude Code

```
Write Playwright E2E tests for authentication flows and navigation.
Tests run against the full app (dev server). Use real login with seeded credentials.

## 1. Playwright Fixtures — `tests/e2e/fixtures/auth.ts`

Create reusable fixtures:
- `adminPage`: a Page that is pre-authenticated as admin (sofia@company.com)
- `employeePage`: a Page pre-authenticated as an employee user
- Use `storageState` to persist auth between tests for speed

Login helper:
```typescript
async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(profile|employees)/);
}
```

## 2. Login Flow — `tests/e2e/flows/login.spec.ts`

Test: Successful login
- Go to `/login`
- Enter sofia@company.com / qwerty123#
- Click "Sign In"
- Should redirect to `/profile` (or dashboard)
- Should see user name in sidebar

Test: Failed login — wrong password
- Go to `/login`
- Enter sofia@company.com / wrongpassword
- Click "Sign In"
- Should see error message on login page
- Should remain on `/login`

Test: Failed login — validation errors
- Go to `/login`
- Click "Sign In" without filling fields
- Should see validation error messages

Test: Protected route redirect
- Go to `/profile` without logging in
- Should redirect to `/login`

Test: Logout
- Login as admin
- Click sign out button in sidebar
- Should redirect to `/login`
- Go to `/profile` → should redirect back to `/login`

## 3. Navigation — `tests/e2e/flows/navigation.spec.ts`

Test: Admin sidebar navigation
- Login as admin
- Click "My Profile" → URL is `/profile`
- Click "Employees" → URL is `/employees`
- Active item is highlighted

Test: Employee sidebar navigation
- Login as employee
- "Employees" nav item is NOT visible
- "Settings" nav item is NOT visible
- "My Profile" is visible and clickable

Test: Mobile navigation
- Set viewport to mobile (375x667)
- Login → sidebar is hidden
- Click hamburger menu → navigation sheet opens
- Click nav item → navigates and sheet closes

## 4. Role-based access — `tests/e2e/flows/access-control.spec.ts`

Test: Employee blocked from admin routes
- Login as employee
- Navigate to `/employees` → redirected to `/profile`
- Navigate to `/employees/new` → redirected to `/profile`
- Navigate to `/settings` → redirected to `/profile`

Test: Admin can access all routes
- Login as admin
- Navigate to `/employees` → page loads with employee table
- Navigate to `/employees/new` → page loads with form
- Navigate to `/profile` → page loads with profile

## Prerequisite

The dev server must be running with a seeded database (at minimum the admin user
sofia@company.com must exist). Use `npm run dev` or configure Playwright
webServer to start it automatically.

## Acceptance Criteria

- [ ] Login success and failure flows work end-to-end
- [ ] Protected routes redirect to login
- [ ] Logout clears session
- [ ] Sidebar navigation works for admin and employee roles
- [ ] Mobile navigation works
- [ ] Role-based access control enforced in browser
- [ ] Tests run in < 60 seconds
```
