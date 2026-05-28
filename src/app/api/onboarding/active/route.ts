import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const planInclude = {
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      department: true,
      avatarUrl: true,
      startDate: true,
    },
  },
  steps: {
    orderBy: { ord: "asc" },
  },
} as const;

export async function GET(_request: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const plans = await prisma.onboardingPlan.findMany({
      where: { status: { not: "COMPLETE" } },
      include: planInclude,
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json({ data: plans });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!employee) {
    return NextResponse.json({ data: [] });
  }

  const plan = await prisma.onboardingPlan.findUnique({
    where: { employeeId: employee.id },
    include: planInclude,
  });

  return NextResponse.json({ data: plan ? [plan] : [] });
}
