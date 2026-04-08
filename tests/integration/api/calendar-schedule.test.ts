import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient, Role } from "@prisma/client";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import { setupTestDb, teardownTestDb } from "../../helpers/setup-db";
import { createTestRequest, parseJsonResponse } from "../../helpers/test-request";

const mockAuthFn = vi.hoisted(() => vi.fn());
const prismaHolder = vi.hoisted(() => ({ instance: null as unknown as PrismaClient }));

vi.mock("@/lib/auth", () => ({ auth: mockAuthFn }));
vi.mock("@/lib/prisma", () => ({
  get prisma() {
    return prismaHolder.instance;
  },
}));

import { POST } from "@/app/api/calendar/schedule/route";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

let adminUserId: string;
let employeeUserId: string;
let employee2UserId: string;

let adminSession: Session;
let employeeSession: Session;

beforeAll(async () => {
  const db = await setupTestDb();
  prisma = db.prisma;
  container = db.container;
  prismaHolder.instance = prisma;

  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email: "sofia@company.com" },
  });
  adminUserId = adminUser.id;

  const empType = await prisma.employmentType.findFirstOrThrow();

  const empUser = await prisma.user.create({
    data: {
      email: "emp.calendar-schedule@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "CalSchedule",
          workEmail: "emp.calendar-schedule@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1990-01-01"),
          actualResidence: "Test City",
          startYear: 2024,
        },
      },
    },
  });
  employeeUserId = empUser.id;

  const emp2User = await prisma.user.create({
    data: {
      email: "emp2.calendar-schedule@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp2",
          lastName: "CalSchedule",
          workEmail: "emp2.calendar-schedule@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1991-02-02"),
          actualResidence: "Test City",
          startYear: 2024,
        },
      },
    },
  });
  employee2UserId = emp2User.id;

  adminSession = {
    user: { id: adminUserId, email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employeeSession = {
    user: { id: employeeUserId, email: "emp.calendar-schedule@company.com", role: "EMPLOYEE", name: "Emp CalSchedule" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    title: "Weekly 1:1",
    type: "ONE_ON_ONE",
    scheduledAt: "2026-07-01T10:00:00Z",
    durationMinutes: 30,
    participantUserIds: [employeeUserId],
    ...overrides,
  };
}

describe("POST /api/calendar/schedule", () => {
  it("creates meeting with valid body as admin (201)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{ data: { id: string; title: string } }>(response);

    expect(status).toBe(201);
    expect(data.data).toHaveProperty("id");
    expect(data.data.title).toBe("Weekly 1:1");
  });

  it("creates meeting with multiple participants", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody({ participantUserIds: [employeeUserId, employee2UserId] }),
    });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{
      data: { participants: Array<{ user: { id: string } }> };
    }>(response);

    expect(status).toBe(201);
    expect(data.data.participants).toHaveLength(2);
  });

  it("sets createdBy to the admin user id", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { createdBy: string } }>(response);

    expect(data.data.createdBy).toBe(adminUserId);
  });

  it("sets googleEventId to null", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { googleEventId: string | null } }>(response);

    expect(data.data.googleEventId).toBeNull();
  });

  it("stores notes when provided", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody({ notes: "Discuss roadmap" }),
    });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { notes: string } }>(response);

    expect(data.data.notes).toBe("Discuss roadmap");
  });

  it("stores null notes when omitted", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { notes: string | null } }>(response);

    expect(data.data.notes).toBeNull();
  });

  it("includes participant names in response", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{
      data: { participants: Array<{ user: { employee: { firstName: string; lastName: string } } }> };
    }>(response);

    const participant = data.data.participants[0];
    expect(participant.user.employee.firstName).toBe("Emp");
    expect(participant.user.employee.lastName).toBe("CalSchedule");
  });

  it("persists meeting and participants in database", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody({ participantUserIds: [employeeUserId, employee2UserId] }),
    });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { id: string } }>(response);

    const dbMeeting = await prisma.meeting.findUnique({
      where: { id: data.data.id },
      include: { participants: true },
    });
    expect(dbMeeting).not.toBeNull();
    expect(dbMeeting!.participants).toHaveLength(2);
  });

  it("returns 400 for missing required fields", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: {},
    });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("returns 400 for invalid meeting type", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody({ type: "STANDUP" }),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });

  it("returns 400 for empty participants array", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody({ participantUserIds: [] }),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });

  it("returns 400 for durationMinutes below 15", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody({ durationMinutes: 5 }),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });

  it("returns 403 when employee tries to schedule", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest("/api/calendar/schedule", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });
});
