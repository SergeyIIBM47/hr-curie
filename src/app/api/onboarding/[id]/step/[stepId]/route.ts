import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { updateOnboardingStepSchema } from "@/lib/validations/onboarding";

interface RouteContext {
  params: Promise<{ id: string; stepId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id, stepId } = await context.params;

  const body = await request.json();
  const parsed = updateOnboardingStepSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const step = await prisma.onboardingStep.findUnique({
    where: { id: stepId },
    select: { id: true, planId: true },
  });
  if (!step || step.planId !== id) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  const completedAt =
    parsed.data.status === "DONE"
      ? parsed.data.completedAt
        ? new Date(parsed.data.completedAt)
        : new Date()
      : null;

  const updated = await prisma.onboardingStep.update({
    where: { id: stepId },
    data: {
      status: parsed.data.status,
      completedAt,
    },
  });

  return NextResponse.json({ data: updated });
}
