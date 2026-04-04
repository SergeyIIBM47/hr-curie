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

import { PUT } from "@/app/api/employees/[id]/role/route";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

let adminUserId: string;
let adminEmployeeId: string;
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
    include: { employee: true },
  });
  adminUserId = adminUser.id;
  adminEmployeeId = adminUser.employee!.id;

  const empType = await prisma.employmentType.findFirstOrThrow();

  const empUser = await prisma.user.create({
    data: {
      email: "john.role@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "John",
          lastName: "RoleTest",
          workEmail: "john.role@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1992-05-15"),
          actualResidence: "Berlin, DE",
          startYear: 2023,
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
    user: { id: employeeUserId, email: "john.role@company.com", role: "EMPLOYEE", name: "John RoleTest" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

describe("PUT /api/employees/[id]/role", () => {
  it("admin can change EMPLOYEE to ADMIN", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}/role`, {
      method: "PUT",
      body: { role: "ADMIN" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status, data } = await parseJsonResponse<{ data: { id: string; role: string } }>(response);

    expect(status).toBe(200);
    expect(data.data.role).toBe("ADMIN");

    const user = await prisma.user.findUnique({ where: { id: employeeUserId } });
    expect(user!.role).toBe(Role.ADMIN);
  });

  it("admin can change ADMIN back to EMPLOYEE", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}/role`, {
      method: "PUT",
      body: { role: "EMPLOYEE" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status, data } = await parseJsonResponse<{ data: { id: string; role: string } }>(response);

    expect(status).toBe(200);
    expect(data.data.role).toBe("EMPLOYEE");

    const user = await prisma.user.findUnique({ where: { id: employeeUserId } });
    expect(user!.role).toBe(Role.EMPLOYEE);
  });

  it("admin cannot change own role", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${adminEmployeeId}/role`, {
      method: "PUT",
      body: { role: "EMPLOYEE" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: adminEmployeeId }) });
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(data.error).toBe("Cannot change your own role");
  });

  it("employee cannot change roles (403)", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest(`/api/employees/${adminEmployeeId}/role`, {
      method: "PUT",
      body: { role: "EMPLOYEE" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: adminEmployeeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(403);
  });

  it("returns 404 for non-existent employee", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const fakeId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    const request = createTestRequest(`/api/employees/${fakeId}/role`, {
      method: "PUT",
      body: { role: "ADMIN" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: fakeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest(`/api/employees/${employeeId}/role`, {
      method: "PUT",
      body: { role: "ADMIN" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });

  it("returns 400 for invalid role value", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}/role`, {
      method: "PUT",
      body: { role: "SUPERADMIN" },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: employeeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });
});
