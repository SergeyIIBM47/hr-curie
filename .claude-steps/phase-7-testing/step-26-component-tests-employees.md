# Step 26 — Component Tests: Employee Components

## Prompt for Claude Code

```
Write component tests for all employee-related components.
Use Vitest + Testing Library + jsdom. Mock fetch and router.

## 1. EmployeeSearch — `src/components/employees/employee-search.test.tsx`

- Renders search input with placeholder
- Typing triggers onSearch callback after debounce delay
- Rapid typing only triggers one callback (debounce works)
- Clearing input calls onSearch with empty string

## 2. EmployeeTable — `src/components/employees/employee-table.test.tsx`

Setup: provide mock employee array with 3+ employees.

- Renders table headers: Name, Email, Role, Department, Employment Type
- Renders correct number of rows
- Each row shows employee avatar (or initials), name, email
- Role is displayed as badge (ADMIN / EMPLOYEE)
- Rows are links to `/employees/[id]`
- Empty state: shows "No employees found" when list is empty

## 3. EmployeeCard — `src/components/employees/employee-card.test.tsx`

- Renders avatar (or initials fallback)
- Renders employee name and email
- Renders position and department
- Card is clickable → navigates to employee profile

## 4. EmployeeForm — `src/components/employees/employee-form.test.tsx`

Create mode:
- Renders all required field inputs (firstName, lastName, workEmail, password, etc.)
- Renders optional field inputs (phone, position, department, etc.)
- Submit with empty required fields → shows validation errors
- Submit with valid data → calls onSubmit with form data
- Shows loading state during submission
- Employment type dropdown populated from props

Edit mode:
- Pre-fills all fields with existing employee data
- Password field is not shown in edit mode
- Submit sends only changed fields
- Cancel button navigates back

## 5. RoleToggle — `src/components/employees/role-toggle.test.tsx`

- Renders switch in correct state for ADMIN
- Renders switch in correct state for EMPLOYEE
- Click toggle → calls API to change role
- Shows loading state during API call
- Updates UI on success
- Shows error toast on failure

## 6. DetailField — `src/components/shared/detail-field.test.tsx`

- Renders label and value
- Handles undefined value (shows dash or empty)
- Handles long text without breaking layout

## Mocking Strategy

- Mock `next/navigation` (useRouter, useParams)
- Mock `fetch` for API calls in RoleToggle
- Mock `sonner` toast for notifications
- Provide mock data matching EmployeeListItem type

## Acceptance Criteria

- [ ] All employee components render correctly with mock data
- [ ] Form validation tested in both create and edit modes
- [ ] Table and card render correct data for each employee
- [ ] Loading and error states tested
- [ ] Empty states handled
```
