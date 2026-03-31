# HR CRM System — TypeScript Full-Stack + AWS Amplify Gen 2 Blueprint

## Architecture Overview

```
                        ┌─────────────────────────────┐
                        │      Route 53 (DNS)         │
                        │   hr.yourcompany.com        │
                        └─────────────┬───────────────┘
                                      │
                        ┌─────────────▼───────────────┐
                        │     CloudFront CDN           │
                        │  (auto-provisioned by        │
                        │   Amplify, TLS included)     │
                        └──────┬──────────────┬───────┘
                               │              │
                   Static      │              │  Dynamic
                   Assets      │              │  (SSR + API)
                               │              │
                  ┌────────────▼──┐  ┌────────▼──────────────┐
                  │  S3 (static)  │  │  Lambda@Edge / Lambda │
                  │  .js, .css,   │  │  Next.js SSR          │
                  │  images       │  │  API Routes (/api/*)  │
                  └───────────────┘  └──────┬─────┬─────┬────┘
                                            │     │     │
                                  ┌─────────▼─┐ ┌─▼───┐ ┌▼──────────────┐
                                  │ RDS       │ │ S3  │ │ Google        │
                                  │ PostgreSQL│ │Avat.│ │ Calendar API  │
                                  │ t4g.micro │ │     │ │ (OAuth2)      │
                                  └───────────┘ └─────┘ └───────────────┘

Amplify Gen 2 handles: Build → Deploy → CDN → TLS → Previews → Env Vars
You manage: RDS instance, S3 avatar bucket, Google Cloud project
```

**How Amplify Gen 2 deploys Next.js under the hood:**

Amplify automatically splits your Next.js app into two parts during build.
Static pages and assets (JS bundles, CSS, images, statically generated pages)
go to S3 and are served through CloudFront at the edge — globally fast,
essentially free. Dynamic content (SSR pages, API routes, middleware) gets
packaged into Lambda functions that CloudFront invokes on demand. You don't
configure any of this — Amplify reads your Next.js config and figures it out.

This means your `/api/employees` route runs as a Lambda function only when
someone hits it, and your login page's static shell loads from the nearest
CDN edge node. For a staging HR app with light traffic, most Lambda
invocations will fall within the free tier.

---

## Technology Stack

| Layer            | Technology                        | Purpose                         |
|------------------|-----------------------------------|---------------------------------|
| Framework        | Next.js 14+ (App Router)          | Full-stack SSR + API            |
| Language         | TypeScript (strict)               | End-to-end type safety          |
| UI Components    | shadcn/ui + Tailwind CSS          | macOS-like minimalist design    |
| ORM              | Prisma 5                          | Type-safe DB access + migrations|
| Database         | PostgreSQL 15                     | Relational data store           |
| Auth             | NextAuth.js v5 (Auth.js)          | Session/JWT + RBAC              |
| Validation       | Zod                               | Schema validation (API + forms) |
| File Storage     | AWS S3 + presigned URLs           | Avatar uploads                  |
| Calendar         | Google Calendar API                | Meeting scheduling              |
| Hosting          | AWS Amplify Gen 2                 | Auto-deploy, CDN, previews      |
| DB Hosting       | Amazon RDS (db.t4g.micro)         | Managed Postgres                |
| State Management | React Server Components + SWR     | Minimal client state            |

---

## Project Structure

