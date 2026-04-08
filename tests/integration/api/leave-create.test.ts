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

import { POST } from "@/app/api/leave/route";

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
      email: "emp.leave-create@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "LeaveCreate",
          workEmail: "emp.leave-create@company.com",
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
    user: { id: employeeUserId, email: "emp.leave-create@company.com", role: "EMPLOYEE", name: "Emp LeaveCreate" },
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
    type: "VACATION",
    startDate: "2026-06-01",
    endDate: "2026-06-05",
    ...overrides,
  };
}

describe("POST /api/leave", () => {
  it("creates leave request with valid body as employee (201)", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{ data: { id: string; status: string } }>(response);

    expect(status).toBe(201);
    expect(data.data).toHaveProperty("id");
  });

  it("creates leave request as admin (201)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(201);
  });

  it("sets userId to the authenticated user", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { userId: string } }>(response);

    expect(data.data.userId).toBe(employeeUserId);
  });

  it("returns PENDING status by default", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { status: string } }>(response);

    expect(data.data.status).toBe("PENDING");
  });

  it("includes user.employee info in response", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{
      data: { user: { employee: { firstName: string; lastName: string } } };
    }>(response);

    expect(data.data.user.employee.firstName).toBe("Emp");
    expect(data.data.user.employee.lastName).toBe("LeaveCreate");
  });

  it("stores reason when provided", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", {
      method: "POST",
      body: validBody({ reason: "Doctor appointment" }),
    });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { reason: string } }>(response);

    expect(data.data.reason).toBe("Doctor appointment");
  });

  it("stores null reason when omitted", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { reason: string | null } }>(response);

    expect(data.data.reason).toBeNull();
  });

  it("persists the leave request in the database", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: { id: string } }>(response);

    const dbRecord = await prisma.leaveRequest.findUnique({ where: { id: data.data.id } });
    expect(dbRecord).not.toBeNull();
    expect(dbRecord!.status).toBe("PENDING");
    expect(dbRecord!.userId).toBe(employeeUserId);
  });

  it("returns 400 for missing required fields", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", { method: "POST", body: {} });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("returns 400 when endDate before startDate", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", {
      method: "POST",
      body: validBody({ startDate: "2026-06-10", endDate: "2026-06-01" }),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });

  it("returns 400 for invalid leave type", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/leave", {
      method: "POST",
      body: validBody({ type: "HOLIDAY" }),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest("/api/leave", { method: "POST", body: validBody() });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });
});
