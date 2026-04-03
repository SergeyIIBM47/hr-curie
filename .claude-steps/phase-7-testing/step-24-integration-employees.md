# Step 24 — Integration Tests: Employee API Routes

## Prompt for Claude Code

```
Write integration tests for all employee API routes.
Use Vitest with Testcontainers (real PostgreSQL). Mock only `auth()` for session simulation.

## 1. List Employees — `tests/integration/api/employees-list.test.ts`

Setup: seed DB with 3+ employees (mix of ADMIN and EMPLOYEE roles).

GET `/api/employees`:
- Admin session → 200, returns all employees
- Employee session → 200, returns only own record
- No session → 401
- Response includes: id, firstName, lastName, workEmail, position, department, avatarUrl, employmentType
- Response does NOT include: passwordHash

GET `/api/employees?q=Sofia`:
- Admin session → returns filtered results matching name
- Search matches: firstName, lastName, workEmail, position, department
- Search is case-insensitive
- Empty search → returns all

## 2. Create Employee — `tests/integration/api/employees-create.test.ts`

POST `/api/employees`:
- Admin session + valid body → 201, returns created employee
- Admin session + missing required fields → 400, returns Zod errors
- Admin session + duplicate workEmail → 409, returns conflict error
- Employee session → 403, forbidden
- No session → 401
- Password is hashed in database (verify with bcrypt.compare)
- Both User and Employee records are created (transaction)
- Created user has EMPLOYEE role by default

Test valid body:
```json
{
  "firstName": "Test",
  "lastName": "User",
  "workEmail": "test@company.com",
  "password": "testpass123",
  "employmentTypeId": "<seeded-type-id>",
  "dateOfBirth": "1995-06-15",
  "actualResidence": "Prague, CZ",
  "startYear": 2024
}
```

## 3. Get Employee — `tests/integration/api/employees-get.test.ts`

GET `/api/employees/[id]`:
- Admin session → 200, returns full employee detail
- Employee session + own ID → 200, returns own detail
- Employee session + other's ID → 403
- Non-existent ID → 404
- Invalid ID format → 404
- Response includes employment type name
- Response does NOT include passwordHash

## 4. Update Employee — `tests/integration/api/employees-update.test.ts`

PUT `/api/employees/[id]`:
- Admin session + valid body → 200, returns updated employee
- Admin session + partial body (only firstName) → 200, only firstName changes
- Admin session + invalid body → 400
- Employee session → 403
- No session → 401
- Non-existent ID → 404
- Cannot update email to existing email → 409

## 5. Role Toggle — `tests/integration/api/employees-role.test.ts`

PUT `/api/employees/[id]/role`:
- Admin can change EMPLOYEE → ADMIN
- Admin can change ADMIN → EMPLOYEE
- Admin cannot change own role → 400/403
- Employee cannot change roles → 403
- Non-existent user → 404

## Setup / Teardown

- Single Testcontainers instance per file (beforeAll/afterAll)
- Seed test data in beforeEach or use unique data per test
- Mock `auth()` to return admin/employee/null sessions as needed

## Acceptance Criteria

- [ ] All CRUD operations tested with correct status codes
- [ ] Role-based access control verified for every endpoint
- [ ] Validation errors return meaningful Zod error messages
- [ ] passwordHash never appears in any response body
- [ ] Duplicate email handling tested
- [ ] Search functionality tested with various queries
```
