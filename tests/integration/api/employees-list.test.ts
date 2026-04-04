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

import { GET } from "@/app/api/employees/route";

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

  const emp1 = await prisma.user.create({
    data: {
      email: "john.list@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "John",
          lastName: "Doe",
          workEmail: "john.list@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1992-05-15"),
          actualResidence: "Berlin, DE",
          startYear: 2023,
          position: "Developer",
          department: "Engineering",
        },
      },
    },
  });
  employeeUserId = emp1.id;

  await prisma.user.create({
    data: {
      email: "jane.list@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Jane",
          lastName: "Smith",
          workEmail: "jane.list@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1988-03-20"),
          actualResidence: "London, UK",
          startYear: 2022,
          position: "Designer",
          department: "Design",
        },
      },
    },
  });

  adminSession = {
    user: { id: adminUserId, email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employeeSession = {
    user: { id: employeeUserId, email: "john.list@company.com", role: "EMPLOYEE", name: "John Doe" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

describe("GET /api/employees", () => {
  it("returns all employees for admin", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/employees");
    const response = await GET(request);
    const { status, data } = await parseJsonResponse<{ data: unknown[] }>(response);

    expect(status).toBe(200);
    expect(data.data.length).toBeGreaterThanOrEqual(3);
  });

  it("returns only own record for employee", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest("/api/employees");
    const response = await GET(request);
    const { status, data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

    expect(status).toBe(200);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].workEmail).toBe("john.list@company.com");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest("/api/employees");
    const response = await GET(request);
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });

  it("includes expected fields in response", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/employees");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

    const emp = data.data.find((e) => e.workEmail === "john.list@company.com");
    expect(emp).toBeDefined();
    expect(emp).toHaveProperty("id");
    expect(emp).toHaveProperty("firstName", "John");
    expect(emp).toHaveProperty("lastName", "Doe");
    expect(emp).toHaveProperty("workEmail");
    expect(emp).toHaveProperty("position");
    expect(emp).toHaveProperty("department");
    expect(emp).toHaveProperty("avatarUrl");
    expect(emp).toHaveProperty("employmentType");
    expect(emp!.employmentType).toHaveProperty("name");
  });

  it("does not include passwordHash in any response", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest("/api/employees");
    const response = await GET(request);
    const { data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

    for (const emp of data.data) {
      expect(emp).not.toHaveProperty("passwordHash");
      expect(emp).not.toHaveProperty("password_hash");
      if (emp.user && typeof emp.user === "object") {
        expect(emp.user).not.toHaveProperty("passwordHash");
        expect(emp.user).not.toHaveProperty("password_hash");
      }
    }
  });

  describe("search", () => {
    it("filters by first name", async () => {
      mockAuthFn.mockResolvedValue(adminSession);
      const request = createTestRequest("/api/employees", {
        searchParams: { q: "Sofia" },
      });
      const response = await GET(request);
      const { status, data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

      expect(status).toBe(200);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
      expect(data.data.some((e) => e.firstName === "Sofia")).toBe(true);
    });

    it("is case-insensitive", async () => {
      mockAuthFn.mockResolvedValue(adminSession);
      const request = createTestRequest("/api/employees", {
        searchParams: { q: "john" },
      });
      const response = await GET(request);
      const { data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

      expect(data.data.some((e) => e.firstName === "John")).toBe(true);
    });

    it("searches by lastName", async () => {
      mockAuthFn.mockResolvedValue(adminSession);
      const request = createTestRequest("/api/employees", {
        searchParams: { q: "Smith" },
      });
      const response = await GET(request);
      const { data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

      expect(data.data.some((e) => e.lastName === "Smith")).toBe(true);
    });

    it("searches by workEmail", async () => {
      mockAuthFn.mockResolvedValue(adminSession);
      const request = createTestRequest("/api/employees", {
        searchParams: { q: "jane.list@" },
      });
      const response = await GET(request);
      const { data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

      expect(data.data.some((e) => e.workEmail === "jane.list@company.com")).toBe(true);
    });

    it("searches by position", async () => {
      mockAuthFn.mockResolvedValue(adminSession);
      const request = createTestRequest("/api/employees", {
        searchParams: { q: "Developer" },
      });
      const response = await GET(request);
      const { data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

      expect(data.data.some((e) => e.position === "Developer")).toBe(true);
    });

    it("searches by department", async () => {
      mockAuthFn.mockResolvedValue(adminSession);
      const request = createTestRequest("/api/employees", {
        searchParams: { q: "Design" },
      });
      const response = await GET(request);
      const { data } = await parseJsonResponse<{ data: Record<string, unknown>[] }>(response);

      expect(data.data.some((e) => e.department === "Design")).toBe(true);
    });

    it("returns all when search query is empty", async () => {
      mockAuthFn.mockResolvedValue(adminSession);
      const request = createTestRequest("/api/employees", {
        searchParams: { q: "" },
      });
      const response = await GET(request);
      const { data } = await parseJsonResponse<{ data: unknown[] }>(response);

      expect(data.data.length).toBeGreaterThanOrEqual(3);
    });
  });
});
