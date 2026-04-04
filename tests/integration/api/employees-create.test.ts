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

import { POST } from "@/app/api/employees/route";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;
let empTypeId: string;
let adminUserId: string;

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
  empTypeId = empType.id;

  const empUser = await prisma.user.create({
    data: {
      email: "emp.create@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "CreateUser",
          workEmail: "emp.create@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1990-01-01"),
          actualResidence: "Test City",
          startYear: 2024,
        },
      },
    },
  });

  adminSession = {
    user: { id: adminUserId, email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employeeSession = {
    user: { id: empUser.id, email: "emp.create@company.com", role: "EMPLOYEE", name: "Emp CreateUser" },
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
    firstName: "Test",
    lastName: "User",
    workEmail: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@company.com`,
    password: "testpass123",
    employmentTypeId: empTypeId,
    dateOfBirth: "1995-06-15",
    actualResidence: "Prague, CZ",
    startYear: 2024,
    ...overrides,
  };
}

describe("POST /api/employees", () => {
  it("creates employee with valid body as admin (201)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const body = validBody();
    const request = createTestRequest("/api/employees", { method: "POST", body });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    expect(status).toBe(201);
    expect(data.data).toHaveProperty("id");
    expect(data.data.firstName).toBe("Test");
    expect(data.data.lastName).toBe("User");
    expect(data.data.workEmail).toBe(body.workEmail);
  });

  it("returns 400 with Zod errors for missing required fields", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/employees", {
      method: "POST",
      body: { firstName: "Test" },
    });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{ error: string; details: Record<string, unknown> }>(response);

    expect(status).toBe(400);
    expect(data.error).toBe("Validation failed");
    expect(data.details).toBeDefined();
    expect(Object.keys(data.details).length).toBeGreaterThan(0);
  });

  it("returns 409 for duplicate workEmail", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const body = validBody({ workEmail: "sofia@company.com" });
    const request = createTestRequest("/api/employees", { method: "POST", body });
    const response = await POST(request);
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(409);
    expect(data.error).toBe("Email already in use");
  });

  it("returns 403 for employee role", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/employees", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest("/api/employees", {
      method: "POST",
      body: validBody(),
    });
    const response = await POST(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });

  it("hashes the password in the database", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const email = `hash-test-${Date.now()}@company.com`;
    const body = validBody({ workEmail: email, password: "mySecretPass123" });
    const request = createTestRequest("/api/employees", { method: "POST", body });
    await POST(request);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toBe("mySecretPass123");
    expect(await bcrypt.compare("mySecretPass123", user!.passwordHash)).toBe(true);
  });

  it("creates both User and Employee records in a transaction", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const email = `txn-test-${Date.now()}@company.com`;
    const body = validBody({ workEmail: email });
    const request = createTestRequest("/api/employees", { method: "POST", body });
    const response = await POST(request);
    const { data } = await parseJsonResponse<{ data: Record<string, unknown> }>(response);

    const user = await prisma.user.findUnique({ where: { email } });
    const employee = await prisma.employee.findUnique({
      where: { id: data.data.id as string },
    });

    expect(user).not.toBeNull();
    expect(employee).not.toBeNull();
    expect(employee!.userId).toBe(user!.id);
  });

  it("creates user with EMPLOYEE role by default", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const email = `role-test-${Date.now()}@company.com`;
    const body = validBody({ workEmail: email });
    const request = createTestRequest("/api/employees", { method: "POST", body });
    await POST(request);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user!.role).toBe(Role.EMPLOYEE);
  });
});
