# Testing Guide

## Test Architecture

Three test layers with increasing scope and execution cost:

| Layer | Tool | Location | Environment | Dependencies |
|---|---|---|---|---|
| Unit + Component | Vitest + Testing Library | `src/**/*.test.{ts,tsx}` | jsdom | None |
| Integration (API) | Vitest + Testcontainers | `tests/integration/**/*.test.ts` | Node | Docker |
| E2E | Playwright | `tests/e2e/flows/**/*.spec.ts` | Chromium/Firefox | Running dev server + seeded DB |

## Running Tests

### Unit & Component Tests (fast, no external deps)

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```

### Integration Tests (requires Docker)

```bash
npm run test:integration
```

Docker must be running for Testcontainers to start a PostgreSQL 15 container.
Timeout: 30s per test, 60s for setup hooks.

### E2E Tests (requires running app)

```bash
npm run dev           # Start dev server (seeds DB automatically)
npm run test:e2e      # Run all Playwright tests
npm run test:e2e:ui   # Interactive Playwright UI
```

Runs across Chromium, Firefox, and Mobile Chrome (Pixel 5 emulation).

### CI Pipeline (unit + integration)

```bash
npm run test:ci       # Unit tests with coverage + integration tests
# or
bash scripts/ci-test.sh  # Lint + unit tests with coverage + integration tests
```

## Prerequisites

| Requirement | For |
|---|---|
| Node.js 22+ | All tests |
| Docker | Integration tests (Testcontainers) |
| Dev server running | E2E tests |
| Seeded database | E2E tests |

## File Naming Conventions

| Pattern | Location | Purpose |
|---|---|---|
| `*.test.ts` | `src/**/*.test.ts` | Unit tests (pure logic) |
| `*.test.tsx` | `src/**/*.test.tsx` | Component tests (React) |
| `*.test.ts` | `tests/integration/api/` | API integration tests |
| `*.spec.ts` | `tests/e2e/flows/` | E2E flow tests |

## Adding New Tests

### Unit Test

1. Create `src/path/to/module.test.ts` next to the source file
2. Import from `vitest`: `describe`, `it`, `expect`, `vi`
3. Mock external dependencies with `vi.mock()`

### Component Test

1. Create `src/components/feature/component.test.tsx` next to the component
2. Use `@testing-library/react` with `render`, `screen`
3. Use `@testing-library/user-event` for interaction simulation
4. Mock `next/navigation`, `next-auth/react` as needed

### Integration Test

1. Create `tests/integration/api/feature.test.ts`
2. Use `setupTestDb()` / `teardownTestDb()` from `tests/helpers/setup-db.ts`
3. Use `createTestRequest()` from `tests/helpers/test-request.ts`
4. Mock auth with `tests/helpers/mock-auth.ts`

### E2E Test

1. Create `tests/e2e/flows/feature.spec.ts`
2. Import `{ test, expect }` from `../fixtures/auth` for authenticated tests
3. Use `adminPage` / `employeePage` fixtures for role-specific flows

## Coverage

- **Provider**: v8
- **Threshold**: 80% (branches, functions, lines, statements)
- **Report**: Generated in `coverage/` (gitignored)
- **Excluded**: test files, types, shadcn UI components, dev utilities, server components, API routes, infrastructure files

Server components and API routes are covered by integration and E2E tests, not unit tests. The coverage config reflects the unit test layer's responsibility.

## Test Helpers

| Helper | Location | Purpose |
|---|---|---|
| `vitest-setup.ts` | `tests/helpers/` | Imports jest-dom matchers, cleanup after each test |
| `mock-auth.ts` | `tests/helpers/` | Mock sessions (admin, employee, null) |
| `setup-db.ts` | `tests/helpers/` | Testcontainers PostgreSQL setup/teardown |
| `test-request.ts` | `tests/helpers/` | Create NextRequest objects for API testing |
| `auth.ts` | `tests/e2e/fixtures/` | Playwright auth fixtures + login helpers |
