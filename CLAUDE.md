# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HR CRM system for employee management, leave requests, and meeting scheduling. This is a **blueprint-stage project** — the source code has not been implemented yet. All architecture and specifications are defined in two planning documents:

- `hr-system-amplify-blueprint.md` — complete technical blueprint (architecture, Prisma schema, API routes, auth, deployment)
- `docs/design-system.md` — Cobalt/Frost design system (colors, typography, spacing, components)

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
