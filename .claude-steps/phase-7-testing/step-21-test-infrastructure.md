# Step 21 — Test Infrastructure Setup

## Prompt for Claude Code

```
Set up the complete testing infrastructure for the HR Curie project.

## 1. Vitest Configuration

Create `vitest.config.ts` at the project root:
- Use `@vitejs/plugin-react` for JSX support
- Configure path aliases matching tsconfig (`@/` → `src/`)
- Set up three test projects:
  - **unit**: files matching `src/**/*.test.ts(x)`, jsdom environment
  - **integration**: files matching `tests/integration/**/*.test.ts`, node environment, 30s timeout
- Set global coverage thresholds: 80% branches, 80% functions, 80% lines, 80% statements
- Coverage provider: v8
- Exclude: node_modules, .next, coverage, tests/e2e

## 2. Install Dependencies

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react jsdom
npm install -D @playwright/test
```

## 3. Playwright Configuration

Create `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Projects: chromium, firefox, mobile chrome
- Web server: `npm run dev` with auto-start
- Output directories: `test-results/`, `playwright-report/`
- Retries: 1 on CI, 0 locally

## 4. Test Helper: Vitest Setup

Create `tests/helpers/vitest-setup.ts`:
- Import `@testing-library/jest-dom/vitest`
- Add any global test utilities

## 5. Test Helper: API Route Testing

Create `tests/helpers/test-request.ts`:
- Helper to create `NextRequest` objects for API route testing
- Support for setting headers, cookies, body, method, search params
- Helper to extract JSON response from `NextResponse`

## 6. Test Helper: Auth Mocking

Create `tests/helpers/mock-auth.ts`:
- Helper to mock `auth()` from `@/lib/auth` for component/API tests
- Provide preset sessions: `adminSession`, `employeeSession`, `nullSession`
- Use `vi.mock` with configurable return values

## 7. Test Directory Structure

```
tests/
├── helpers/
│   ├── setup-db.ts          # (existing) Testcontainers setup
│   ├── vitest-setup.ts      # Global test setup
│   ├── test-request.ts      # API route test helpers
│   └── mock-auth.ts         # Auth mock helpers
├── integration/
│   ├── api/                 # API route integration tests
│   └── db/                  # Database operation tests
└── e2e/
    ├── fixtures/            # Playwright fixtures
    └── flows/               # E2E test scenarios
```

## 8. Package.json Scripts

Add these scripts:
```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage",
"test:integration": "vitest run --project integration",
"test:e2e": "npx playwright test",
"test:e2e:ui": "npx playwright test --ui"
```

## 9. Update .gitignore

Add:
```
coverage/
test-results/
playwright-report/
```

## Acceptance Criteria

- [ ] `npm run test:run` executes with 0 failures (no tests yet, but config works)
- [ ] Path aliases resolve correctly in test files
- [ ] Testcontainers helper still works
- [ ] Playwright config validates: `npx playwright test --list`
- [ ] Coverage report generates (empty)
```
