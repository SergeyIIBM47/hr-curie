#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# HR Curie — Claude Code Step Files Setup Script
# Run: cd hr-curie && bash setup-steps.sh
# ============================================================

echo "🚀 Creating HR Curie Claude Code step files..."

# --- Create directory structure ---
mkdir -p .claude-steps/phase-0-setup
mkdir -p .claude-steps/phase-1-login-layout
mkdir -p .claude-steps/phase-2-employees
mkdir -p .claude-steps/phase-3-leave
mkdir -p .claude-steps/phase-4-calendar
mkdir -p .claude-steps/phase-5-settings
mkdir -p .claude-steps/phase-6-deploy

# ============================================================
# CONVENTIONS.md (project root)
# ============================================================
cat > CONVENTIONS.md << 'ENDOFFILE'
# HR Curie — Project Conventions

## Stack
- Next.js 16 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui
- Prisma ORM with PostgreSQL
- NextAuth v5 (Auth.js) with credentials + JWT
- Zod for all validation (API + forms)
- SWR for client-side data fetching
- Deployed via AWS Amplify Gen 2

## Architecture Rules
- Server Components by default; add "use client" only when needed
- API routes handle auth via requireApiAuth() helper
- Pages handle auth via requireAuth() helper (server-side redirect)
- Never import prisma in client components
- Never expose passwordHash in any API response
- Always validate inputs with Zod before database operations
- All request APIs are async (params, searchParams, cookies, headers must use await)

## Next.js 16 Specifics
- Use proxy.ts (NOT middleware.ts — renamed in Next.js 16)
- Turbopack is the default bundler — no flags needed
- React Compiler is enabled via reactCompiler: true in next.config.ts
- Export proxy function as named export `proxy` (not `middleware`)

## File Conventions
- Components: PascalCase files (EmployeeCard.tsx)
- Utilities: camelCase files (formatDate.ts)
- Pages: lowercase folders matching URL segments
- Shared types in src/types/index.ts (derived from Prisma when possible)

## Component Guidelines
- Use shadcn/ui primitives, never install additional UI libraries
- Responsive: mobile-first, sidebar collapses at md breakpoint
- Loading states: use Suspense + loading-skeleton.tsx
- Error states: use error.tsx boundary files
- Forms: react-hook-form + zodResolver, never uncontrolled

## API Routes
- Always start with requireApiAuth(optionalRole)
- Parse body with Zod .safeParse(), return 400 on failure
- Use Prisma transactions for multi-table writes
- Return consistent shape: { data } on success, { error, details? } on failure
- Never return 500 with stack traces

