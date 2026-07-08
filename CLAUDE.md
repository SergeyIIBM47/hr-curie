# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


# Coding Rules

Shared engineering guidelines applied across HRZN AI workflows (task-flow, deploy, pr-review, etc). Distilled from Karpathy's LLM-coding observations plus team conventions.

These bias toward caution. Use judgment on trivial tweaks; apply rigorously on anything non-trivial.

## 1. Think Before Coding

State assumptions explicitly. If uncertain, ask rather than guess. Present multiple interpretations when ambiguity exists. Push back when a simpler approach exists. Stop when confused — name what's unclear instead of charging ahead.

## 2. Simplicity First

Write the minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.

Test: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused. Leave pre-existing dead code unless asked.

Test: Every changed line should trace directly to the user's request (or the Jira task).

## 4. Goal-Driven Execution

Transform tasks into verifiable goals before writing code:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step work, write a brief `step → verify` plan. Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.


## Project Overview

HR CRM system for employee management, leave requests, and meeting scheduling. The app is implemented (redesign-v1, version 0.2.0). Key references:

- `docs/design-system.md` — canonical Cobalt/Frost design system (colors, typography, spacing, components); the implementation source of truth for all styling
- `docs/redesign-baseline/README.md` — visual regression baseline (screenshots per route + mockup mapping); diff against it in PRs that touch styling or layout
- `hr-system-amplify-blueprint.md` — original technical blueprint (architecture, Prisma schema, API routes, auth, deployment); historical reference

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript strict mode
- **UI:** Tailwind CSS + shadcn/ui, Cobalt/Frost design system
- **ORM:** Prisma 5 with PostgreSQL 15
- **Auth:** NextAuth.js v5 (credentials provider, JWT strategy, ADMIN/EMPLOYEE roles)
- **Validation:** Zod (shared between API routes and forms)
- **Client data fetching:** SWR
- **File storage:** AWS S3 (presigned URLs for avatar uploads)
- **Calendar:** Google Calendar API integration
- **Hosting:** AWS Amplify Gen 2 (Lambda + CloudFront + S3)

## Build & Development Commands

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Next.js lint

npm run db:migrate       # prisma migrate dev
npm run db:seed          # Seed default admin + employment types
npm run db:studio        # Prisma Studio (visual DB browser)
npm run db:reset         # prisma migrate reset
```

## Local Setup

1. `npm install`
2. `docker-compose up` — starts PostgreSQL 15 on port 5432
3. Copy `.env.example` to `.env.local` and fill in values
4. `npx prisma generate && npm run db:migrate && npm run db:seed`
5. `npm run dev`
6. Login: `sofia@company.com` / `qwerty123#`

## Architecture

### Data Flow

```
Route 53 → CloudFront CDN → Static (S3) + Dynamic (Lambda)
                                            ↓
                              RDS PostgreSQL / S3 Avatars / Google Calendar API
```

Amplify Gen 2 auto-splits Next.js into static assets (S3/CDN) and dynamic routes (Lambda). No manual Lambda configuration needed.

### Source Layout (planned)

```
src/
├── app/
│   ├── (auth)/login/          # Public login page
│   ├── (dashboard)/           # Protected routes (sidebar layout)
│   │   ├── employees/         # CRUD, ADMIN-only list/create/edit
│   │   ├── leave/             # Request, history, manage (ADMIN approve/reject)
│   │   ├── calendar/          # Month/week views, schedule meetings
│   │   └── settings/          # Employment types (ADMIN)
│   └── api/                   # REST endpoints mirroring above domains
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── layout/                # Sidebar, topbar, mobile nav
│   ├── employees/             # Domain-specific components
│   ├── leave/
│   ├── calendar/
│   └── shared/                # Loading skeletons, empty states, dialogs
├── lib/
│   ├── prisma.ts              # Singleton client
│   ├── auth.ts                # NextAuth config
│   ├── auth-guard.ts          # requireApiAuth() helper for API routes
│   ├── s3.ts                  # Presigned URL generation
│   └── validations/           # Zod schemas per domain
├── hooks/                     # SWR hooks + useDebounce
└── types/                     # Shared types + NextAuth augmentation
```

### Key Patterns

- **Server Components by default** — only add `"use client"` when interactivity is needed
- **Auth guard on every API route** — call `requireApiAuth(role?)` at the top of each handler
- **Prisma singleton** — `globalThis` pattern to prevent connection exhaustion in dev
- **`passwordHash` never leaves the server** — exclude from all Prisma selects that return to client
- **`connection_limit=5`** in DATABASE_URL — required for serverless Lambda
- **Immutable data patterns** — create new objects, never mutate in place

### Roles & Access

| Capability | ADMIN | EMPLOYEE |
|---|---|---|
| Employee CRUD | Full | View own profile only |
| Leave requests | Approve/reject all | Create/view own |
| Calendar | Schedule meetings | View own meetings |
| Settings | Manage employment types | No access |

### Database Models

6 Prisma models: `User`, `Employee` (1:1 with User), `EmploymentType`, `LeaveRequest`, `Meeting`, `MeetingParticipant`. Schema uses `@map` for snake_case DB columns. See `hr-system-amplify-blueprint.md` for full schema.

## Environment Variables

```
DATABASE_URL=postgresql://hrcrm:password@localhost:5432/hrcrm?connection_limit=5
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
AWS_REGION=eu-central-1
S3_BUCKET_NAME=hr-crm-avatars-dev
GOOGLE_CLIENT_ID=<from google cloud console>
GOOGLE_CLIENT_SECRET=<from google cloud console>
```

## Implementation Phases

The blueprint defines 6 phases with 20 implementation prompts. Follow them in order:

1. **Foundation** — project init, Prisma schema, NextAuth, login page
2. **Layout + Employee CRUD** — dashboard layout, employee list/create/edit, avatar upload
3. **Leave Management** — request form, history, admin approval queue
4. **Calendar + Meetings** — Google Calendar integration, calendar UI, scheduling
5. **Settings + Polish** — employment types, dashboard overview, responsive audit
6. **Amplify Deploy** — amplify.yml, security audit, staging deployment
