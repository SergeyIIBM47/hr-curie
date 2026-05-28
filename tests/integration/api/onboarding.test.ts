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

import { GET as getActive } from "@/app/api/onboarding/active/route";
import { POST as postPlan } from "@/app/api/onboarding/route";
import { PATCH as patchStep } from "@/app/api/onboarding/[id]/step/[stepId]/route";

let prisma: PrismaClient;

let adminUserId: string;
let employeeUserId: string;
let employeeId: string;
let secondEmployeeId: string;

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
      email: "emp.onboarding@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Emp",
          lastName: "Onboarding",
          workEmail: "emp.onboarding@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1990-01-01"),
          actualResidence: "Test City",
          startYear: 2024,
          startDate: new Date("2024-04-01"),
        },
      },
    },
    include: { employee: true },
  });
  employeeUserId = empUser.id;
  employeeId = empUser.employee!.id;

  const secondEmp = await prisma.user.create({
    data: {
      email: "emp2.onboarding@company.com",
      passwordHash: await bcrypt.hash("testpass123", 12),
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: "Second",
          lastName: "Onboarding",
          workEmail: "emp2.onboarding@company.com",
          employmentTypeId: empType.id,
          dateOfBirth: new Date("1990-01-01"),
          actualResidence: "Other City",
          startYear: 2025,
          startDate: new Date("2025-01-15"),
        },
      },
    },
    include: { employee: true },
  });
  secondEmployeeId = secondEmp.employee!.id;

  adminSession = {
    user: { id: adminUserId, email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  employeeSession = {
    user: { id: employeeUserId, email: "emp.onboarding@company.com", role: "EMPLOYEE", name: "Emp Onboarding" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  await prisma.onboardingPlan.create({
    data: {
      employeeId,
      startDate: new Date("2024-04-01"),
      status: "ON_TRACK",
      steps: {
        create: [
          { ord: 1, label: "Offer signed", status: "DONE", completedAt: new Date("2024-03-20") },
          { ord: 2, label: "Paperwork", status: "DONE", completedAt: new Date("2024-03-28") },
          { ord: 3, label: "Equipment & access", status: "CURRENT" },
          { ord: 4, label: "Day-one welcome", status: "UPCOMING" },
          { ord: 5, label: "30-day review", status: "UPCOMING" },
        ],
      },
    },
  });
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

beforeEach(() => {
  mockAuthFn.mockReset();
});

interface PlanItem {
  id: string;
  employeeId: string;
  status: string;
  steps: { id: string; ord: number; label: string; status: string }[];
}

describe("GET /api/onboarding/active", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const response = await getActive(createTestRequest("/api/onboarding/active"));
    const { status } = await parseJsonResponse(response);
    expect(status).toBe(401);
  });

  it("admin sees all active plans", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await getActive(createTestRequest("/api/onboarding/active"));
    const { status, data } = await parseJsonResponse<{ data: PlanItem[] }>(response);
    expect(status).toBe(200);
    expect(data.data.length).toBeGreaterThanOrEqual(1);
    expect(data.data.some((p) => p.employeeId === employeeId)).toBe(true);
  });

  it("employee sees only own plan", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await getActive(createTestRequest("/api/onboarding/active"));
    const { data } = await parseJsonResponse<{ data: PlanItem[] }>(response);
    expect(data.data.length).toBe(1);
    expect(data.data[0].employeeId).toBe(employeeId);
  });

  it("plan steps are ordered by ord asc", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await getActive(createTestRequest("/api/onboarding/active"));
    const { data } = await parseJsonResponse<{ data: PlanItem[] }>(response);
    const steps = data.data[0].steps;
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].ord).toBeGreaterThan(steps[i - 1].ord);
    }
  });
});

