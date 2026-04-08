# Step 34 — Integration Tests: Employment Types API & Dashboard Data

## Prompt for Claude Code

```
Write integration tests for the employment types API and dashboard data endpoints.
Use Vitest with Testcontainers (real PostgreSQL). Mock only `auth()` for session simulation.

## 1. List Employment Types — `tests/integration/api/employment-types-list.test.ts`

Setup: seed DB with 2+ employment types (e.g., "CY", "CZ", "PL") and
assign at least 1 employee to "CY".

GET `/api/employment-types`:
- Admin session → 200, returns all employment types
- Employee session → 200, returns all employment types (any authenticated)
- No session → 401
- Response includes: id, name
- Response includes employee count or relation info (if exposed)
- Order is consistent (alphabetical or insertion order)

## 2. Create Employment Type — `tests/integration/api/employment-types-create.test.ts`

POST `/api/employment-types`:
- Admin session + valid body { name: "DE" } → 201, returns created type with id + name
- Admin session + empty name → 400, validation error
- Admin session + whitespace-only name → 400, validation error
- Admin session + duplicate name "CY" → 409, conflict error (unique constraint)
- Admin session + duplicate name case-sensitivity check (e.g., "cy" vs "CY")
- Employee session → 403, forbidden
- No session → 401

## 3. Delete Employment Type — `tests/integration/api/employment-types-delete.test.ts`

If a DELETE endpoint exists (DELETE `/api/employment-types/[id]`):
- Admin session + type with no employees → 200, type deleted
- Admin session + type with assigned employees → 400/409, cannot delete
- Employee session → 403
- No session → 401
- Non-existent ID → 404

If no DELETE endpoint, skip this section — UI uses disabled X button for types
with employees, but document that delete behavior needs API support.

## 4. Dashboard Data — `tests/integration/api/dashboard.test.ts`

If dashboard data is fetched via dedicated API route(s), test them.
If dashboard aggregates client-side from existing endpoints, test the
underlying queries instead.

Setup: seed DB with known counts:
- 5 employees total
- 2 pending leave requests
- 3 meetings this week
- 1 employee created this month

Test dashboard counts (ADMIN view):
- Total Employees count → 5
- Pending Requests count → 2
- Meetings This Week count → 3
- New This Month count → 1

Test dashboard lists (ADMIN view):
- Recent Leave Requests → returns up to 5, ordered by createdAt desc
- Upcoming Meetings → returns up to 5, ordered by scheduledAt asc
- Each item includes enough data for display (requester name, status, title, date)

Test EMPLOYEE view data:
- Employee session → returns only own leave requests and meetings
- Does NOT return counts for all employees

Role-based access:
- Admin session → 200, full dashboard data
- Employee session → 200, limited to own data
- No session → 401

## Setup / Teardown

- Single Testcontainers instance per file (beforeAll/afterAll)
- Seed test data: admin user, employees, employment types, leave requests, meetings
- Mock `auth()` to return admin/employee/null sessions as needed
- Clean up between tests to avoid count interference

## Acceptance Criteria

- [ ] Employment types CRUD tested with correct status codes
- [ ] Unique name constraint enforced
- [ ] Cannot delete type with assigned employees
- [ ] Any authenticated user can list employment types
- [ ] Only ADMIN can create/delete employment types
- [ ] Dashboard counts match seeded data
- [ ] Dashboard lists return correct items in correct order
- [ ] EMPLOYEE dashboard scoped to own data only
```