## Apple HIG Design Rules
- Follow Apple HIG: filled inputs (gray bg, no border), 44px min touch targets
- System font stack (never import custom fonts)
- Apple blue (#007AFF) as primary accent
- 10px card radius, shadows not borders for depth
- Liquid Glass (glass-heavy) only on sidebar and top bar
- Status badges: PENDING=orange, APPROVED=green, REJECTED=red
- Animations: cubic-bezier(0.25, 0.1, 0.25, 1), 250ms standard, 150ms hover

## Security Checklist
- [ ] Every API route calls requireApiAuth()
- [ ] ADMIN-only routes pass "ADMIN" to requireApiAuth
- [ ] Employee endpoints verify userId ownership for non-admin
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] User.passwordHash excluded from all API responses
- [ ] File uploads validate content type + size (5MB max)
- [ ] Self-demotion prevented (admin can't remove own admin role)

## Commit Messages
Follow conventional commits: feat|fix|chore|docs(scope): description
ENDOFFILE

echo "  ✅ CONVENTIONS.md"

# ============================================================
# DESIGN_SYSTEM.md (project root) — abbreviated reference
# ============================================================
cat > DESIGN_SYSTEM.md << 'ENDOFFILE'
# HR Curie — Apple HIG Design System Reference

## Core Principles (Apple HIG)
- Hierarchy: clear visual order, important content dominant
- Harmony: feels native on Apple devices, rounded corners, system fonts
- Consistency: patterns learned in one area transfer everywhere

## Color System — Apple System Colors

### Primary
- apple-blue: #007AFF (primary action, links, active)
- apple-green: #34C759 (success, approved)
- apple-red: #FF3B30 (error, destructive, rejected)
- apple-orange: #FF9500 (warning, pending)
- apple-indigo: #5856D6 (accent, calendar events)
- apple-purple: #AF52DE (tags, categories)
- apple-teal: #5AC8FA (informational)
- apple-yellow: #FFCC00 (highlight)
- apple-pink: #FF2D55 (urgent, badges)

### Gray Scale (Light Mode)
- gray-1: #8E8E93 (tertiary text, disabled)
- gray-2: #AEAEB2 (placeholder text)
- gray-3: #C7C7CC (borders, dividers)
- gray-4: #D1D1D6 (input borders)
- gray-5: #E5E5EA (grouped bg, hover)
- gray-6: #F2F2F7 (page bg, sidebar bg)

### Dark Mode Variants
- blue: #0A84FF, green: #30D158, red: #FF453A
- orange: #FF9F0A, indigo: #5E5CE6, purple: #BF5AF2
- gray-1: #8E8E93, gray-2: #636366, gray-3: #48484A
- gray-4: #3A3A3C, gray-5: #2C2C2E, gray-6: #1C1C1E

### Semantic Colors
- surface: #FFFFFF (cards), surface-secondary: #F2F2F7 (page bg)
- label-primary: #000000, label-secondary: #3C3C43
- separator: rgba(60,60,67,0.29), separator-opaque: #C6C6C8
- fill-primary: rgba(120,120,128,0.2) — input backgrounds

## Typography — System Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, system-ui,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji";
```

### Scale
- apple-large-title: 34px/41px, weight 700, tracking 0.37px
- apple-title-1: 28px/34px, weight 700, tracking 0.36px
- apple-title-2: 22px/28px, weight 700, tracking 0.35px
- apple-title-3: 20px/25px, weight 600, tracking 0.38px
- apple-headline: 17px/22px, weight 600, tracking -0.41px
- apple-body: 17px/22px, weight 400, tracking -0.41px
- apple-callout: 16px/21px, weight 400, tracking -0.32px
- apple-subheadline: 15px/20px, weight 400, tracking -0.24px
- apple-footnote: 13px/18px, weight 400, tracking -0.08px
- apple-caption-1: 12px/16px, weight 400, tracking 0px
- apple-caption-2: 11px/13px, weight 400, tracking 0.07px

## Border Radius
- apple-xs: 6px (badges), apple-sm: 8px (buttons, inputs)
- apple-md: 10px (cards), apple-lg: 12px (large cards)
- apple-xl: 14px (modals), apple-2xl: 18px (panels)

## Shadows (layered for natural depth)
- apple-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)
- apple-md: 0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
- apple-lg: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)
- apple-xl: 0 20px 60px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.04)

## Liquid Glass (use sparingly: sidebar, topbar only)
- glass: bg white/72%, backdrop-filter blur(20px) saturate(180%)
- glass-heavy: bg gray-6/85%, backdrop-filter blur(40px) saturate(200%)
- glass-subtle: bg white/88%, backdrop-filter blur(10px) saturate(150%)
- glass-overlay: bg black/30%, backdrop-filter blur(40px) saturate(120%)

## Transitions
- Standard: 250ms cubic-bezier(0.25, 0.1, 0.25, 1)
- Interactive (hover): 150ms same easing
- Spring (modals): 350ms cubic-bezier(0.2, 0.8, 0.2, 1)

## Component Specs
- Buttons: h-[44px] min, rounded-[8px], font-semibold
- Inputs: h-[44px], bg fill-primary, no border, rounded-[8px]
- Cards: bg white, rounded-[10px], shadow-apple-sm, p-5
- Sidebar: 260px wide, glass-heavy, border-right separator-opaque
- Topbar: 52px tall, glass, sticky, border-bottom separator
- Touch targets: 44x44px minimum everywhere
- Icons: 20x20 nav, 16x16 buttons, 48x48 empty states (Lucide React)

## Status Badges
- PENDING: bg-orange/15, text-orange, border-orange/30
- APPROVED: bg-green/15, text-green, border-green/30
- REJECTED: bg-red/15, text-red, border-red/30
- ADMIN: bg-indigo/15, text-indigo
- EMPLOYEE: bg-gray-5, text-gray-1
- All: rounded-[6px] px-2.5 py-0.5 text-[12px] font-semibold uppercase

## Responsive Breakpoints
- Mobile: <768px — sidebar hidden (sheet), single column, cards
- Tablet: 768-1024px — sidebar overlay, 2-column grids
- Desktop: >1024px — sidebar fixed, full tables, max-w-1200px
ENDOFFILE

echo "  ✅ DESIGN_SYSTEM.md"

# ============================================================
# .claude-steps/README.md
# ============================================================
cat > .claude-steps/README.md << 'ENDOFFILE'
# HR Curie — Claude Code Step-by-Step Implementation

## How to Use

1. CONVENTIONS.md and DESIGN_SYSTEM.md are in the project root
2. Open Claude Code in your terminal
3. For each step, run: `cat .claude-steps/phase-X/step-XX-name.md`
   and paste the PROMPT section to Claude Code
4. After each step: test → commit → next step

## Quick Reference

| Step | ~Time  | What You Build                        |
|------|--------|---------------------------------------|
| 01   | 30 min | Next.js 16 project + folders + Docker |
| 02   | 45 min | shadcn/ui + Apple design system       |
| 03   | 30 min | Prisma schema + seed                  |
| 04   | 45 min | NextAuth v5 + proxy                   |
| 05   | 45 min | Login page                            |
| 06   | 1.5 hr | Sidebar + topbar + mobile nav         |
| 07   | 45 min | Profile page                          |
| 08   | 1.5 hr | Employee list + search                |
| 09   | 1.5 hr | Create employee form + API            |
| 10   | 1 hr   | Employee profile view                 |
| 11   | 1.5 hr | Edit employee + role management       |
| 12   | 1 hr   | Avatar upload (S3 / fallback)         |
| 13   | 45 min | Empty states + loading skeletons      |
| 14   | 45 min | Leave API (CRUD + approve/reject)     |
| 15   | 45 min | Leave request form                    |
| 16   | 1 hr   | Leave history page                    |
| 17   | 1.5 hr | Leave approval page (admin)           |
| 18   | 30 min | Meeting API                           |
| 19   | 1 hr   | Schedule meeting dialog               |
| 20   | 1.5 hr | Calendar month view                   |
| 21   | 45 min | Employment type management            |
| 22   | 1 hr   | Dashboard overview page               |
| 23   | 2 hr   | Responsive audit + a11y               |
| 24   | 1 hr   | Security hardening                    |
| 25   | 45 min | Amplify config + deployment docs      |
| 26   | 1 hr   | README + final review                 |
|      |**~25hr**|                                      |
ENDOFFILE

echo "  ✅ .claude-steps/README.md"

# ============================================================
# PHASE 0 — Setup
# ============================================================

cat > .claude-steps/phase-0-setup/step-01-init-project.md << 'ENDOFFILE'
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
ENDOFFILE

echo "  ✅ step-01"

# --------------------------------------------------
cat > .claude-steps/phase-0-setup/step-02-design-system.md << 'ENDOFFILE'
# Step 02 — Install shadcn/ui + Apple Design System

## Prompt for Claude Code

```
Read the DESIGN_SYSTEM.md file in the project root. Use its exact
color values, typography scale, border radius, shadows, and transitions.

Initialize shadcn/ui with: Style: New York, Base color: Neutral, CSS variables: yes

Install these shadcn/ui components:
button, input, label, card, table, dialog, badge, avatar,
select, textarea, dropdown-menu, sheet, tabs, calendar,
popover, separator, skeleton, toast, sonner, tooltip, switch

Replace tailwind.config.ts with the Apple HIG configuration from
DESIGN_SYSTEM.md. Key values:
- Apple system colors (blue #007AFF, green #34C759, red #FF3B30, etc.)
- Apple 6-step gray scale (gray-1 #8E8E93 through gray-6 #F2F2F7)
- Semantic aliases (surface, label, separator, fill)
- Typography scale (apple-large-title 34px through apple-caption-2 11px)
- Border radius (apple-xs 6px through apple-3xl 22px)
- Layered shadows (apple-sm through apple-xl)
- System font stack (-apple-system, BlinkMacSystemFont, system-ui, etc.)
- Apple easing curve: cubic-bezier(0.25, 0.1, 0.25, 1)
- Backdrop blur values for Liquid Glass

Create src/app/globals.css with:
1. Tailwind imports (@tailwind base, components, utilities)
2. @layer components with Liquid Glass CSS classes:
   .glass — white 72% + blur 20px + saturate 180% + border white/18%
   .glass-heavy — gray-6 85% + blur 40px + saturate 200% + border white/30%
   .glass-subtle — white 88% + blur 10px + saturate 150%
   .glass-button — white 50% + blur 12px + saturate 160%
   .glass-overlay — black 30% + blur 40px + saturate 120%
   Each with .dark variant

Create src/lib/utils.ts:
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Test
- `npm run dev` — page loads with system font
- Inspect: `bg-apple-blue` → #007AFF, `text-apple-body` → 17px

## Commit
```bash
git add . && git commit -m "step-02: apple design system and shadcn-ui"
```
ENDOFFILE

echo "  ✅ step-02"

# --------------------------------------------------
cat > .claude-steps/phase-0-setup/step-03-database.md << 'ENDOFFILE'
# Step 03 — Database Schema + Seed

## Prompt for Claude Code

```
Initialize Prisma: npx prisma init

Replace prisma/schema.prisma with this schema:

Models (all use @@map for snake_case tables, @map for snake_case columns):

1. User: id cuid, email unique, passwordHash @map("password_hash"),
   role enum Role (ADMIN/EMPLOYEE) default EMPLOYEE, timestamps.
   Relations: employee 1:1, leaveRequests 1:many, meetings via participant.

2. Employee: id cuid, userId unique → User, firstName, lastName,
   employmentTypeId → EmploymentType, workEmail unique,
   dateOfBirth @db.Date, actualResidence, startYear Int.
   Optional: phone, position, department, location, healthInsurance,
   education, certifications, linkedinUrl, tshirtSize, avatarUrl.
   Indexes on lastName, department.

3. EmploymentType: id cuid, name unique. Relation: employees.

4. LeaveRequest: id cuid, userId → User, type enum LeaveType
   (SICK_LEAVE/DAY_OFF/VACATION), status enum LeaveStatus
   (PENDING/APPROVED/REJECTED) default PENDING, startDate @db.Date,
   endDate @db.Date, reason optional, reviewedBy optional,
   reviewedAt optional. Indexes on userId, status.

5. Meeting: id cuid, title, type String, scheduledAt DateTime,
   durationMinutes Int default 30, googleEventId optional,
   notes optional, createdBy String. Relation: participants.
   Index on scheduledAt.

6. MeetingParticipant: id cuid, meetingId → Meeting, userId → User.
   @@unique([meetingId, userId])

Create prisma/seed.ts:
1. Upsert employment types: "CY", "GIG", "Contractor"
2. If no ADMIN exists: create user sofia@company.com with password
   "qwerty123#" hashed via bcrypt (12 rounds), role ADMIN.
   Create Employee: Sofia Admin, CY, dateOfBirth 1990-01-01,
   residence "Prague, CZ", startYear 2024, position "HR Manager".

Add to package.json: "prisma": { "seed": "tsx prisma/seed.ts" }
Install tsx as dev dependency.

Create src/lib/prisma.ts — singleton using globalThis pattern.

Run: npm run db:start (starts Testcontainer, updates .env.local)
Run: npx prisma migrate dev --name initial_schema
Run: npx prisma db seed
```

## Test
```bash
npx prisma studio
```
Verify: all tables, Sofia exists, password starts with $2a$ or $2b$

## Commit
```bash
git add . && git commit -m "step-03: database schema and seed"
```
ENDOFFILE

echo "  ✅ step-03"

# --------------------------------------------------
cat > .claude-steps/phase-0-setup/step-04-authentication.md << 'ENDOFFILE'
# Step 04 — Authentication (NextAuth v5)

## Prompt for Claude Code

```
Create src/lib/auth.ts — NextAuth v5 config:
- CredentialsProvider: email + password
- authorize: parse with Zod loginSchema, find user by email,
  bcrypt compare, return {id, email, role, name, image} or null
- JWT callback: store userId + role in token
- Session callback: expose userId + role on session.user
- Pages: { signIn: "/login" }, strategy: "jwt", maxAge: 86400

Create src/types/next-auth.d.ts — module augmentation:
- User: add role: Role
- Session.user: add id: string, role: Role
- JWT: add userId: string, role: Role

Create src/lib/auth-guard.ts:
- requireAuth(requiredRole?) — server components, redirects
- requireApiAuth(requiredRole?) — API routes, returns {session} or {error}

Create src/lib/validations/auth.ts — loginSchema (Zod)

Create src/app/api/auth/[...nextauth]/route.ts — export handlers

Create src/proxy.ts (NEXT.JS 16 — NOT middleware.ts):
- Export named function `proxy` (not `middleware`)
- Public: ["/login"] — redirect /profile if logged in
- Admin-only: ["/employees", "/leave/manage", "/settings"]
- All others require auth
- Matcher: exclude _next/static, _next/image, favicon.ico, api/health

Create src/app/api/health/route.ts — returns {status:"ok", timestamp}
```

## Test
```bash
curl http://localhost:3000/api/health
# → {"status":"ok"}
# Visit / → redirects to /login (404 ok)
```

## Commit
```bash
git add . && git commit -m "step-04: authentication setup"
```
ENDOFFILE

echo "  ✅ step-04"

# ============================================================
# PHASE 1 — Login & Layout
# ============================================================

cat > .claude-steps/phase-1-login-layout/step-05-login-page.md << 'ENDOFFILE'
# Step 05 — Login Page

## Prompt for Claude Code

```
Create src/app/(auth)/layout.tsx:
- Center content: flex min-h-screen items-center justify-center
- Background: bg-[#F2F2F7]

Create src/app/(auth)/login/page.tsx (server component):
- Check auth(), redirect /profile if logged in

Create src/app/(auth)/login/login-form.tsx (client component):
Apple HIG login card:
- White card, max-w-[400px], rounded-[14px], shadow-apple-lg, p-8
- "HR Curie" — text-[28px] font-bold text-[#007AFF] centered, mb-6
- Email input: bg-[rgba(120,120,128,0.12)], no border, rounded-[8px],
  h-[44px], px-3, text-[17px], placeholder "Email"
- Password input: same + Eye/EyeOff toggle (lucide-react)
- 16px gap between inputs
- Sign In button: w-full h-[44px] bg-[#007AFF] text-white rounded-[8px]
  font-semibold text-[17px]. Hover: brightness-110%. Active: scale-[0.98].
  Transition: 150ms cubic-bezier(0.25,0.1,0.25,1)
- Loading: Loader2 animate-spin replacing button text
- Error: text-[13px] text-[#FF3B30] mt-2 below button
- react-hook-form + zodResolver + loginSchema
- signIn("credentials", { redirect: true, callbackUrl: "/" })
```

## Test
- `http://localhost:3000/login` — centered card on gray bg
- sofia@company.com / qwerty123# → redirects
- Wrong password → red error
- Visual: rounded corners, filled inputs, Apple blue button

## Commit
```bash
git add . && git commit -m "step-05: login page"
```
ENDOFFILE

echo "  ✅ step-05"

# --------------------------------------------------
cat > .claude-steps/phase-1-login-layout/step-06-dashboard-layout.md << 'ENDOFFILE'
# Step 06 — Dashboard Layout (Sidebar + Top Bar)

## Prompt for Claude Code

```
Create src/app/(dashboard)/layout.tsx (server component):
- requireAuth(), pass session to sidebar/topbar, render structure

Create src/components/layout/sidebar.tsx:
- 260px fixed, full height, z-30, glass-heavy class
- Border-right: 1px solid #C6C6C8
- Top: "HR Curie" text-[17px] font-semibold text-[#007AFF], p-6
- Nav items (each h-[44px] rounded-[8px] mx-3 px-3):
  Overview (LayoutDashboard) → /, My Profile (User) → /profile,
  Employees (Users) → /employees [ADMIN], Leave (CalendarOff) → /leave,
  Calendar (Calendar) → /calendar, Settings (Settings) → /settings [ADMIN]
- Active: text-[#007AFF] bg-[#007AFF]/10 border-l-[3px] border-[#007AFF]
- Inactive: text-[#1D1D1F] hover:bg-[#E5E5EA]
- Admin items: "ADMIN" badge (bg-[#5856D6]/15 text-[#5856D6] text-[11px]
  font-semibold uppercase px-1.5 py-0.5 rounded-[6px])
- Icons: 20x20, stroke-width 1.75
- Bottom: user card (40px avatar circle, name, position, Sign Out button)
- Use usePathname for active detection

Create src/components/layout/topbar.tsx:
- h-[52px] sticky top-0 z-40, glass class, border-bottom separator
- Left: page title (text-[22px] font-bold). Right: 32px avatar
- Desktop: ml-[260px]. Mobile: no margin, shows hamburger

Create src/components/layout/mobile-nav.tsx:
- shadcn Sheet side="left", trigger: Menu icon, visible <md only
- Same nav items as sidebar, width 280px, glass-heavy bg
- Close on nav click

Layout: min-h-screen bg-[#F2F2F7]. Desktop: sidebar fixed + main pl-[260px].
Mobile: no sidebar, hamburger. Content: pt-[52px] max-w-[1200px] mx-auto p-6/p-4.

Create placeholder src/app/(dashboard)/page.tsx: "Dashboard — coming soon"
```

## Test
- Login → sidebar visible, ADMIN badges on Employees/Settings
- Active item highlights blue. Resize <768px → hamburger + sheet.
- Sign Out → login page. Glass blur visible on scroll.

## Commit
```bash
git add . && git commit -m "step-06: dashboard layout"
```
ENDOFFILE

echo "  ✅ step-06"

# --------------------------------------------------
cat > .claude-steps/phase-1-login-layout/step-07-profile-page.md << 'ENDOFFILE'
# Step 07 — Profile Page

## Prompt for Claude Code

```
Create src/app/(dashboard)/profile/page.tsx (server component):
- requireAuth(), fetch employee from Prisma (include employmentType, user.role)

Layout:
- Top: 96px avatar circle (gray-5 bg, initials fallback) + name (text-[28px]
  font-bold) + position (text-[15px] text-[#8E8E93]) + role badge + "Change Avatar" ghost btn
- Info card: bg-white rounded-[10px] shadow-apple-sm p-5 mt-6
  Title: "Personal Information" text-[20px] font-semibold mb-5
  Grid: md:grid-cols-2, gap-5

Create src/components/shared/detail-field.tsx:
- Props: label, value (string | null)
- Label: text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93] mb-1
- Value: text-[17px] text-[#1D1D1F]. Empty: "—" in text-[#AEAEB2]
- LinkedIn: clickable link in text-[#007AFF]

Fields order: First Name, Last Name, Work Email, Employment Type,
Date of Birth (formatted "January 1, 1990" via date-fns), Actual Residence,
Start Year. Optional fields only if they have values.
```

## Test
- My Profile → Sofia's data displayed, 2-col desktop / 1-col mobile
- Initials "SA", ADMIN badge indigo, formatted date

## Commit
```bash
git add . && git commit -m "step-07: profile page"
```
ENDOFFILE

echo "  ✅ step-07"

# ============================================================
# PHASE 2 — Employees
# ============================================================

cat > .claude-steps/phase-2-employees/step-08-employee-list.md << 'ENDOFFILE'
# Step 08 — Employee List + Search

## Prompt for Claude Code

```
Create GET handler at src/app/api/employees/route.ts:
- requireApiAuth(). ADMIN: search across firstName, lastName, workEmail,
  position, department (Prisma contains + insensitive). Include
  employmentType.name, user (select: id, role — NEVER passwordHash).
  Order by lastName asc. EMPLOYEE: own record only.

Create src/app/(dashboard)/employees/page.tsx: requireAuth("ADMIN"),
SSR fetch employees. Title "Employees" + count. "Add Employee" button → /employees/new.

Create src/hooks/use-debounce.ts: debounce hook (300ms).

Create src/components/employees/employee-search.tsx (client):
- Filled input (bg fill-primary, no border, h-[44px], rounded-[8px])
- Search icon prefix. Debounced. Updates URL ?q= params.

Create src/components/employees/employee-table.tsx (client):
- shadcn Table, desktop only (≥768px). Columns: Avatar+Name, Email,
  Role (badge), Department, Employment Type. Clickable rows → /employees/[id].
  h-[52px] rows, hover bg-[#F2F2F7]. Header: text-[13px] font-semibold uppercase.
  Container: bg-white rounded-[10px] shadow-apple-sm.

Create src/components/employees/employee-card.tsx (client):
- Mobile (<768px). White card rounded-[10px] shadow-apple-sm p-4.
  Avatar 40px + name + email + role badge + department. Clickable. 12px gap.
```

## Test
- Employees page shows Sofia. Search "sof" filters. Mobile → cards. "Add Employee" links.

## Commit
```bash
git add . && git commit -m "step-08: employee list page"
```
ENDOFFILE

echo "  ✅ step-08"

# --------------------------------------------------
cat > .claude-steps/phase-2-employees/step-09-create-employee.md << 'ENDOFFILE'
# Step 09 — Create Employee Form + API

## Prompt for Claude Code

```
Add POST to src/app/api/employees/route.ts:
- requireApiAuth("ADMIN"). Validate createEmployeeSchema.
  Check email unique (409). Transaction: create User (bcrypt 12 rounds)
  + Employee. Return 201. Never return passwordHash.

Create src/lib/validations/employee.ts:
- createEmployeeSchema: required fields validated, optional .optional().or(z.literal(""))
- updateEmployeeSchema: omit password+workEmail, .partial()

Create src/app/(dashboard)/employees/new/page.tsx: requireAuth("ADMIN"),
fetch employment types.

Create src/components/employees/employee-form.tsx (client):
- Reusable (optional initialData). react-hook-form + zodResolver.
- Apple inputs: bg fill-primary, no border, h-[44px], rounded-[8px]
- Labels: text-[16px] text-[#3C3C43] mb-1.5. Errors: text-[13px] text-[#FF3B30]
- Section 1 "Required Information": 2-col grid. Fields: First Name, Last Name,
  Work Email, Password (create only), Employment Type (select), Date of Birth,
  Actual Residence, Start Year.
- Section 2 "Optional Information": Phone, Position, Department, Location,
  Health Insurance, Education, Certifications, LinkedIn, T-Shirt Size.
- Cancel (ghost) + Create Employee (primary, loading spinner).
- Success: toast + redirect /employees. Error: toast.
```

## Test
- Add Employee → fill required → creates. Duplicate email → error. Prisma Studio: hashed password.

## Commit
```bash
git add . && git commit -m "step-09: create employee"
```
ENDOFFILE

echo "  ✅ step-09"

# --------------------------------------------------
cat > .claude-steps/phase-2-employees/step-10-employee-profile.md << 'ENDOFFILE'
# Step 10 — Employee Profile View

## Prompt for Claude Code

```
Create GET at src/app/api/employees/[id]/route.ts:
- requireApiAuth(). Find by ID, include employmentType, user (id, role, email).
  EMPLOYEE + not own → 403. Not found → 404. No passwordHash.

Create src/app/(dashboard)/employees/[id]/page.tsx:
- requireAuth(). const { id } = await params (Next.js 16 async).
  Fetch by ID. EMPLOYEE + not own → redirect /profile. notFound() if missing.
- Top: 96px avatar + name + position + role badge
- ADMIN: "Edit" → /employees/[id]/edit, "Back to List" → /employees
- Info card with detail-field.tsx for all fields
```

## Test
- Click employee in list → profile. Login as EMPLOYEE → own profile only.

## Commit
```bash
git add . && git commit -m "step-10: employee profile view"
```
ENDOFFILE

echo "  ✅ step-10"

# --------------------------------------------------
cat > .claude-steps/phase-2-employees/step-11-edit-employee.md << 'ENDOFFILE'
# Step 11 — Edit Employee + Role Management

## Prompt for Claude Code

```
Add PUT to src/app/api/employees/[id]/route.ts:
- requireApiAuth("ADMIN"). updateEmployeeSchema. Empty strings → null.

Create PUT at src/app/api/employees/[id]/role/route.ts:
- requireApiAuth("ADMIN"). Validate {role: z.enum(["ADMIN","EMPLOYEE"])}.
  Block self-demotion (400). Update User.role.

Create src/app/(dashboard)/employees/[id]/edit/page.tsx:
- requireAuth("ADMIN"). Pre-fill employee-form. No password field.
  Work email read-only. PUT on submit. Toast + redirect.

Create src/components/employees/role-toggle.tsx (client):
- shadcn Switch, "Admin Access" label. Confirm dialog. API call.
  Self-demotion → error toast. On profile page for ADMIN.
```

## Test
- Edit position → saves. Toggle role → badge changes. Self-demotion → blocked.

## Commit
```bash
git add . && git commit -m "step-11: edit employee and role management"
```
ENDOFFILE

echo "  ✅ step-11"

# --------------------------------------------------
cat > .claude-steps/phase-2-employees/step-12-avatar-upload.md << 'ENDOFFILE'
# Step 12 — Avatar Upload

## Prompt for Claude Code

```
Create POST at src/app/api/employees/[id]/avatar/route.ts:
- requireApiAuth(). ADMIN or own profile only.
  S3 key: avatars/{id}/{timestamp}.jpg. Presigned upload (5min) + download (7day).
  Update avatarUrl in DB. Return {uploadUrl, avatarUrl}.

Create src/lib/s3.ts: S3Client, generatePresignedUploadUrl, generatePresignedDownloadUrl.

Create src/components/employees/avatar-upload.tsx (client):
- Display: 96px circle (profile) / 40px (lists). Hover overlay with Upload icon.
- Click → hidden file input (accept image/jpeg,image/png). Max 5MB.
- Preview via URL.createObjectURL. API call → PUT to S3.
- Dev fallback: if no S3_BUCKET_NAME, store base64 in avatarUrl.

Integrate into profile and employee detail pages.
```

## Test
- Hover avatar → overlay. Upload JPEG → preview. Shows in sidebar + list.

## Commit
```bash
git add . && git commit -m "step-12: avatar upload"
```
ENDOFFILE

echo "  ✅ step-12"

# --------------------------------------------------
cat > .claude-steps/phase-2-employees/step-13-empty-states.md << 'ENDOFFILE'
# Step 13 — Empty States + Loading Skeletons

## Prompt for Claude Code

```
Create src/components/shared/empty-state.tsx:
- Props: icon (LucideIcon), title, description, actionLabel?, actionHref?
- Centered: 48px icon text-[#AEAEB2], title apple-headline, description
  apple-subheadline text-gray-1, optional primary CTA button.

Employee list empty states:
- No search results: SearchX, "No employees found", "Try different search"
- No employees: UserPlus, "No employees yet", CTA "Add Employee"

Create src/components/shared/loading-skeleton.tsx:
- Apple pulse: opacity 0.4→1→0.4, 1500ms
- SkeletonTable (5 rows), SkeletonCard, SkeletonProfile

Add loading.tsx to: employees/, profile/, employees/[id]/
```

## Test
- Search nonsense → empty state. Navigate pages → skeletons appear.

## Commit
```bash
git add . && git commit -m "step-13: empty states and loading skeletons"
```
ENDOFFILE

echo "  ✅ step-13"

# ============================================================
# PHASE 3 — Leave Management
# ============================================================

cat > .claude-steps/phase-3-leave/step-14-leave-api.md << 'ENDOFFILE'
# Step 14 — Leave Request API

## Prompt for Claude Code

```
Create src/lib/validations/leave.ts:
- createLeaveSchema: type z.enum(["SICK_LEAVE","DAY_OFF","VACATION"]),
  startDate, endDate (coerce date), reason optional.
  Refine: endDate >= startDate.

Create src/app/api/leave/route.ts:
- GET: requireApiAuth(). ADMIN: all (filter ?status). EMPLOYEE: own.
  Include user.employee (firstName, lastName, avatarUrl). Order createdAt desc.
- POST: requireApiAuth() (any). Validate. Create PENDING. Return 201.

Create src/app/api/leave/[id]/approve/route.ts:
- POST: requireApiAuth("ADMIN"). Verify PENDING. Update APPROVED, reviewedBy/At.

Create src/app/api/leave/[id]/reject/route.ts:
- POST: requireApiAuth("ADMIN"). Same but REJECTED.
```

## Test
- POST leave → PENDING. Approve → APPROVED. Re-approve → 400.

## Commit
```bash
git add . && git commit -m "step-14: leave request API"
```
ENDOFFILE

echo "  ✅ step-14"

# --------------------------------------------------
cat > .claude-steps/phase-3-leave/step-15-leave-request-form.md << 'ENDOFFILE'
# Step 15 — Leave Request Form

## Prompt for Claude Code

```
Create src/app/(dashboard)/leave/request/page.tsx: requireAuth()

Create src/components/leave/leave-request-form.tsx (client):
- Type: select (🤒 Sick Leave, 🏠 Day Off, 🏖️ Vacation)
- Start/End Date: date inputs, Apple filled style
- Reason: textarea optional, 3 rows
- Show "X working days" (date-fns, exclude weekends)
- Submit → POST /api/leave. Toast + redirect /leave.
```

## Test
- Leave → Request → fill → submit → redirects. Prisma: PENDING.

## Commit
```bash
git add . && git commit -m "step-15: leave request form"
```
ENDOFFILE

echo "  ✅ step-15"

# --------------------------------------------------
cat > .claude-steps/phase-3-leave/step-16-leave-history.md << 'ENDOFFILE'
# Step 16 — Leave History Page

## Prompt for Claude Code

```
Create src/app/(dashboard)/leave/page.tsx:
- requireAuth(). Fetch requests. "Request Leave" button.
  ADMIN: "Manage Requests" link → /leave/manage.

Create src/components/leave/leave-status-badge.tsx:
- PENDING: bg-[#FF9500]/15 text-[#FF9500]
- APPROVED: bg-[#34C759]/15 text-[#34C759]
- REJECTED: bg-[#FF3B30]/15 text-[#FF3B30]
- rounded-[6px] px-2.5 py-0.5 text-[12px] font-semibold uppercase

Create src/components/leave/leave-history-table.tsx:
- Desktop table: Type, Dates, Duration, Status, Reason, Submitted
- Mobile: cards. Empty state with CTA.
```

## Test
- Requests visible, badges colored, mobile → cards.

## Commit
```bash
git add . && git commit -m "step-16: leave history page"
```
ENDOFFILE

echo "  ✅ step-16"

# --------------------------------------------------
cat > .claude-steps/phase-3-leave/step-17-leave-approval.md << 'ENDOFFILE'
# Step 17 — Leave Approval Page (Admin)

## Prompt for Claude Code

```
Create src/app/(dashboard)/leave/manage/page.tsx:
- requireAuth("ADMIN"). Fetch PENDING with employee info.

Create src/components/leave/leave-approval-card.tsx (client):
- White card, rounded-[10px], shadow-apple-sm, p-5
- Avatar 40px + name, type badge, dates + duration, reason, submitted time
- "Reject" (bg-[#FF3B30]) + "Approve" (bg-[#34C759])
- Confirm dialog. On action: API call, toast, card fade-out
  (opacity 1→0 + height collapse, 350ms apple easing)
- All done: empty state "All caught up!" CheckCircle
```

## Test
- Create requests → admin → Manage → approve/reject → cards animate out → empty state.

## Commit
```bash
git add . && git commit -m "step-17: leave approval page"
```
ENDOFFILE

echo "  ✅ step-17"

# ============================================================
# PHASE 4 — Calendar
# ============================================================

cat > .claude-steps/phase-4-calendar/step-18-meeting-api.md << 'ENDOFFILE'
# Step 18 — Meeting API

## Prompt for Claude Code

```
Create src/lib/validations/meeting.ts: scheduleMeetingSchema
(title, type enum, scheduledAt date, durationMinutes 15-480,
participantUserIds array min 1, notes optional, syncToGoogleCalendar bool).

Create src/app/api/calendar/events/route.ts:
- GET ?from=&to=: requireApiAuth(). ADMIN → all. EMPLOYEE → participant only.
  Include participants with names. Order scheduledAt asc.

Create src/app/api/calendar/schedule/route.ts:
- POST: requireApiAuth("ADMIN"). Validate. Transaction: Meeting + Participants.
  googleEventId null (for now). Return 201.
```

## Commit
```bash
git add . && git commit -m "step-18: meeting API"
```
ENDOFFILE

echo "  ✅ step-18"

# --------------------------------------------------
cat > .claude-steps/phase-4-calendar/step-19-schedule-meeting.md << 'ENDOFFILE'
# Step 19 — Schedule Meeting Dialog

## Prompt for Claude Code

```
Create src/components/calendar/schedule-meeting-dialog.tsx (client):
- shadcn Dialog, max-w-[480px], rounded-[14px], shadow-apple-xl
- Glass overlay. Title: text-[20px] font-semibold centered.
- Fields: Title, Type (select: One-on-One / Performance Review),
  Date+Time (datetime-local), Duration (select 15/30/45/60/90 min),
  Participants (multi-select from /api/employees, avatar+name),
  Notes (textarea optional)
- Cancel (ghost) + Schedule (primary). Close + toast + refresh on success.
```

## Commit
```bash
git add . && git commit -m "step-19: schedule meeting dialog"
```
ENDOFFILE

echo "  ✅ step-19"

# --------------------------------------------------
cat > .claude-steps/phase-4-calendar/step-20-calendar-view.md << 'ENDOFFILE'
# Step 20 — Calendar View

## Prompt for Claude Code

```
Create src/app/(dashboard)/calendar/page.tsx: requireAuth().
ADMIN: "Schedule Meeting" primary button.

Create src/components/calendar/calendar-month-view.tsx (client):
- Month grid. Dots: One-on-One=apple-blue, Review=apple-indigo.
- Today: apple-blue bg circle. Click day → shows meetings in side panel.

Create src/components/calendar/meeting-card.tsx:
- Time (font-semibold), title, type badge, stacked participant
  avatars (max 3 + "+N"). Click expand: notes + full list.

Layout: month/year nav arrows, grid center, day detail right/below.
ADMIN: all meetings. EMPLOYEE: own meetings only.
```

## Test
- Schedule meeting → calendar dot appears. Participant sees it. Non-participant doesn't.

## Commit
```bash
git add . && git commit -m "step-20: calendar view"
```
ENDOFFILE

echo "  ✅ step-20"

# ============================================================
# PHASE 5 — Settings & Dashboard
# ============================================================

cat > .claude-steps/phase-5-settings/step-21-employment-types.md << 'ENDOFFILE'
# Step 21 — Employment Type Management

## Prompt for Claude Code

```
Create src/app/api/employment-types/route.ts:
- GET: any authenticated. POST: ADMIN, validate name non-empty + unique.

Create src/app/(dashboard)/settings/page.tsx: requireAuth("ADMIN")
- "Employment Types": list as chips (rounded-[6px] bg-[#E5E5EA] text-[16px]).
  Delete X (disabled if employees assigned). "Add Type" input + button.
```

## Commit
```bash
git add . && git commit -m "step-21: employment type management"
```
ENDOFFILE

echo "  ✅ step-21"

# --------------------------------------------------
cat > .claude-steps/phase-5-settings/step-22-dashboard-overview.md << 'ENDOFFILE'
# Step 22 — Dashboard Overview Page

## Prompt for Claude Code

```
Replace src/app/(dashboard)/page.tsx: requireAuth()

ADMIN view — 4 cards (2x2 grid, white rounded-[10px] shadow-apple-sm p-5):
1. "Total Employees" count, Users icon, apple-blue
2. "Pending Requests" count, CalendarOff icon, apple-orange (→ /leave/manage)
3. "Meetings This Week" count, Calendar icon, apple-indigo
4. "New This Month" count, UserPlus icon, apple-green
Number: text-[34px] font-bold. Label: text-[16px] text-gray-1. Icon: 24px top-right.
Below: "Recent Leave Requests" (5) + "Upcoming Meetings" (5).

EMPLOYEE view: Welcome + quick actions (Request Leave, Calendar, Profile) + own data.
```

## Commit
```bash
git add . && git commit -m "step-22: dashboard overview"
```
ENDOFFILE

echo "  ✅ step-22"

# --------------------------------------------------
cat > .claude-steps/phase-5-settings/step-23-responsive-audit.md << 'ENDOFFILE'
# Step 23 — Responsive Audit + Accessibility

## Prompt for Claude Code

```
Review EVERY page for responsive behavior:

Mobile (<768px): sidebar → sheet, tables → cards, forms single-col,
buttons full-width, modals → bottom sheets, 44px touch targets.

Tablet (768-1024): sidebar toggleable, 2-col grids.

Desktop (>1024): full sidebar, full tables, max-w-[1200px].

Add: hover states (150ms), focus-visible ring (2px apple-blue,
outline-offset 2px), prefers-reduced-motion (disable animations),
4.5:1 contrast, aria-labels on icon buttons, semantic HTML
(nav, main, header, section, article).
```

## Test
- Resize all breakpoints. DevTools: iPhone SE, iPhone 14, iPad, desktop.
- Tab through entire app — focus rings visible.

## Commit
```bash
git add . && git commit -m "step-23: responsive audit and polish"
```
ENDOFFILE

echo "  ✅ step-23"

# ============================================================
# PHASE 6 — Security & Deploy
# ============================================================

cat > .claude-steps/phase-6-deploy/step-24-security.md << 'ENDOFFILE'
# Step 24 — Security Hardening

## Prompt for Claude Code

```
Audit every API route:
1. Every route has requireApiAuth() (except health, auth)
2. Write ops require "ADMIN"
3. Profile/avatar verify ownership or ADMIN
4. Self-demotion prevention
5. passwordHash NEVER in ANY response — audit every Prisma query
6. Zod validation on every POST/PUT body
7. Avatar: validate content-type + 5MB max

Login rate limiting:
- In-memory Map: 5 failures per email in 15min → 429
- Clear on success. Comment: use Redis in production.

Security headers in next.config.ts:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Commit
```bash
git add . && git commit -m "step-24: security hardening"
```
ENDOFFILE

echo "  ✅ step-24"

# --------------------------------------------------
cat > .claude-steps/phase-6-deploy/step-25-amplify-deploy.md << 'ENDOFFILE'
# Step 25 — Amplify Deployment Setup

## Prompt for Claude Code

```
Create amplify.yml (project root):
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx prisma generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*

Create amplify/backend.ts: minimal Amplify Gen 2 config.

Ensure next.config.ts has: output "standalone", reactCompiler true,
images.remotePatterns for S3 bucket.

Create .env.example documenting ALL vars:
DATABASE_URL (note: append ?connection_limit=5 for Lambda)
NEXTAUTH_URL, NEXTAUTH_SECRET, AWS_REGION, S3_BUCKET_NAME
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (future)

Create DEPLOYMENT.md: step-by-step guide:
1. Create RDS db.t4g.micro (single-AZ)
2. Create S3 bucket (private, CORS for Amplify domain)
3. Connect GitHub repo to Amplify Gen 2
4. Set env vars in Amplify Console
5. Deploy (auto-builds on push)
6. Run initial seed (connect to RDS, npx prisma db seed)
7. Test: sofia@company.com / qwerty123#
8. CHANGE DEFAULT PASSWORD IMMEDIATELY
```

## Commit
```bash
git add . && git commit -m "step-25: amplify deployment config"
```
ENDOFFILE

echo "  ✅ step-25"

# --------------------------------------------------
cat > .claude-steps/phase-6-deploy/step-26-final-review.md << 'ENDOFFILE'
# Step 26 — Final Review + README

## Prompt for Claude Code

```
Create README.md:
- Project: "HR Curie — Lightweight HR CRM"
- Features list (employee mgmt, leave, calendar, RBAC)
- Tech stack table
- Prerequisites: Node 20+, Docker (for Testcontainers)
- Local dev setup: clone → npm install → npm run dev
  (auto-starts PostgreSQL via Testcontainers) →
  npx prisma migrate dev → npx prisma db seed
- Environment variables table
- Project structure overview
- Scripts: dev, build, lint, db:migrate, db:seed, db:studio
- Deployment: link to DEPLOYMENT.md
- Default credentials: sofia@company.com / qwerty123#
  ⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN

Final checks — run and fix any issues:
- npx tsc --noEmit → zero TypeScript errors
- npm run lint → zero ESLint errors
- npm run build → builds successfully
- Every page renders without console errors
- Full E2E flow: login → create employee → request leave →
  approve leave → schedule meeting → view calendar
```

## Commit
```bash
git add . && git commit -m "step-26: final review and readme"
git tag v0.1.0 -m "MVP release"
```

## 🎉 Done!
ENDOFFILE

echo "  ✅ step-26"

# ============================================================
echo ""
echo "✅ All 26 step files + CONVENTIONS.md + DESIGN_SYSTEM.md created!"
echo ""
echo "To start building:"
echo "  1. Open Claude Code in this directory"
echo "  2. cat .claude-steps/phase-0-setup/step-01-init-project.md"
echo "  3. Copy the PROMPT section and paste into Claude Code"
echo "  4. npm run dev (auto-starts PostgreSQL via Testcontainers)"
echo ""
echo "Note: Docker must be running — Testcontainers needs it."
echo ""