describe("POST /api/onboarding", () => {
  function validBody(employeeIdOverride: string = secondEmployeeId) {
    return {
      employeeId: employeeIdOverride,
      startDate: "2026-02-01",
      steps: [
        { ord: 1, label: "Offer signed", status: "DONE" },
        { ord: 2, label: "Equipment", status: "CURRENT" },
      ],
    };
  }

  it("returns 401 when not authenticated", async () => {
    mockAuthFn.mockResolvedValue(null);
    const response = await postPlan(
      createTestRequest("/api/onboarding", { method: "POST", body: validBody() }),
    );
    expect((await parseJsonResponse(response)).status).toBe(401);
  });

  it("returns 403 for employee role", async () => {
    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await postPlan(
      createTestRequest("/api/onboarding", { method: "POST", body: validBody() }),
    );
    expect((await parseJsonResponse(response)).status).toBe(403);
  });

  it("admin creates plan with steps (201)", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await postPlan(
      createTestRequest("/api/onboarding", { method: "POST", body: validBody() }),
    );
    const { status, data } = await parseJsonResponse<{ data: PlanItem }>(response);
    expect(status).toBe(201);
    expect(data.data.employeeId).toBe(secondEmployeeId);
    expect(data.data.steps.length).toBe(2);
  });

  it("returns 409 when employee already has a plan", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await postPlan(
      createTestRequest("/api/onboarding", {
        method: "POST",
        body: validBody(employeeId),
      }),
    );
    const { status } = await parseJsonResponse(response);
    expect(status).toBe(409);
  });

  it("returns 400 when missing steps", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await postPlan(
      createTestRequest("/api/onboarding", {
        method: "POST",
        body: { employeeId: secondEmployeeId, startDate: "2026-01-01", steps: [] },
      }),
    );
    expect((await parseJsonResponse(response)).status).toBe(400);
  });
});

describe("PATCH /api/onboarding/[id]/step/[stepId]", () => {
  it("admin updates a step to DONE and records completedAt", async () => {
    const plan = await prisma.onboardingPlan.findUniqueOrThrow({
      where: { employeeId },
      include: { steps: { orderBy: { ord: "asc" } } },
    });
    const target = plan.steps.find((s) => s.status === "CURRENT")!;

    mockAuthFn.mockResolvedValue(adminSession);
    const request = createTestRequest(
      `/api/onboarding/${plan.id}/step/${target.id}`,
      { method: "PATCH", body: { status: "DONE" } },
    );
    const response = await patchStep(request, {
      params: Promise.resolve({ id: plan.id, stepId: target.id }),
    });
    const { status, data } = await parseJsonResponse<{
      data: { status: string; completedAt: string | null };
    }>(response);
    expect(status).toBe(200);
    expect(data.data.status).toBe("DONE");
    expect(data.data.completedAt).not.toBeNull();
  });

  it("returns 403 for employee role", async () => {
    const plan = await prisma.onboardingPlan.findUniqueOrThrow({
      where: { employeeId },
      include: { steps: true },
    });

    mockAuthFn.mockResolvedValue(employeeSession);
    const response = await patchStep(
      createTestRequest(`/api/onboarding/${plan.id}/step/${plan.steps[0].id}`, {
        method: "PATCH",
        body: { status: "DONE" },
      }),
      { params: Promise.resolve({ id: plan.id, stepId: plan.steps[0].id }) },
    );
    expect((await parseJsonResponse(response)).status).toBe(403);
  });

  it("returns 404 for step that doesn't belong to plan", async () => {
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await patchStep(
      createTestRequest("/api/onboarding/bogus/step/missing", {
        method: "PATCH",
        body: { status: "DONE" },
      }),
      { params: Promise.resolve({ id: "bogus", stepId: "missing" }) },
    );
    expect((await parseJsonResponse(response)).status).toBe(404);
  });

  it("returns 400 for invalid status", async () => {
    const plan = await prisma.onboardingPlan.findUniqueOrThrow({
      where: { employeeId },
      include: { steps: true },
    });
    mockAuthFn.mockResolvedValue(adminSession);
    const response = await patchStep(
      createTestRequest(`/api/onboarding/${plan.id}/step/${plan.steps[0].id}`, {
        method: "PATCH",
        body: { status: "WAT" },
      }),
      { params: Promise.resolve({ id: plan.id, stepId: plan.steps[0].id }) },
    );
    expect((await parseJsonResponse(response)).status).toBe(400);
  });
});
