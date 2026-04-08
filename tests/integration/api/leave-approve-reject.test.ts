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

import { POST as approveHandler } from "@/app/api/leave/[id]/approve/route";
import { POST as rejectHandler } from "@/app/api/leave/[id]/reject/route";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

let adminUserId: string;
let employeeUserId: string;

let adminSession: Session;
let employeeSession: Session;

// Leave request IDs for approve tests
let pendingForApprove1: string;
let pendingForApprove2: string;
let pendingForApprove3: string;

// Leave request IDs for reject tests
let pendingForReject1: string;
let pendingForReject2: string;
let pendingForReject3: string;

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
      email: "emp.leave-approve@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "LeaveApprove",
          workEmail: "emp.leave-approve@company.com",
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
    user: { id: employeeUserId, email: "emp.leave-approve@company.com", role: "EMPLOYEE", name: "Emp LeaveApprove" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  // Create PENDING leave requests for approve tests
  const createPending = () =>
    prisma.leaveRequest.create({
      data: {
        userId: employeeUserId,
        type: "VACATION",
        status: "PENDING",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-05"),
      },
    });

  const [a1, a2, a3, r1, r2, r3] = await Promise.all([
    createPending(),
    createPending(),
    createPending(),
    createPending(),
    createPending(),
    createPending(),
  ]);

  pendingForApprove1 = a1.id;
  pendingForApprove2 = a2.id;
  pendingForApprove3 = a3.id;
  pendingForReject1 = r1.id;
  pendingForReject2 = r2.id;
  pendingForReject3 = r3.id;
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

describe("POST /api/leave/[id]/approve", () => {
  it("admin approves a PENDING request", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/leave/${pendingForApprove1}/approve`, { method: "POST" });
    const response = await approveHandler(request, { params: Promise.resolve({ id: pendingForApprove1 }) });
    const { status, data } = await parseJsonResponse<{ data: { status: string } }>(response);

    expect(status).toBe(200);
    expect(data.data.status).toBe("APPROVED");
  });

  it("sets reviewedBy to admin user id", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/leave/${pendingForApprove2}/approve`, { method: "POST" });
    const response = await approveHandler(request, { params: Promise.resolve({ id: pendingForApprove2 }) });
    const { data } = await parseJsonResponse<{ data: { reviewedBy: string } }>(response);

    expect(data.data.reviewedBy).toBe(adminUserId);
  });

  it("sets reviewedAt to a recent timestamp", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/leave/${pendingForApprove3}/approve`, { method: "POST" });
    const before = Date.now();
    const response = await approveHandler(request, { params: Promise.resolve({ id: pendingForApprove3 }) });
    const { data } = await parseJsonResponse<{ data: { reviewedAt: string } }>(response);

    const reviewedAt = new Date(data.data.reviewedAt).getTime();
    expect(reviewedAt).toBeGreaterThanOrEqual(before - 5000);
    expect(reviewedAt).toBeLessThanOrEqual(Date.now() + 5000);
  });

  it("persists APPROVED in database", async () => {
    // pendingForApprove1 was approved in the first test
    const dbRecord = await prisma.leaveRequest.findUnique({ where: { id: pendingForApprove1 } });
    expect(dbRecord!.status).toBe("APPROVED");
    expect(dbRecord!.reviewedBy).toBe(adminUserId);
  });

  it("returns 400 when already APPROVED", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    // pendingForApprove1 was already approved
    const request = createTestRequest(`/api/leave/${pendingForApprove1}/approve`, { method: "POST" });
    const response = await approveHandler(request, { params: Promise.resolve({ id: pendingForApprove1 }) });
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(data.error).toBe("Only PENDING requests can be approved");
  });

  it("returns 400 when already REJECTED", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    // First reject pendingForReject3, then try to approve it
    await prisma.leaveRequest.update({
      where: { id: pendingForReject3 },
      data: { status: "REJECTED", reviewedBy: adminUserId, reviewedAt: new Date() },
    });

    const request = createTestRequest(`/api/leave/${pendingForReject3}/approve`, { method: "POST" });
    const response = await approveHandler(request, { params: Promise.resolve({ id: pendingForReject3 }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });

  it("returns 404 for non-existent leave id", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const fakeId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    const request = createTestRequest(`/api/leave/${fakeId}/approve`, { method: "POST" });
    const response = await approveHandler(request, { params: Promise.resolve({ id: fakeId }) });
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(404);
    expect(data.error).toBe("Leave request not found");
  });

  it("returns 403 for employee role", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest(`/api/leave/${pendingForReject1}/approve`, { method: "POST" });
    const response = await approveHandler(request, { params: Promise.resolve({ id: pendingForReject1 }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest(`/api/leave/${pendingForReject1}/approve`, { method: "POST" });
    const response = await approveHandler(request, { params: Promise.resolve({ id: pendingForReject1 }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });
});

describe("POST /api/leave/[id]/reject", () => {
  it("admin rejects a PENDING request", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/leave/${pendingForReject1}/reject`, { method: "POST" });
    const response = await rejectHandler(request, { params: Promise.resolve({ id: pendingForReject1 }) });
    const { status, data } = await parseJsonResponse<{ data: { status: string } }>(response);

    expect(status).toBe(200);
    expect(data.data.status).toBe("REJECTED");
  });

  it("sets reviewedBy to admin user id", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(`/api/leave/${pendingForReject2}/reject`, { method: "POST" });
    const response = await rejectHandler(request, { params: Promise.resolve({ id: pendingForReject2 }) });
    const { data } = await parseJsonResponse<{ data: { reviewedBy: string } }>(response);

    expect(data.data.reviewedBy).toBe(adminUserId);
  });

  it("sets reviewedAt to a recent timestamp", async () => {
    // pendingForReject2 was rejected in the previous test
    const dbRecord = await prisma.leaveRequest.findUnique({ where: { id: pendingForReject2 } });
    expect(dbRecord!.reviewedAt).not.toBeNull();
  });

  it("persists REJECTED in database", async () => {
    const dbRecord = await prisma.leaveRequest.findUnique({ where: { id: pendingForReject1 } });
    expect(dbRecord!.status).toBe("REJECTED");
    expect(dbRecord!.reviewedBy).toBe(adminUserId);
  });

  it("returns 400 when already REJECTED", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    // pendingForReject1 was already rejected
    const request = createTestRequest(`/api/leave/${pendingForReject1}/reject`, { method: "POST" });
    const response = await rejectHandler(request, { params: Promise.resolve({ id: pendingForReject1 }) });
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(data.error).toBe("Only PENDING requests can be rejected");
  });

  it("returns 400 when already APPROVED", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    // pendingForApprove1 was approved earlier
    const request = createTestRequest(`/api/leave/${pendingForApprove1}/reject`, { method: "POST" });
    const response = await rejectHandler(request, { params: Promise.resolve({ id: pendingForApprove1 }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(400);
  });

  it("returns 404 for non-existent leave id", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const fakeId = "clxxxxxxxxxxxxxxxxxxxxxxxxx";
    const request = createTestRequest(`/api/leave/${fakeId}/reject`, { method: "POST" });
    const response = await rejectHandler(request, { params: Promise.resolve({ id: fakeId }) });
    const { status, data } = await parseJsonResponse<{ error: string }>(response);

    expect(status).toBe(404);
    expect(data.error).toBe("Leave request not found");
  });

  it("returns 403 for employee role", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const request = createTestRequest(`/api/leave/${pendingForReject1}/reject`, { method: "POST" });
    const response = await rejectHandler(request, { params: Promise.resolve({ id: pendingForReject1 }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(403);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const request = createTestRequest(`/api/leave/${pendingForReject1}/reject`, { method: "POST" });
    const response = await rejectHandler(request, { params: Promise.resolve({ id: pendingForReject1 }) });
    const { status } = await parseJsonResponse(response);

    expect(status).toBe(401);
  });
});
