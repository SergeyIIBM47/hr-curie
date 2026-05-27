# Step 39 — Data Models (Announcement, OnboardingPlan, JobRequisition)

> Phase 8.3 — see `docs/phase-8-redesign-plan.md` §8.3.

## Prompt for Claude Code

```
Extend prisma/schema.prisma with three new models + one Employee field, then
add Zod schemas, API routes, and seed data.

Prisma additions:
- enum AnnouncementTag  { POLICY TEAM HR EVENT }
- enum OnboardingStatus { ON_TRACK AT_RISK BLOCKED COMPLETE }
- enum StepStatus       { DONE CURRENT UPCOMING }
- enum JobStatus        { OPEN PAUSED FILLED }

- model Announcement { id, authorId→User, title, body, tag(AnnouncementTag),
  createdAt; @@map announcements }
- model OnboardingPlan { id, employeeId@unique→Employee, startDate, status,
  notes?, steps[], createdAt, updatedAt; @@map onboarding_plans }
- model OnboardingStep { id, planId→OnboardingPlan, ord:Int, label, status,
  completedAt?; @@unique([planId, ord]); @@map onboarding_steps }
- model JobRequisition { id, title, department, location?, status(JobStatus),
  priority:Boolean@default(false), openedAt@default(now), filledAt?,
  filledById?@unique; @@index([status]); @@map job_requisitions }

- Add to Employee: startDate DateTime? @map("start_date") @db.Date
- Migration backfill: UPDATE employees SET start_date = MAKE_DATE(start_year,1,1)
  WHERE start_date IS NULL;

Zod schemas:
- src/lib/validations/announcement.ts
- src/lib/validations/onboarding.ts
- src/lib/validations/job-requisition.ts

API routes (all use requireApiAuth):
- GET    /api/announcements?limit=N         — both roles
- POST   /api/announcements                  — ADMIN
- GET    /api/onboarding/active              — both (employee sees own; admin sees all)
- POST   /api/onboarding                     — ADMIN
- PATCH  /api/onboarding/[id]/step/[stepId]  — ADMIN
- GET    /api/jobs?status=OPEN&priority=…    — both
- POST   /api/jobs                           — ADMIN
- PATCH  /api/jobs/[id]                      — ADMIN

Seed (prisma/seed.ts):
- 3 announcements (POLICY, TEAM, HR tags) matching mockup tone
- 1 OnboardingPlan for any seeded employee with 5 steps:
  ord 1 "Offer signed" DONE, 2 "Paperwork" DONE, 3 "Equipment & access" CURRENT,
  4 "Day-one welcome" UPCOMING, 5 "30-day review" UPCOMING
- 7 JobRequisitions status=OPEN, two with priority=true
- Set Employee.startDate on existing employees so anniversaries land in
  next 14 days for at least one row (mockup shows "Lina Okafor · 3 years")

Integration tests in tests/integration/api/:
- announcements.test.ts, onboarding.test.ts, jobs.test.ts
- Cover: auth gating (employee can read; cannot POST), Zod rejection,
  CRUD round-trip. Use existing Testcontainers helper.
```

## Test
- `npm run db:migrate` clean against fresh DB; `npm run db:seed` populates new tables.
- `npm run test:integration` green.

## Commit
```bash
git add prisma src/lib/validations src/app/api/announcements \
  src/app/api/onboarding src/app/api/jobs tests/integration/api && \
  git commit -m "step-39: phase 8 data models — announcements, onboarding, jobs"
```
