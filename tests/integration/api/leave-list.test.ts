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

import { GET } from "@/app/api/leave/route";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

let adminUserId: string;
let employeeUserId: string;

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
      email: "emp.leave-list@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "LeaveList",
          workEmail: "emp.leave-list@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1990-01-01"),
          actualResidence: "Test City",
          startYear: 2024,
        },
      },
    },
  });
  employeeUserId = empUser.id;

  adminSession = {
    user: { id: adminUserId, email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employeeSession = {
    user: { id: employeeUserId, email: "emp.leave-list@company.com", role: "EMPLOYEE", name: "Emp LeaveList" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  // Seed leave requests: 2 for employee, 1 for admin
  await prisma.leaveRequest.create({
    data: {
      userId: employeeUserId,
      type: "VACATION",
      status: "PENDING",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-05"),
    },
  });

  await prisma.leaveRequest.create({
    data: {
      userId: employeeUserId,
      type: "SICK_LEAVE",
      status: "APPROVED",
      startDate: new Date("2026-05-10"),
      endDate: new Date("2026-05-10"),
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    },
  });

  await prisma.leaveRequest.create({
    data: {
      userId: adminUserId,
      type: "DAY_OFF",
      status: "PENDING",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-01"),
    },
  });
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

interface LeaveItem {
  id: string;
  userId: string;
  status: string;
  user: { employee: { firstName: string; lastName: string } };
  createdAt: string;
}

describe("GET /api/leave", () => {
  it("admin sees all leave requests", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/leave");
    const response = await GET(request);
    const { status, data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    expect(status).toBe(200);
    expect(data.data.length).toBeGreaterThanOrEqual(3);
  });

  it("employee sees only own leave requests", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    expect(data.data.length).toBe(2);
    for (const item of data.data) {
      expect(item.userId).toBe(employeeUserId);
    }
  });

  it("admin can filter by status=PENDING", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/leave", { searchParams: { status: "PENDING" } });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    expect(data.data.length).toBeGreaterThanOrEqual(2);
    for (const item of data.data) {
      expect(item.status).toBe("PENDING");
    }
  });

  it("admin can filter by status=APPROVED", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/leave", { searchParams: { status: "APPROVED" } });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    expect(data.data.length).toBeGreaterThanOrEqual(1);
    for (const item of data.data) {
      expect(item.status).toBe("APPROVED");
    }
  });

  it("employee filter still scopes to own requests", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { searchParams: { status: "PENDING" } });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    expect(data.data.length).toBe(1);
    expect(data.data[0].userId).toBe(employeeUserId);
    expect(data.data[0].status).toBe("PENDING");
  });

  it("results ordered by createdAt desc", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/leave");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    for (let i = 1; i < data.data.length; i++) {
      const prev = new Date(data.data[i - 1].createdAt).getTime();
      const curr = new Date(data.data[i].createdAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it("each result includes user.employee info", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/leave");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    for (const item of data.data) {
      expect(item.user.employee).toHaveProperty("firstName");
      expect(item.user.employee).toHaveProperty("lastName");
    }
  });

  it("returns empty array when no requests match filter", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { searchParams: { status: "REJECTED" } });
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: LeaveItem[] }>(response);

    expect(data.data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest("/api/leave");
    const response = await GET(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });
});
