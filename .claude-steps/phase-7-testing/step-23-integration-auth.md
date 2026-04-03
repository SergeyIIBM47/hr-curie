# Step 23 — Integration Tests: Authentication & Auth Guards

## Prompt for Claude Code

```
Write integration tests for the authentication system and auth guards.
Use Vitest with Testcontainers (real PostgreSQL). No mocks for database or auth logic.

## 1. Auth Flow — `tests/integration/api/auth.test.ts`

Use `setupTestDb()` to spin up a test database with seeded admin user.

Test CSRF endpoint:
- GET `/api/auth/csrf` → 200, returns JSON `{ csrfToken: string }`

Test Credentials login:
- POST `/api/auth/callback/credentials` with valid email/password → sets session cookie, redirects
- POST `/api/auth/callback/credentials` with wrong password → redirects to error
- POST `/api/auth/callback/credentials` with non-existent email → redirects to error

Test Session:
- GET `/api/auth/session` with valid session cookie → returns user object with id, email, role
- GET `/api/auth/session` without cookie → returns empty/null session

NOTE: For integration tests that call NextAuth endpoints directly, you may need to
test the `authorize` function in isolation by importing it from the auth config
and calling it with test credentials, since NextAuth handlers require a full
HTTP request/response cycle. Structure tests as:

```typescript
// Test authorize function directly
import { prisma } from test setup
import bcrypt from "bcryptjs"

// Create test user in DB, then verify:
// - authorize({ email, password }) returns user object for valid creds
// - authorize({ email, password }) returns null for invalid password
// - authorize({ email, password }) returns null for non-existent email
```

## 2. Auth Guards — `tests/integration/api/auth-guards.test.ts`

Test `requireApiAuth()`:
- Without session → returns `{ error: NextResponse }` with 401 status
- With valid session → returns `{ session }` with user data
- With valid session but wrong role → returns `{ error: NextResponse }` with 403 status

Mock `auth()` for these tests (auth guards are thin wrappers, DB tested above).

## 3. Password Security — `tests/integration/api/password.test.ts`

- Verify `passwordHash` is never returned in any API response
- Verify bcrypt hash matches expected password
- Verify different passwords produce different hashes

## Setup / Teardown

- Use `beforeAll` / `afterAll` for Testcontainers lifecycle
- Each test file gets its own container or uses transactions for isolation
- Set timeout to 60s for container startup

## Acceptance Criteria

- [ ] All tests pass with real PostgreSQL via Testcontainers
- [ ] `authorize()` tested with valid, invalid, and missing credentials
- [ ] Auth guards return correct status codes (401, 403)
- [ ] Password hash never leaks in responses
- [ ] Tests clean up containers after completion
```
