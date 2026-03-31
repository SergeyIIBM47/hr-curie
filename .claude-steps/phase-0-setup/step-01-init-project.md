# Step 01 — Initialize Project

## Prompt for Claude Code

```
Create a new Next.js 16 project with App Router and TypeScript strict mode.
Use the latest 16.2.x version: npx create-next-app@latest

Project name: hr-curie
Package manager: npm

Install these dependencies:
- tailwindcss, postcss, autoprefixer, tailwindcss-animate
- prisma, @prisma/client
- next-auth@beta @auth/prisma-adapter
- bcryptjs, @types/bcryptjs
- zod, react-hook-form, @hookform/resolvers
- swr
- @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
- lucide-react
- date-fns
- clsx, tailwind-merge

Initialize Tailwind CSS with postcss.

Create this folder structure inside src/:
- app/(auth)/login/
- app/(dashboard)/
- app/api/
- components/ui/
- components/layout/
- components/employees/
- components/leave/
- components/calendar/
- components/shared/
- lib/
- lib/validations/
- hooks/
- types/

We use Testcontainers instead of docker-compose for database management.

Install additional dev dependencies:
- testcontainers, @testcontainers/postgresql
- tsx (for running scripts)
- vitest, @vitejs/plugin-react (for future tests)

Create src/lib/dev-db.ts — a script that:
1. Imports { PostgreSqlContainer } from "@testcontainers/postgresql"
2. Starts a PostgreSQL 15 container with reuse enabled:
   new PostgreSqlContainer("postgres:15-alpine")
     .withDatabase("hrcrm")
     .withUsername("hrcrm")
     .withPassword("localdev123")
     .withReuse()
     .start()
3. Gets the connection URI from container.getConnectionUri()
4. Writes/updates DATABASE_URL in .env.local (read existing file,
   replace or append the DATABASE_URL line, preserve other vars)
5. Logs: "PostgreSQL running on port XXXX"
6. Runs: npx prisma migrate dev --skip-generate (if migrations exist)

Create a test helper at tests/helpers/setup-db.ts:
1. Starts a NEW PostgreSQL container (not reused — fresh per test suite)
2. Runs prisma migrate deploy
3. Runs the seed
4. Exports the container and a prisma client for assertions
5. Exports a teardown function that stops the container

Add to package.json scripts:
  "db:start": "tsx src/lib/dev-db.ts",
  "dev": "npm run db:start && next dev",
  "db:seed": "npx prisma db seed",
  "db:studio": "npx prisma studio",
  "db:migrate": "npx prisma migrate dev",
  "test": "vitest"

Create .env.local with:
DATABASE_URL="postgresql://hrcrm:localdev123@localhost:5432/hrcrm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production"
(Note: DATABASE_URL will be overwritten by db:start with actual port)

Create .env.example with the same keys but placeholder values.
Add .env.local to .gitignore.

In next.config.ts, enable the React Compiler:
reactCompiler: true

Do NOT install shadcn/ui yet — we will do that in the next step.
```

## Test
- `npm run db:start` — PostgreSQL container starts, prints port
- `.env.local` has updated DATABASE_URL with correct port
- `npm run dev` starts Next.js (db:start runs first automatically)
- `next.config.ts` has `reactCompiler: true`
- Docker: `docker ps` shows a running postgres:15-alpine container

## Commit
```bash
git init && git add . && git commit -m "step-01: init project"
```
