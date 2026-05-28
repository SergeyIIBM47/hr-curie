import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { updateJobRequisitionSchema } from "@/lib/validations/job-requisition";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id } = await context.params;

  const body = await request.json();
  const parsed = updateJobRequisitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.jobRequisition.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const data: {
    title?: string;
    department?: string;
    location?: string | null;
    status?: "OPEN" | "PAUSED" | "FILLED";
    priority?: boolean;
    filledById?: string | null;
    filledAt?: Date | null;
  } = {};

  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.department !== undefined) data.department = parsed.data.department;
  if (parsed.data.location !== undefined) data.location = parsed.data.location;
  if (parsed.data.status !== undefined) data.status = parsed.data.status;
  if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
  if (parsed.data.filledById !== undefined) data.filledById = parsed.data.filledById;
  if (parsed.data.filledAt !== undefined) {
    data.filledAt = parsed.data.filledAt ? new Date(parsed.data.filledAt) : null;
  }

  if (parsed.data.status === "FILLED" && data.filledAt === undefined) {
    data.filledAt = new Date();
  }

  const job = await prisma.jobRequisition.update({
    where: { id },
    data,
  });

  return NextResponse.json({ data: job });
}
