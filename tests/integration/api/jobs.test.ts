import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient, Role } from "@prisma/client";
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

import { GET, POST } from "@/app/api/jobs/route";
import { PATCH } from "@/app/api/jobs/[id]/route";

let prisma: PrismaClient;

let adminUserId: string;
let employeeUserId: string;

let adminSession: Session;
let employeeSession: Session;

beforeAll(async () => {
  const db = await setupTestDb();
  prisma = db.prisma;
  prismaHolder.instance = prisma;

  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email: "sofia@company.com" },
  });
  adminUserId = adminUser.id;

  const empType = await prisma.employmentType.findFirstOrThrow();

  const empUser = await prisma.user.create({
    data: {
      email: "emp.jobs@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "Jobs",
          workEmail: "emp.jobs@company.com",
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
    user: { id: employeeUserId, email: "emp.jobs@company.com", role: "EMPLOYEE", name: "Emp Jobs" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string | null;
  status: string;
  priority: boolean;
  filledById: string | null;
  filledAt: string | null;
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote (EU)",
    priority: false,
    ...overrides,
  };
}

describe("GET /api/jobs", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const response = await GET(createTestRequest("/api/jobs"));
    expect((await parseJsonResponse(response)).status).toBe(401);
  });

  it("admin lists jobs", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    // Ensure rows exist
    await prisma.jobRequisition.create({
      data: { title: "List Job A", department: "Eng", priority: true },
    });
    await prisma.jobRequisition.create({
      data: { title: "List Job B", department: "Eng", priority: false, status: "PAUSED" },
    });

    const response = await GET(createTestRequest("/api/jobs"));
    const { status, data } = await parseJsonResponse<{ data: JobItem[] }>(response);
    expect(status).toBe(200);
    expect(data.data.length).toBeGreaterThanOrEqual(2);
  });

  it("employee can list jobs (both roles allowed)", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await GET(createTestRequest("/api/jobs"));
    expect((await parseJsonResponse(response)).status).toBe(200);
  });

  it("filters by status=OPEN", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await GET(
      createTestRequest("/api/jobs", { searchParams: { status: "OPEN" } }),
    );
    const { data } = await parseJsonResponse<{ data: JobItem[] }>(response);
    for (const job of data.data) {
      expect(job.status).toBe("OPEN");
    }
  });

  it("filters by priority=true", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await GET(
      createTestRequest("/api/jobs", { searchParams: { priority: "true" } }),
    );
    const { data } = await parseJsonResponse<{ data: JobItem[] }>(response);
    expect(data.data.length).toBeGreaterThanOrEqual(1);
    for (const job of data.data) {
      expect(job.priority).toBe(true);
    }
  });

  it("returns 400 for invalid status", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await GET(
      createTestRequest("/api/jobs", { searchParams: { status: "BOGUS" } }),
    );
    expect((await parseJsonResponse(response)).status).toBe(400);
  });
});

describe("POST /api/jobs", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const response = await POST(
      createTestRequest("/api/jobs", { method: "POST", body: validBody() }),
    );
    expect((await parseJsonResponse(response)).status).toBe(401);
  });

  it("returns 403 for employee role", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await POST(
      createTestRequest("/api/jobs", { method: "POST", body: validBody() }),
    );
    expect((await parseJsonResponse(response)).status).toBe(403);
  });

  it("admin creates a job (201)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await POST(
      createTestRequest("/api/jobs", {
        method: "POST",
        body: validBody({ title: "CreateRoundTrip", priority: true }),
      }),
    );
    const { status, data } = await parseJsonResponse<{ data: JobItem }>(response);
    expect(status).toBe(201);
    expect(data.data.title).toBe("CreateRoundTrip");
    expect(data.data.priority).toBe(true);
    expect(data.data.status).toBe("OPEN");

    const record = await prisma.jobRequisition.findUnique({ where: { id: data.data.id } });
    expect(record).not.toBeNull();
  });

  it("returns 400 for missing title", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await POST(
      createTestRequest("/api/jobs", {
        method: "POST",
        body: { department: "Engineering" },
      }),
    );
    expect((await parseJsonResponse(response)).status).toBe(400);
  });
});

describe("PATCH /api/jobs/[id]", () => {
  it("admin updates job (200)", async () => {
    const job = await prisma.jobRequisition.create({
      data: { title: "Patch Target", department: "Sales" },
    });
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await PATCH(
      createTestRequest(`/api/jobs/${job.id}`, {
        method: "PATCH",
        body: { status: "PAUSED", priority: true },
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    const { status, data } = await parseJsonResponse<{ data: JobItem }>(response);
    expect(status).toBe(200);
    expect(data.data.status).toBe("PAUSED");
    expect(data.data.priority).toBe(true);
  });

  it("sets filledAt automatically when status -> FILLED", async () => {
    const job = await prisma.jobRequisition.create({
      data: { title: "Fill Me", department: "Marketing" },
    });
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await PATCH(
      createTestRequest(`/api/jobs/${job.id}`, {
        method: "PATCH",
        body: { status: "FILLED" },
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    const { data } = await parseJsonResponse<{ data: JobItem }>(response);
    expect(data.data.status).toBe("FILLED");
    expect(data.data.filledAt).not.toBeNull();
  });

  it("returns 403 for employee role", async () => {
    const job = await prisma.jobRequisition.create({
      data: { title: "Forbidden Patch", department: "Eng" },
    });
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await PATCH(
      createTestRequest(`/api/jobs/${job.id}`, {
        method: "PATCH",
        body: { priority: true },
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect((await parseJsonResponse(response)).status).toBe(403);
  });

  it("returns 404 when job missing", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await PATCH(
      createTestRequest("/api/jobs/missing", {
        method: "PATCH",
        body: { priority: true },
      }),
      { params: Promise.resolve({ id: "missing-id" }) },
    );
    expect((await parseJsonResponse(response)).status).toBe(404);
  });

  it("returns 400 for invalid status", async () => {
    const job = await prisma.jobRequisition.create({
      data: { title: "Invalid Patch", department: "Eng" },
    });
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await PATCH(
      createTestRequest(`/api/jobs/${job.id}`, {
        method: "PATCH",
        body: { status: "WAT" },
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect((await parseJsonResponse(response)).status).toBe(400);
  });
});