```
hr-crm/
├── amplify/                            # Amplify Gen 2 config
│   ├── backend.ts                      # Backend definition (if using Amplify resources)
│   ├── auth/                           # (unused — we use NextAuth instead)
│   └── storage/                        # (unused — we use S3 directly)
│
├── prisma/
│   ├── schema.prisma                   # Database schema (source of truth)
│   ├── seed.ts                         # Default admin + employment types
│   └── migrations/                     # Prisma migration history
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   ├── page.tsx            # Login page (static shell + client form)
│   │   │   │   └── login-form.tsx      # Client component
│   │   │   └── layout.tsx              # Centered, minimal auth layout
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar + topbar (server component)
│   │   │   ├── page.tsx                # Dashboard home / overview
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx            # Own profile (SSR, all roles)
│   │   │   │   └── edit-avatar.tsx     # Client: S3 presigned upload
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── page.tsx            # Employee list + search (ADMIN, SSR)
│   │   │   │   ├── new/page.tsx        # Create employee form (ADMIN)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Employee profile (SSR)
│   │   │   │       └── edit/page.tsx   # Edit employee (ADMIN)
│   │   │   │
│   │   │   ├── leave/
│   │   │   │   ├── page.tsx            # My leave requests (SSR, all roles)
│   │   │   │   ├── request/page.tsx    # New leave request form
│   │   │   │   └── manage/page.tsx     # Approve/reject queue (ADMIN, SSR)
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   ├── page.tsx            # Calendar view (SSR, scoped by role)
│   │   │   │   └── schedule/page.tsx   # Schedule meeting dialog (ADMIN)
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx            # Employment types mgmt (ADMIN)
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts  # NextAuth handler
│   │   │   │
│   │   │   ├── employees/
│   │   │   │   ├── route.ts                # GET (list/search), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts            # GET, PUT, DELETE
│   │   │   │       ├── avatar/route.ts     # POST → presigned URL
│   │   │   │       └── role/route.ts       # PUT → change role
│   │   │   │
│   │   │   ├── leave/
│   │   │   │   ├── route.ts                # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── approve/route.ts    # POST
│   │   │   │       └── reject/route.ts     # POST
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   ├── events/route.ts         # GET meetings list
│   │   │   │   └── schedule/route.ts       # POST schedule meeting
│   │   │   │
│   │   │   ├── employment-types/
│   │   │   │   └── route.ts                # GET, POST
│   │   │   │
│   │   │   └── health/route.ts             # GET → { status: "ok" }
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx                      # Root layout (fonts, providers)
│   │
│   ├── components/
│   │   ├── ui/                             # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── dropdown-menu.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx                 # macOS-style sidebar nav
│   │   │   ├── topbar.tsx                  # User avatar + name + logout
│   │   │   ├── mobile-nav.tsx              # Sheet-based mobile menu
│   │   │   └── page-header.tsx             # Reusable page title + actions
│   │   │
│   │   ├── employees/
│   │   │   ├── employee-table.tsx          # Sortable table (ADMIN)
│   │   │   ├── employee-card.tsx           # Mobile card variant
│   │   │   ├── employee-form.tsx           # Create/edit form
│   │   │   ├── employee-search.tsx         # Search input with debounce
│   │   │   └── role-toggle.tsx             # ADMIN/EMPLOYEE switch
│   │   │
│   │   ├── leave/
│   │   │   ├── leave-request-form.tsx      # Date range + type + reason
│   │   │   ├── leave-status-badge.tsx      # Color-coded PENDING/APPROVED/REJECTED
│   │   │   ├── leave-approval-card.tsx     # Approve/reject actions (ADMIN)
│   │   │   └── leave-history-table.tsx     # Past requests list
│   │   │
│   │   ├── calendar/
│   │   │   ├── calendar-month-view.tsx     # Month grid
│   │   │   ├── calendar-week-view.tsx      # Week timeline
│   │   │   ├── meeting-card.tsx            # Meeting display
│   │   │   └── schedule-meeting-dialog.tsx # Form in dialog (ADMIN)
│   │   │
│   │   └── shared/
│   │       ├── loading-skeleton.tsx        # Consistent loading states
│   │       ├── empty-state.tsx             # "No data" illustrations
│   │       ├── confirm-dialog.tsx          # Reusable confirmation
│   │       └── date-range-picker.tsx       # Leave date selection
│   │
│   ├── lib/
│   │   ├── prisma.ts                       # Prisma client singleton
│   │   ├── auth.ts                         # NextAuth v5 config
│   │   ├── auth-guard.ts                   # Server-side role check helper
│   │   ├── s3.ts                           # S3 client + presigned URLs
│   │   ├── google-calendar.ts              # Google Calendar API wrapper
│   │   ├── constants.ts                    # Roles, leave types, etc.
│   │   └── validations/
│   │       ├── employee.ts                 # Zod schemas for employee
│   │       ├── leave.ts                    # Zod schemas for leave
│   │       ├── meeting.ts                  # Zod schemas for meeting
│   │       └── auth.ts                     # Zod schemas for login
│   │
│   ├── hooks/
│   │   ├── use-current-user.ts             # Session hook
│   │   ├── use-employees.ts                # SWR: fetch employees
│   │   ├── use-leave-requests.ts           # SWR: fetch leave data
│   │   └── use-debounce.ts                 # Search input debounce
│   │
│   └── types/
│       ├── index.ts                        # Shared types (from Prisma + custom)
│       └── next-auth.d.ts                  # NextAuth session type augmentation
│
├── public/
│   ├── favicon.ico
│   └── placeholder-avatar.svg
│
├── .env.local                              # Local dev secrets
├── .env.example                            # Template (committed)
├── CONVENTIONS.md                          # Claude Code rules
├── docker-compose.yml                      # Local Postgres
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  EMPLOYEE
}

enum LeaveType {
  SICK_LEAVE
  DAY_OFF
  VACATION
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String    @map("password_hash")
  role           Role      @default(EMPLOYEE)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  employee       Employee?
  leaveRequests  LeaveRequest[]
  meetings       MeetingParticipant[]

  @@map("users")
}

model Employee {
  id               String         @id @default(cuid())
  userId           String         @unique @map("user_id")
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  // --- Required ---
  firstName        String         @map("first_name")
  lastName         String         @map("last_name")
  employmentTypeId String         @map("employment_type_id")
  employmentType   EmploymentType @relation(fields: [employmentTypeId], references: [id])
  workEmail        String         @unique @map("work_email")
  dateOfBirth      DateTime       @map("date_of_birth") @db.Date
  actualResidence  String         @map("actual_residence")
  startYear        Int            @map("start_year")

  // --- Optional ---
  phone            String?
  position         String?
  department       String?
  location         String?
  healthInsurance  String?        @map("health_insurance")
  education        String?
  certifications   String?
  linkedinUrl      String?        @map("linkedin_url")
  tshirtSize       String?        @map("tshirt_size")
  avatarUrl        String?        @map("avatar_url")

  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  @@index([lastName])
  @@index([department])
  @@map("employees")
}

model EmploymentType {
  id        String     @id @default(cuid())
  name      String     @unique
  employees Employee[]

  @@map("employment_types")
}

model LeaveRequest {
  id          String      @id @default(cuid())
  userId      String      @map("user_id")
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        LeaveType
  status      LeaveStatus @default(PENDING)
  startDate   DateTime    @map("start_date") @db.Date
  endDate     DateTime    @map("end_date") @db.Date
  reason      String?
  reviewedBy  String?     @map("reviewed_by")
  reviewedAt  DateTime?   @map("reviewed_at")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  @@index([userId])
  @@index([status])
  @@map("leave_requests")
}

model Meeting {
  id              String               @id @default(cuid())
  title           String
  type            String               // "ONE_ON_ONE" | "PERFORMANCE_REVIEW"
  scheduledAt     DateTime             @map("scheduled_at")
  durationMinutes Int                  @default(30) @map("duration_minutes")
  googleEventId   String?              @map("google_event_id")
  notes           String?
  createdBy       String               @map("created_by")
  createdAt       DateTime             @default(now()) @map("created_at")
  updatedAt       DateTime             @updatedAt @map("updated_at")

  participants    MeetingParticipant[]

  @@index([scheduledAt])
  @@map("meetings")
}

model MeetingParticipant {
  id        String  @id @default(cuid())
  meetingId String  @map("meeting_id")
  meeting   Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  userId    String  @map("user_id")
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([meetingId, userId])
  @@map("meeting_participants")
}
```

