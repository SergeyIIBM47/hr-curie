import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient, Role } from "@prisma/client";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import { setupTestDb, teardownTestDb } from "../../helpers/setup-db";
import { createTestRequest, parseJsonResponse } from "../../helpers/test-request";

// --- Hoisted mocks ---
const mockAuthFn = vi.hoisted(() => vi.fn());
const prismaHolder = vi.hoisted(() => ({ instance: null as unknown as PrismaClient }));

vi.mock("@/lib/auth", () => ({ auth: mockAuthFn }));
vi.mock("@/lib/prisma", () => ({
  get prisma() {
    return prismaHolder.instance;
  },
}));

import { PUT } from "@/app/api/employees/[id]/route";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

let adminUserId: string;
let employeeUserId: string;
let employeeId: string;

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
      email: "john.update@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "John",
          lastName: "UpdateTest",
          workEmail: "john.update@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1992-05-15"),
          actualResidence: "Berlin, DE",
          startYear: 2023,
          position: "Developer",
          department: "Engineering",
        },
      },
    },
    include: { employee: true },
  });
  employeeUserId = empUser.id;
  employeeId = empUser.employee!.id;

  adminSession = {
    user: { id: adminUserId, email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employeeSession = {
    user: { id: employeeUserId, email: "john.update@company.com", role: "EMPLOYEE", name: "John UpdateTest" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

describe("PUT /api/employees/[id]", () => {
  it("updates employee with valid body as admin (200)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}`, {
      method: "PUT",
      body: { firstName: "Updated", lastName: "Name" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status, data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    expect(status).toBe(200);
    expect(data.data.firstName).toBe("Updated");
    expect(data.data.lastName).toBe("Name");
  });

  it("updates only provided fields (partial update)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}`, {
      method: "PUT",
      body: { position: "Senior Developer" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status, data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    expect(status).toBe(200);
    expect(data.data.position).toBe("Senior Developer");
    // Previous update's firstName should persist
    expect(data.data.firstName).toBe("Updated");
  });

  it("returns 400 for invalid body (bad startYear type)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}`, {
      method: "PUT",
      body: { startYear: "not-a-number" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status, data } = await parseJsonResponse<{ error: string; details?: unknown }>(response);

    expect(status).toBe(400);
    expect(data.error).toBe("Validation failed");
  });

  it("returns 403 for employee role", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest(`/api/employees/${employeeId}`, {
      method: "PUT",
      body: { firstName: "Hacker" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest(`/api/employees/${employeeId}`, {
      method: "PUT",
      body: { firstName: "Hacker" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });

  it("returns 404 for non-existent ID", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const fakeId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    const request = createTestRequest(`/api/employees/${fakeId}`, {
      method: "PUT",
      body: { firstName: "Ghost" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: fakeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(404);
  });
});
