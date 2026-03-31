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
