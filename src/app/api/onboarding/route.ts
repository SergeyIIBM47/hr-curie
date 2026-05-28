import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { createOnboardingPlanSchema } from "@/lib/validations/onboarding";

const planInclude = {
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  steps: { orderBy: { ord: "asc" } },
} as const;

export async function POST(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const body = await request.json();
  const parsed = createOnboardingPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id: parsed.data.employeeId },
    select: { id: true },
  });
  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const existing = await prisma.onboardingPlan.findUnique({
    where: { employeeId: parsed.data.employeeId },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Employee already has an onboarding plan" },
      { status: 409 },
    );
  }

  const plan = await prisma.onboardingPlan.create({
    data: {
      employeeId: parsed.data.employeeId,
      startDate: new Date(parsed.data.startDate),
      status: parsed.data.status ?? "ON_TRACK",
      notes: parsed.data.notes ?? null,
      steps: {
        create: parsed.data.steps.map((step) => ({
          ord: step.ord,
          label: step.label,
          status: step.status ?? "UPCOMING",
        })),
      },
    },
    include: planInclude,
  });

  return NextResponse.json({ data: plan }, { status: 201 });
}