---

## Default Admin Seed

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed employment types
  const defaultTypes = ["CY", "GIG", "Contractor"];
  for (const name of defaultTypes) {
    await prisma.employmentType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed default admin (only if no admin exists)
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!adminExists) {
    const cyType = await prisma.employmentType.findUniqueOrThrow({
      where: { name: "CY" },
    });

    await prisma.user.create({
      data: {
        email: "sofia@company.com",
        // "qwerty123#" → bcrypt 12 rounds (non-reversible)
        passwordHash: await bcrypt.hash("qwerty123#", 12),
        role: Role.ADMIN,
        employee: {
          create: {
            firstName: "Sofia",
            lastName: "Admin",
            employmentTypeId: cyType.id,
            workEmail: "sofia@company.com",
            dateOfBirth: new Date("1990-01-01"),
            actualResidence: "Prague, CZ",
            startYear: 2024,
            position: "HR Manager",
          },
        },
      },
    });

    console.log("Default admin seeded: sofia@company.com / qwerty123#");
  } else {
    console.log("Admin already exists, skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

---

## Authentication

### NextAuth Configuration

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      name: string;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { employee: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.employee
            ? `${user.employee.firstName} ${user.employee.lastName}`
            : user.email,
          image: user.employee?.avatarUrl ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
});
```

### Auth Guard Helper (Server-side)

```typescript
// src/lib/auth-guard.ts
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

// For server components / pages
export async function requireAuth(requiredRole?: Role) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (requiredRole && session.user.role !== requiredRole) redirect("/profile");
  return session;
}

