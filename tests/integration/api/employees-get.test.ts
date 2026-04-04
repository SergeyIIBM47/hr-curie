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

import { GET } from "@/app/api/employees/[id]/route";

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
      email: "john.get@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "John",
          lastName: "GetTest",
          workEmail: "john.get@company.com",
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
    user: { id: employeeUserId, email: "john.get@company.com", role: "EMPLOYEE", name: "John GetTest" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

describe("GET /api/employees/[id]", () => {
  it("returns full employee detail for admin", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}`);
    const response = await GET(request, { params: Promise.resolve({ id: employeeId }) });
    const { status, data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    expect(status).toBe(200);
    expect(data.data.id).toBe(employeeId);
    expect(data.data.firstName).toBe("John");
    expect(data.data.lastName).toBe("GetTest");
  });

  it("returns own detail for employee", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest(`/api/employees/${employeeId}`);
    const response = await GET(request, { params: Promise.resolve({ id: employeeId }) });
    const { status, data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    expect(status).toBe(200);
    expect(data.data.id).toBe(employeeId);
  });

  it("returns 404 when employee accesses another employee's record", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest(`/api/employees/${adminEmployeeId}`);
    const response = await GET(request, { params: Promise.resolve({ id: adminEmployeeId }) });
    const { status } = await parseJsonResponse(response);

    // Returns 404 (not 403) to avoid leaking existence of other records
    expect(status).toBe(404);
  });

  it("returns 404 for non-existent ID", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const fakeId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    const request = createTestRequest(`/api/employees/${fakeId}`);
    const response = await GET(request, { params: Promise.resolve({ id: fakeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(404);
  });

  it("returns 404 for invalid ID format", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/employees/not-a-valid-id");
    const response = await GET(request, { params: Promise.resolve({ id: "not-a-valid-id" }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(404);
  });

  it("includes employment type with id and name", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}`);
    const response = await GET(request, { params: Promise.resolve({ id: employeeId }) });
    const { data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    const empType = data.data.employmentType as Record<string, unknown>;
    expect(empType).toBeDefined();
    expect(empType).toHaveProperty("id");
    expect(empType).toHaveProperty("name");
  });

  it("does not include passwordHash in response", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/employees/${employeeId}`);
    const response = await GET(request, { params: Promise.resolve({ id: employeeId }) });
    const { data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    expect(data.data).not.toHaveProperty("passwordHash");
    expect(data.data).not.toHaveProperty("password_hash");
    if (data.data.user && typeof data.data.user === "object") {
      expect(data.data.user).not.toHaveProperty("passwordHash");
      expect(data.data.user).not.toHaveProperty("password_hash");
    }
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest(`/api/employees/${employeeId}`);
    const response = await GET(request, { params: Promise.resolve({ id: employeeId }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });
});
