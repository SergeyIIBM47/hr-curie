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

import { GET } from "@/app/api/calendar/events/route";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

let adminUserId: string;
let employeeUserId: string;
let employee2UserId: string;

let adminSession: Session;
let employeeSession: Session;
let employee2Session: Session;

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
      email: "emp.calendar-events@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "CalEvents",
          workEmail: "emp.calendar-events@company.com",
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
      email: "emp2.calendar-events@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp2",
          lastName: "CalEvents",
          workEmail: "emp2.calendar-events@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1991-02-02"),
          actualResidence: "Test City",
          startYear: 2024,
        },
      },
    },
  });
  employee2UserId = emp2User.id;

  // Create test meetings
  await prisma.meeting.create({
    data: {
      title: "Meeting A",
      type: "ONE_ON_ONE",
      scheduledAt: new Date("2026-07-01T10:00:00Z"),
      durationMinutes: 30,
      createdBy: adminUserId,
      participants: {
        create: [{ userId: employeeUserId }],
      },
    },
  });

  await prisma.meeting.create({
    data: {
      title: "Meeting B",
      type: "PERFORMANCE_REVIEW",
      scheduledAt: new Date("2026-07-02T14:00:00Z"),
      durationMinutes: 60,
      createdBy: adminUserId,
      participants: {
        create: [{ userId: employee2UserId }],
      },
    },
  });

  await prisma.meeting.create({
    data: {
      title: "Meeting C",
      type: "ONE_ON_ONE",
      scheduledAt: new Date("2026-08-15T09:00:00Z"),
      durationMinutes: 45,
      createdBy: adminUserId,
      participants: {
        create: [{ userId: employeeUserId }, { userId: employee2UserId }],
      },
    },
  });

  adminSession = {
    user: { id: adminUserId, email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employeeSession = {
    user: { id: employeeUserId, email: "emp.calendar-events@company.com", role: "EMPLOYEE", name: "Emp CalEvents" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employee2Session = {
    user: { id: employee2UserId, email: "emp2.calendar-events@company.com", role: "EMPLOYEE", name: "Emp2 CalEvents" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

interface MeetingResponse {
  title: string;
  scheduledAt: string;
  participants: Array<{
    user: {
      id: string;
      email: string;
      employee: { firstName: string; lastName: string } | null;
    };
  }>;
}

describe("GET /api/calendar/events", () => {
  it("returns all meetings for admin", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/events");
    const response = await GET(request);
    const { status, data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    expect(status).toBe(200);
    expect(data.data.length).toBeGreaterThanOrEqual(3);
  });

  it("returns only participant meetings for employee", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/calendar/events");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    // Employee is participant of Meeting A and Meeting C
    const titles = data.data.map((m) => m.title);
    expect(titles).toContain("Meeting A");
    expect(titles).toContain("Meeting C");
    expect(titles).not.toContain("Meeting B");
  });

  it("returns only participant meetings for employee2", async () => {
    mockAuthFn.mockResolvedValue(employee2Session);
    const request = createTestRequest("/api/calendar/events");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    const titles = data.data.map((m) => m.title);
    expect(titles).toContain("Meeting B");
    expect(titles).toContain("Meeting C");
    expect(titles).not.toContain("Meeting A");
  });

  it("filters by from date", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/events", {
      searchParams: { from: "2026-08-01T00:00:00Z" },
    });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    const titles = data.data.map((m) => m.title);
    expect(titles).toContain("Meeting C");
    expect(titles).not.toContain("Meeting A");
    expect(titles).not.toContain("Meeting B");
  });

  it("filters by to date", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/events", {
      searchParams: { to: "2026-07-01T23:59:59Z" },
    });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    const titles = data.data.map((m) => m.title);
    expect(titles).toContain("Meeting A");
    expect(titles).not.toContain("Meeting C");
  });

  it("filters by from and to date range", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/events", {
      searchParams: { from: "2026-07-01T00:00:00Z", to: "2026-07-31T23:59:59Z" },
    });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    const titles = data.data.map((m) => m.title);
    expect(titles).toContain("Meeting A");
    expect(titles).toContain("Meeting B");
    expect(titles).not.toContain("Meeting C");
  });

  it("orders meetings by scheduledAt ascending", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/events");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    const dates = data.data.map((m) => new Date(m.scheduledAt).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
    }
  });

  it("includes participants with names", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/calendar/events");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    const meetingA = data.data.find((m) => m.title === "Meeting A");
    expect(meetingA).toBeDefined();
    expect(meetingA!.participants).toHaveLength(1);
    expect(meetingA!.participants[0].user.employee?.firstName).toBe("Emp");
  });

  it("employee date filter is combined with participant filter", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/calendar/events", {
      searchParams: { from: "2026-08-01T00:00:00Z" },
    });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: MeetingResponse[] }>(response);

    // Employee participates in Meeting C (Aug 15), not Meeting B
    const titles = data.data.map((m) => m.title);
    expect(titles).toContain("Meeting C");
    expect(titles).not.toContain("Meeting B");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest("/api/calendar/events");
    const response = await GET(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });
});