// For API routes
export async function requireApiAuth(requiredRole?: Role) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (requiredRole && session.user.role !== requiredRole) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
```

### Middleware

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login"];
const adminPaths = ["/employees", "/leave/manage", "/settings"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Redirect to dashboard if already logged in
    if (req.auth?.user) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    return NextResponse.next();
  }

  // Require authentication for everything else
  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Block non-admin from admin pages
  if (
    req.auth.user.role !== "ADMIN" &&
    adminPaths.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
```

---

## Validation Schemas (Zod)

```typescript
// src/lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

// src/lib/validations/employee.ts
import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "Required").max(100),
  lastName: z.string().min(1, "Required").max(100),
  employmentTypeId: z.string().min(1, "Required"),
  workEmail: z.string().email("Valid work email required"),
  dateOfBirth: z.coerce.date(),
  actualResidence: z.string().min(1, "Required"),
  startYear: z.coerce.number().int().min(1970).max(2100),
  password: z.string().min(8, "Minimum 8 characters"),
  // Optional
  phone: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  healthInsurance: z.string().optional().or(z.literal("")),
  education: z.string().optional().or(z.literal("")),
  certifications: z.string().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  tshirtSize: z.string().optional().or(z.literal("")),
});

export const updateEmployeeSchema = createEmployeeSchema
  .omit({ password: true, workEmail: true })
  .partial();

// src/lib/validations/leave.ts
import { z } from "zod";

export const createLeaveSchema = z
  .object({
    type: z.enum(["SICK_LEAVE", "DAY_OFF", "VACATION"]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().optional().or(z.literal("")),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

// src/lib/validations/meeting.ts
import { z } from "zod";

export const scheduleMeetingSchema = z.object({
  title: z.string().min(1, "Required"),
  type: z.enum(["ONE_ON_ONE", "PERFORMANCE_REVIEW"]),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  participantUserIds: z.array(z.string()).min(1, "Select at least one participant"),
  notes: z.string().optional().or(z.literal("")),
  syncToGoogleCalendar: z.boolean().default(false),
});
```

---

## API Routes

### Employee Routes

```typescript
// src/app/api/employees/route.ts
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-guard";
import { createEmployeeSchema } from "@/lib/validations/employee";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";

  // ADMIN: list all (with search); EMPLOYEE: own profile only
  if (session!.user.role === "ADMIN") {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { workEmail: { contains: search, mode: "insensitive" as const } },
            { position: { contains: search, mode: "insensitive" as const } },
            { department: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const employees = await prisma.employee.findMany({
      where,
      include: {
        employmentType: { select: { name: true } },
        user: { select: { role: true } },
      },
      orderBy: { lastName: "asc" },
    });

    return NextResponse.json(employees);
  }

  // Employee: own profile
  const employee = await prisma.employee.findUnique({
    where: { userId: session!.user.id },
    include: {
      employmentType: { select: { name: true } },
      user: { select: { role: true } },
    },
  });

  return NextResponse.json(employee ? [employee] : []);
}

export async function POST(req: Request) {
  const { session, error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const body = await req.json();
  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { password, ...data } = parsed.data;

  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: data.workEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  // Transaction: create user + employee
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.workEmail,
        passwordHash: await bcrypt.hash(password, 12),
        role: "EMPLOYEE",
      },
    });

    const employee = await tx.employee.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        employmentTypeId: data.employmentTypeId,
        workEmail: data.workEmail,
        dateOfBirth: data.dateOfBirth,
        actualResidence: data.actualResidence,
        startYear: data.startYear,
        phone: data.phone || null,
        position: data.position || null,
        department: data.department || null,
        location: data.location || null,
        healthInsurance: data.healthInsurance || null,
        education: data.education || null,
        certifications: data.certifications || null,
        linkedinUrl: data.linkedinUrl || null,
        tshirtSize: data.tshirtSize || null,
      },
      include: { employmentType: { select: { name: true } } },
    });

    return employee;
  });

  return NextResponse.json(result, { status: 201 });
}
```

### Employee Detail + Role Routes

