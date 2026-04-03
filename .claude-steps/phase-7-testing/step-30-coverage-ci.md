# Step 30 — Coverage Report & CI Integration

## Prompt for Claude Code

```
Verify test coverage meets 80% threshold and set up CI-ready test commands.

## 1. Coverage Verification

Run all tests with coverage:
```bash
npm run test:coverage
```

Review the coverage report and identify any gaps below 80%.
Focus on:
- `src/lib/` — all utilities and auth should be well-covered
- `src/app/api/` — all API routes should be covered by integration tests
- `src/components/employees/` — all employee components covered
- `src/app/(auth)/login/` — login form covered

If coverage is below 80%, add targeted tests for uncovered lines.

## 2. Test Summary Report

Create `tests/README.md` documenting:
- How to run each test layer (unit, integration, e2e)
- Prerequisites (Docker for Testcontainers, dev server for E2E)
- Test file naming conventions
- How to add new tests

## 3. CI Script

Create a script or document the CI test pipeline:

```bash
# Step 1: Unit + Component tests (fast, no deps)
npm run test:run

# Step 2: Integration tests (needs Docker)
npm run test:integration

# Step 3: E2E tests (needs running app + seeded DB)
npm run test:e2e
```

## 4. Pre-commit Check (optional)

Add to package.json scripts:
```json
"test:ci": "vitest run --coverage && vitest run --project integration"
```

## 5. Final Checklist

- [ ] `npm run test:run` — all unit + component tests pass
- [ ] `npm run test:integration` — all integration tests pass
- [ ] `npm run test:e2e` — all E2E tests pass
- [ ] Coverage ≥ 80% for branches, functions, lines, statements
- [ ] No skipped or commented-out tests
- [ ] Tests are deterministic (no flaky tests)
- [ ] Test data is isolated (tests don't depend on each other)
- [ ] No secrets or real credentials in test files
```
