import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import {
  createJobRequisitionSchema,
  jobStatusSchema,
} from "@/lib/validations/job-requisition";

export async function GET(request: NextRequest) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const statusParam = request.nextUrl.searchParams.get("status");
  const priorityParam = request.nextUrl.searchParams.get("priority");

  const where: {
    status?: "OPEN" | "PAUSED" | "FILLED";
    priority?: boolean;
  } = {};

  if (statusParam) {
    const parsed = jobStatusSchema.safeParse(statusParam);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    where.status = parsed.data;
  }

  if (priorityParam !== null) {
    if (priorityParam === "true") where.priority = true;
    else if (priorityParam === "false") where.priority = false;
  }

  const jobs = await prisma.jobRequisition.findMany({
    where,
    orderBy: [{ priority: "desc" }, { openedAt: "desc" }],
  });

  return NextResponse.json({ data: jobs });
}

export async function POST(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const body = await request.json();
  const parsed = createJobRequisitionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const job = await prisma.jobRequisition.create({
    data: {
      title: parsed.data.title,
      department: parsed.data.department,
      location: parsed.data.location ?? null,
      status: parsed.data.status ?? "OPEN",
      priority: parsed.data.priority ?? false,
    },
  });

  return NextResponse.json({ data: job }, { status: 201 });
}