```typescript
// src/app/api/employees/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-guard";
import { updateEmployeeSchema } from "@/lib/validations/employee";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      employmentType: { select: { name: true } },
      user: { select: { id: true, role: true, email: true } },
    },
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Employees can only view their own profile
  if (session!.user.role !== "ADMIN" && employee.userId !== session!.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(employee);
}

export async function PUT(req: Request, { params }: Params) {
  const { session, error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Filter out empty strings → null
  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]),
  );

  const updated = await prisma.employee.update({
    where: { id },
    data,
    include: { employmentType: { select: { name: true } } },
  });

  return NextResponse.json(updated);
}

// src/app/api/employees/[id]/role/route.ts
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-guard";
import { NextResponse } from "next/server";
import { z } from "zod";

const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

export async function PUT(req: Request, { params }: Params) {
  const { session, error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = changeRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Prevent self-demotion
  if (employee.userId === session!.user.id && parsed.data.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Cannot remove your own admin role" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: employee.userId },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ success: true });
}
```

### Leave Routes

```typescript
// src/app/api/leave/route.ts
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-guard";
import { createLeaveSchema } from "@/lib/validations/leave";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where =
    session!.user.role === "ADMIN"
      ? status
        ? { status: status as any }
        : {}
      : { userId: session!.user.id };

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: {
      user: {
        select: {
          employee: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = createLeaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId: session!.user.id,
      type: parsed.data.type,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      reason: parsed.data.reason || null,
    },
  });

  return NextResponse.json(leaveRequest, { status: 201 });
}

// src/app/api/leave/[id]/approve/route.ts
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/lib/auth-guard";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { session, error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (leave.status !== "PENDING") {
    return NextResponse.json({ error: `Already ${leave.status}` }, { status: 400 });
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedBy: session!.user.id,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
```

### Avatar Upload Route

```typescript
// src/app/api/employees/[id]/avatar/route.ts
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { generatePresignedUploadUrl, generatePresignedDownloadUrl } from "@/lib/s3";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { session, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only owner or admin can upload avatar
  if (session!.user.role !== "ADMIN" && employee.userId !== session!.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const key = `avatars/${id}/${Date.now()}.jpg`;
  const uploadUrl = await generatePresignedUploadUrl(key);
  const publicUrl = await generatePresignedDownloadUrl(key);

  // Save avatar URL to employee record
  await prisma.employee.update({
    where: { id },
    data: { avatarUrl: publicUrl },
  });

  return NextResponse.json({ uploadUrl, avatarUrl: publicUrl });
}
```

---

## S3 Helper

```typescript
// src/lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "eu-central-1" });
const BUCKET = process.env.S3_BUCKET_NAME!;

export async function generatePresignedUploadUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: "image/jpeg",
  });
  return getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
}

export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 * 24 * 7 }); // 7 days
}
```

---

## Prisma Client Singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Amplify Gen 2 Configuration

### amplify/backend.ts

```typescript
// amplify/backend.ts
import { defineBackend } from "@aws-amplify/backend";

// Minimal Amplify backend — we're using NextAuth + Prisma + S3 directly,
// not Amplify Auth/Data/Storage constructs. Amplify Gen 2 still handles
// the build, deploy, CDN, and environment variable injection.

const backend = defineBackend({});

// If you later want Amplify to manage S3 or other resources,
// add them here. For now, we manage RDS and S3 externally.
```

### amplify.yml (Build Settings)

```yaml
# amplify.yml — placed in project root
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
```

### Environment Variables (Amplify Console)

```
# Set these in Amplify Console → App Settings → Environment Variables
# Branch: main (staging)

DATABASE_URL=postgresql://hrcrm:<password>@<rds-endpoint>:5432/hrcrm?connection_limit=5
NEXTAUTH_URL=https://main.<amplify-app-id>.amplifyapp.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# S3
AWS_REGION=eu-central-1
S3_BUCKET_NAME=hr-crm-avatars-staging

# Google Calendar (Phase 4)
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
```

**Important:** The `connection_limit=5` in DATABASE_URL is critical for
serverless. Each Lambda invocation opens a Prisma connection, and without
a limit you'll exhaust RDS's max connections (default ~80 for t4g.micro).
For production, add Prisma Accelerate or RDS Proxy.

---

## Local Development

### docker-compose.yml

```yaml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: hrcrm
      POSTGRES_USER: hrcrm
      POSTGRES_PASSWORD: localdev123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### .env.local

```bash
DATABASE_URL="postgresql://hrcrm:localdev123@localhost:5432/hrcrm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production"
AWS_REGION="eu-central-1"
S3_BUCKET_NAME="hr-crm-avatars-dev"
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "postinstall": "prisma generate"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## AWS Infrastructure

