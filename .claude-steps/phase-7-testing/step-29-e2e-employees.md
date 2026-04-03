# Step 29 — E2E Tests: Employee Management

## Prompt for Claude Code

```
Write Playwright E2E tests for the complete employee management workflow.
Reuse auth fixtures from step-27.

## 1. Employee List — `tests/e2e/flows/employee-list.spec.ts`

Test: Admin sees employee table
- Login as admin
- Navigate to `/employees`
- Should see table with at least 1 employee (seeded admin)
- Table has columns: Name, Email, Role, Department, Employment Type
- Should see "Add Employee" button

Test: Search employees
- Type in search input → table filters results
- Clear search → table shows all employees
- Search by first name → matches
- Search by email → matches
- No results → shows empty state message

Test: Click employee row
- Click on an employee row → navigates to `/employees/[id]`

Test: Mobile view
- Set viewport to mobile
- Employees shown as cards instead of table
- Cards show name, email, role
- Cards are clickable

## 2. Create Employee — `tests/e2e/flows/employee-create.spec.ts`

Test: Successful creation
- Login as admin
- Navigate to `/employees/new`
- Fill required fields:
  - First Name: "Test"
  - Last Name: "Employee"
  - Work Email: "test.employee@company.com"
  - Password: "testpass123"
  - Employment Type: select "CY"
  - Date of Birth: "1995-06-15"
  - Actual Residence: "Berlin, DE"
  - Start Year: "2025"
- Click submit
- Should redirect to `/employees` (or employee profile)
- New employee should appear in the list

Test: Validation errors
- Navigate to `/employees/new`
- Click submit without filling fields
- Should see validation errors for required fields
- Form does not submit

Test: Duplicate email
- Try to create employee with existing email (sofia@company.com)
- Should see error about duplicate email

Test: Optional fields
- Fill required fields + some optional fields (phone, position, department)
- Submit → employee created with optional fields populated

## 3. Employee Profile View — `tests/e2e/flows/employee-profile.spec.ts`

Test: Admin views employee profile
- Login as admin
- Navigate to an employee's profile page
- Should see employee name, avatar, position
- Should see all detail fields
- Should see "Edit" button
- Should see "Back to List" button

Test: Back to List button
- Click "Back to List" → navigates to `/employees`

## 4. Edit Employee — `tests/e2e/flows/employee-edit.spec.ts`

Test: Admin edits employee
- Login as admin
- Navigate to employee profile → click "Edit"
- Should see form pre-filled with current data
- Change first name and position
- Click save
- Should redirect to employee profile
- Profile shows updated data

Test: Edit validation
- Clear required field → submit → see validation error

## 5. Role Toggle — `tests/e2e/flows/employee-role.spec.ts`

Test: Admin toggles employee role
- Login as admin
- Navigate to employee profile (not own)
- Toggle role switch
- Role badge updates
- Refresh page → role persists

Test: Cannot toggle own role
- Navigate to own profile
- Role toggle is either hidden or disabled

## Cleanup

After create tests, clean up test employees to avoid polluting the database
for other test runs. Use `afterAll` or `afterEach` API calls to delete test data.

## Acceptance Criteria

- [ ] Full CRUD workflow tested end-to-end
- [ ] Employee list displays correctly with search
- [ ] Create form validates and submits
- [ ] Duplicate email rejected
- [ ] Edit form pre-fills and saves correctly
- [ ] Role toggle works and persists
- [ ] Mobile views tested (cards vs table)
- [ ] Tests are independent (can run in any order)
```
