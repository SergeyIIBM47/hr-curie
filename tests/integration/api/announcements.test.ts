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

import { GET, POST } from "@/app/api/announcements/route";

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
      email: "emp.announcements@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "Announcements",
          workEmail: "emp.announcements@company.com",
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
    user: { id: employeeUserId, email: "emp.announcements@company.com", role: "EMPLOYEE", name: "Emp Announcements" },
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
    title: "New parking policy",
    body: "Garage access cards will be reissued next month.",
    tag: "POLICY",
    ...overrides,
  };
}

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  tag: string;
  authorId: string;
  createdAt: string;
  author: { id: string; email: string };
}

describe("GET /api/announcements", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const response = await GET(createTestRequest("/api/announcements"));
    const { status } = await parseJsonResponse(response);
    expect(status).toBe(401);
  });

  it("admin can list announcements", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await GET(createTestRequest("/api/announcements"));
    const { status, data } = await parseJsonResponse<{ data: AnnouncementItem[] }>(response);
    expect(status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("employee can list announcements", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await GET(createTestRequest("/api/announcements"));
    const { status, data } = await parseJsonResponse<{ data: AnnouncementItem[] }>(response);
    expect(status).toBe(200);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("respects limit query parameter", async () => {
    // create a couple more so we have >=2 rows
    await prisma.announcement.create({
      data: { authorId: adminUserId, title: "Extra A", body: "x", tag: "TEAM" },
    });
    await prisma.announcement.create({
      data: { authorId: adminUserId, title: "Extra B", body: "x", tag: "TEAM" },
    });

    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await GET(
      createTestRequest("/api/announcements", { searchParams: { limit: "1" } }),
    );
    const { data } = await parseJsonResponse<{ data: AnnouncementItem[] }>(response);
    expect(data.data.length).toBe(1);
  });

  it("orders by createdAt desc", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await GET(createTestRequest("/api/announcements"));
    const { data } = await parseJsonResponse<{ data: AnnouncementItem[] }>(response);
    for (let i = 1; i < data.data.length; i++) {
      const prev = new Date(data.data[i - 1].createdAt).getTime();
      const curr = new Date(data.data[i].createdAt).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });
});

describe("POST /api/announcements", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const response = await POST(
      createTestRequest("/api/announcements", { method: "POST", body: validBody() }),
    );
    const { status } = await parseJsonResponse(response);
    expect(status).toBe(401);
  });

  it("returns 403 for employee role", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await POST(
      createTestRequest("/api/announcements", { method: "POST", body: validBody() }),
    );
    const { status } = await parseJsonResponse(response);
    expect(status).toBe(403);
  });

  it("admin creates announcement (201)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await POST(
      createTestRequest("/api/announcements", { method: "POST", body: validBody() }),
    );
    const { status, data } = await parseJsonResponse<{ data: AnnouncementItem }>(response);
    expect(status).toBe(201);
    expect(data.data.title).toBe("New parking policy");
    expect(data.data.tag).toBe("POLICY");
    expect(data.data.authorId).toBe(adminUserId);
  });

  it("persists announcement in DB", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await POST(
      createTestRequest("/api/announcements", {
        method: "POST",
        body: validBody({ title: "Round trip", tag: "HR" }),
      }),
    );
    const { data } = await parseJsonResponse<{ data: AnnouncementItem }>(response);
    const record = await prisma.announcement.findUnique({ where: { id: data.data.id } });
    expect(record).not.toBeNull();
    expect(record!.title).toBe("Round trip");
    expect(record!.tag).toBe("HR");
  });

  it("returns 400 for missing title", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await POST(
      createTestRequest("/api/announcements", {
        method: "POST",
        body: { body: "no title", tag: "POLICY" },
      }),
    );
    const { status } = await parseJsonResponse(response);
    expect(status).toBe(400);
  });

  it("returns 400 for invalid tag", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await POST(
      createTestRequest("/api/announcements", {
        method: "POST",
        body: validBody({ tag: "SPAM" }),
      }),
    );
    const { status } = await parseJsonResponse(response);
    expect(status).toBe(400);
  });
});