```
┌── Amplify Gen 2 App ──────────────────────────────────────┐
│                                                            │
│  Branch: main → staging                                    │
│  Branch: production → production (when ready)              │
│                                                            │
│  Auto-provisions:                                          │
│  • CloudFront distribution (global CDN)                    │
│  • S3 bucket for static assets                             │
│  • Lambda functions for SSR + API routes                   │
│  • TLS certificate (*.amplifyapp.com or custom domain)     │
│  • CI/CD pipeline (git push → build → deploy)              │
│  • Preview environments (per pull request)                 │
│                                                            │
│  Cost: ~$0–5/month for staging traffic                     │
└────────────────────────────────────────────────────────────┘

┌── RDS PostgreSQL ─────────────────────────────────────────┐
│  Instance: db.t4g.micro (2 vCPU, 1 GB RAM)               │
│  Storage: 20 GB gp3                                       │
│  Deployment: Single-AZ (staging)                          │
│  Security Group: allow Lambda (via VPC or public access)  │
│                                                            │
│  Cost: ~$0/month (free tier) or ~$12/month after          │
└────────────────────────────────────────────────────────────┘

┌── S3 Bucket (avatars) ────────────────────────────────────┐
│  Bucket: hr-crm-avatars-staging                           │
│  Access: presigned URLs only (private bucket)             │
│  Lifecycle: delete orphaned objects after 90 days         │
│                                                            │
│  Cost: ~$0.03/month                                       │
└────────────────────────────────────────────────────────────┘
```

### RDS Connectivity from Amplify Lambda

Amplify's SSR Lambda functions run outside a VPC by default.
For staging, the simplest approach is to make RDS publicly accessible
with a strong security group that allows only known IPs.

For production, attach the Lambda to a VPC:

```typescript
// amplify/backend.ts (production VPC config)
import { defineBackend } from "@aws-amplify/backend";

const backend = defineBackend({});

// Add VPC configuration for Lambda → RDS
// See: https://docs.amplify.aws/nextjs/deploy-and-host/fullstack-branching/custom-pipelines/
```

### Cost Breakdown (Staging)

| Resource                              | Cost/month     |
|---------------------------------------|----------------|
| Amplify Hosting (build + CDN + SSR)   | ~$0–5          |
| RDS db.t4g.micro (free tier year 1)   | ~$0            |
| RDS db.t4g.micro (after free tier)    | ~$12           |
| S3 avatars (< 1 GB)                   | ~$0.03         |
| Data transfer                         | ~$0.50         |
| **Total (year 1)**                    | **~$1–6**      |
| **Total (after free tier)**           | **~$13–18**    |

---

## API Endpoints Summary

| Method | Path                              | Auth      | Description                      |
|--------|-----------------------------------|-----------|----------------------------------|
| POST   | /api/auth/[...nextauth]           | Public    | NextAuth login/session           |
| GET    | /api/employees?q=                 | ALL       | List (ADMIN) / self (EMPLOYEE)   |
| POST   | /api/employees                    | ADMIN     | Create employee + user           |
| GET    | /api/employees/[id]               | Scoped    | View profile                     |
| PUT    | /api/employees/[id]               | ADMIN     | Update employee details          |
| PUT    | /api/employees/[id]/role          | ADMIN     | Toggle ADMIN / EMPLOYEE          |
| POST   | /api/employees/[id]/avatar        | Owner/ADM | Get presigned upload URL         |
| GET    | /api/leave?status=                | Scoped    | List leave requests              |
| POST   | /api/leave                        | ALL       | Submit leave request             |
| POST   | /api/leave/[id]/approve           | ADMIN     | Approve leave                    |
| POST   | /api/leave/[id]/reject            | ADMIN     | Reject leave                     |
| GET    | /api/calendar/events              | Scoped    | List meetings                    |
| POST   | /api/calendar/schedule            | ADMIN     | Schedule meeting + GCal sync     |
| GET    | /api/employment-types             | ALL       | List employment types            |
| POST   | /api/employment-types             | ADMIN     | Add employment type              |
| GET    | /api/health                       | Public    | Health check                     |

---

## Design System — macOS Minimalism

### Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: { DEFAULT: "#F5F5F7", hover: "#E8E8ED", active: "#DCDCE0" },
        accent: { DEFAULT: "#007AFF", hover: "#0056CC", light: "#E5F1FF" },
        surface: { DEFAULT: "#FFFFFF", secondary: "#F9F9FB" },
        border: { DEFAULT: "#D1D1D6", light: "#E5E5EA" },
        text: { primary: "#1D1D1F", secondary: "#86868B", tertiary: "#AEAEB2" },
        status: {
          success: "#34C759",
          warning: "#FF9F0A",
          error: "#FF3B30",
          info: "#5AC8FA",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "SF Pro Text",
          "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue",
          "Arial", "sans-serif",
        ],
      },
      fontSize: {
        "page-title": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "section-title": ["20px", { lineHeight: "24px", fontWeight: "600" }],
        "card-title": ["15px", { lineHeight: "20px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      borderRadius: {
        macos: "10px",
        "macos-sm": "8px",
        "macos-lg": "14px",
      },
      boxShadow: {
        macos: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "macos-md": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "macos-lg": "0 8px 30px rgba(0, 0, 0, 0.12)",
        "macos-inset": "inset 0 1px 2px rgba(0, 0, 0, 0.06)",
      },
      spacing: {
        sidebar: "240px",
      },
      transitionTimingFunction: {
        macos: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Design Principles

```
Visual Language:

1. SURFACES     — White cards on #F9F9FB background, depth via shadow not border
2. CORNERS      — 10px radius on cards/modals, 8px on inputs/buttons
3. COLOR        — Single accent (#007AFF), greyscale for everything else
4. TYPOGRAPHY   — System font stack, 14px body, restrained weight usage
5. SPACING      — 16px base grid, generous padding (20–24px in cards)
6. INTERACTIONS — 150ms transitions, subtle hover states, no aggressive animations
7. SIDEBAR      — 240px fixed, #F5F5F7 background, icon + label navigation
8. EMPTY STATES — Friendly illustration + single CTA, never a blank page
9. MOBILE       — Sidebar → sheet overlay, tables → stacked cards, 16px min tap targets
```

---

## CONVENTIONS.md

```markdown
# HR CRM — Claude Code Conventions

## Stack
- Next.js 14 App Router, TypeScript strict, Tailwind CSS, shadcn/ui
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

## Security Checklist
- [ ] Every API route calls requireApiAuth()
- [ ] ADMIN-only routes pass "ADMIN" to requireApiAuth
- [ ] Employee endpoints verify userId ownership for non-admin access
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] User.passwordHash excluded from all Prisma selects in API responses
- [ ] File uploads validate content type + size (5MB max)
- [ ] Self-demotion prevented (admin can't remove own admin role)

## Commit Messages
Follow conventional commits: feat|fix|chore|docs(scope): description
```

---

## Claude Code Development Phases

### Phase 1 — Foundation (Days 1–2)

```
Prompt 1: "Initialize a Next.js 14 project with App Router, TypeScript
strict mode, Tailwind CSS, and shadcn/ui. Add Prisma with PostgreSQL.
Create docker-compose.yml with Postgres 15. Install dependencies:
bcryptjs, next-auth@beta, zod, swr, @aws-sdk/client-s3,
@aws-sdk/s3-request-presigner. Set up the project structure from
the blueprint."

Prompt 2: "Create the Prisma schema exactly as specified in the
blueprint. Run prisma migrate dev to create the initial migration.
Create the seed script for default admin Sofia with bcrypt-hashed
password. Add the prisma client singleton in src/lib/prisma.ts."

Prompt 3: "Set up NextAuth v5 with credentials provider, JWT strategy,
role claim in the token. Create the auth guard helpers
(requireAuth for pages, requireApiAuth for API routes). Create
the middleware for route protection."

Prompt 4: "Build the login page with macOS-like design — centered
white card on grey background, subtle shadow, system font.
Use react-hook-form + zod. On success redirect to /profile.
Test login with Sofia / qwerty123#."
```

### Phase 2 — Layout + Employee CRUD (Days 3–5)

```
Prompt 5: "Build the dashboard layout with a 240px macOS-style sidebar
(#F5F5F7 background) with navigation items: Overview, My Profile,
Employees (admin only), Leave, Calendar, Settings (admin only).
Add a topbar with user avatar, name, role badge, and logout.
Make sidebar collapse to a sheet on mobile (md breakpoint)."

Prompt 6: "Build the employee list page (ADMIN only, SSR). Include a
search input with debounce that filters by name/email/position/
department. Display results in a table on desktop (shadcn Table)
and stacked cards on mobile. Each row links to /employees/[id].
Create GET /api/employees with search support."

Prompt 7: "Build the create employee form page (/employees/new, ADMIN).
Include all required and optional fields from the schema. Use
react-hook-form + zodResolver with createEmployeeSchema. Employment
type is a select dropdown fetched from /api/employment-types.
Create POST /api/employees with transaction."

Prompt 8: "Build the employee profile page (/employees/[id], SSR).
Show all employee details in a clean card layout. ADMIN sees an
Edit button (links to /employees/[id]/edit) and a Role toggle
(ADMIN/EMPLOYEE switch). EMPLOYEE can only view their own profile
and change their avatar. Implement the avatar upload flow with
S3 presigned URLs."

Prompt 9: "Build the edit employee page (/employees/[id]/edit, ADMIN).
Pre-fill the form with current data. Use updateEmployeeSchema
(partial, no password/email). Create PUT /api/employees/[id]."
```

### Phase 3 — Leave Management (Days 6–7)

```
Prompt 10: "Build the leave request page (/leave/request). Form with:
leave type select (Sick Leave, Day Off, Vacation), date range
picker, optional reason textarea. Submit to POST /api/leave.
Show success toast and redirect to /leave."

Prompt 11: "Build the my leave page (/leave, SSR). Show leave
request history as a list of cards with type badge, date range,
status badge (color-coded: pending=yellow, approved=green,
rejected=red), and reason. Fetch from GET /api/leave."

Prompt 12: "Build the leave management page (/leave/manage, ADMIN SSR).
Show pending requests as cards with employee name+avatar, type,
dates, reason, and Approve/Reject buttons. Create POST
/api/leave/[id]/approve and /api/leave/[id]/reject."
```

### Phase 4 — Calendar + Meetings (Days 8–10)

```
Prompt 13: "Build Google Calendar integration in src/lib/google-calendar.ts.
Use googleapis package with service account or OAuth2. Implement:
createEvent(title, time, duration, attendeeEmails),
listEvents(userEmail, startDate, endDate). Create POST
/api/calendar/schedule and GET /api/calendar/events."

Prompt 14: "Build the calendar page (/calendar, SSR). ADMIN sees all
users' meetings. EMPLOYEE sees only their own. Show a month view
with meeting dots and a sidebar list of upcoming meetings.
Each meeting shows: title, type badge, time, participants."

Prompt 15: "Build the schedule meeting dialog (/calendar/schedule, ADMIN).
Form: title, type (1:1 / Performance Review), date+time picker,
duration select, participant multiselect (from employee list),
optional notes, 'Sync to Google Calendar' checkbox."
```

### Phase 5 — Settings + Polish (Days 11–12)

```
Prompt 16: "Build the settings page (/settings, ADMIN). Section:
Employment Types — list existing types, add new type input,
delete type (only if no employees assigned). Create GET/POST
/api/employment-types."

Prompt 17: "Build the dashboard overview page (/). Show cards:
total employees count, pending leave requests count (ADMIN),
upcoming meetings this week, my leave balance summary.
Use server components with Prisma aggregation queries."

Prompt 18: "Audit all pages for responsive design. Test every page
at 375px (mobile), 768px (tablet), 1024px+ (desktop). Ensure:
sidebar collapses, tables become cards, forms stack vertically,
dialog sheets on mobile, minimum 44px tap targets."
```

### Phase 6 — Amplify Deploy (Days 13–14)

```
Prompt 19: "Create amplify.yml build config. Set up the Amplify
Gen 2 backend.ts (minimal — we use NextAuth, not Amplify Auth).
Add a .env.example with all required environment variables.
Ensure prisma generate runs in preBuild."

Prompt 20: "Security audit: verify every API route has auth guards,
no passwordHash leaks in responses, all inputs validated with Zod,
RBAC enforced on both middleware and API level. Add rate limiting
to /api/auth (max 5 attempts per minute per IP). Review CSP
headers in next.config.ts."
```

---

## Deployment Checklist

```markdown
## First Deploy to Amplify

1. Create RDS PostgreSQL instance (db.t4g.micro, single-AZ)
   - Note the endpoint URL
   - Create database: hrcrm
   - Set strong password

2. Create S3 bucket for avatars
   - Block all public access
   - Enable CORS for your Amplify domain

3. Connect repo to Amplify Console
   - Framework: Next.js SSR
   - Branch: main

4. Set environment variables in Amplify Console:
   - DATABASE_URL (with ?connection_limit=5)
   - NEXTAUTH_URL (your Amplify domain)
   - NEXTAUTH_SECRET (openssl rand -base64 32)
   - AWS_REGION
   - S3_BUCKET_NAME

5. Deploy — Amplify auto-builds and provisions CDN

6. Run seed: connect to RDS and run `npx prisma db seed`
   (or add a one-time seed API route protected by a secret)

7. Test login: sofia@company.com / qwerty123#

8. (Optional) Add custom domain in Amplify Console
```

---

## Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.eu-central-1.amazonaws.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;
```
