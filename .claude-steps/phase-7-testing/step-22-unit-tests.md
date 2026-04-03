# Step 22 — Unit Tests: Utilities, Validations, Hooks

## Prompt for Claude Code

```
Write unit tests for all utility functions, Zod validation schemas, and custom hooks.
Use Vitest with Testing Library where needed. No mocking of external services — these
are pure logic tests.

## 1. Utilities — `src/lib/utils.test.ts`

Test `cn()`:
- Merges multiple class strings
- Resolves Tailwind conflicts (e.g., `p-2` + `p-4` → `p-4`)
- Handles undefined/null/false values

Test `getInitials()`:
- "Sofia Admin" → "SA"
- "John" → "J"
- "" → ""
- "A B C D" → "AB" (max 2 characters)

Test `formatDateUTC()`:
- Valid date → formatted string
- Handles Date objects and ISO strings

Test `isHttpUrl()`:
- "https://example.com" → true
- "http://example.com" → true
- "ftp://example.com" → false
- "" → false
- "not-a-url" → false

## 2. Auth Validation — `src/lib/validations/auth.test.ts`

Test `loginSchema`:
- Valid: { email: "test@test.com", password: "password123" } → passes
- Missing email → fails with email error
- Invalid email format → fails
- Missing password → fails with password error
- Password too short (< 6 chars) → fails
- Extra fields are stripped

## 3. Employee Validation — `src/lib/validations/employee.test.ts`

Test `createEmployeeSchema`:
- Valid complete object → passes
- Missing required field (firstName) → fails
- Invalid email format → fails
- Invalid date of birth → fails
- Optional fields omitted → passes
- Optional fields included → passes

Test `updateEmployeeSchema`:
- Partial update (only firstName) → passes
- Empty object → passes (all fields optional)
- Invalid email → fails
- Invalid field types → fails

## 4. useDebounce Hook — `src/hooks/use-debounce.test.ts`

Test `useDebounce`:
- Returns initial value immediately
- Does NOT update value before delay expires
- Updates value after delay expires
- Resets timer when value changes rapidly (only last value used)
- Works with different delay values

Use `renderHook` from Testing Library and `vi.useFakeTimers()`.

## Acceptance Criteria

- [ ] All tests pass: `npm run test:run`
- [ ] Each test file covers both happy path and error cases
- [ ] No external dependencies mocked (pure unit tests)
- [ ] Tests run in < 5 seconds total
```
