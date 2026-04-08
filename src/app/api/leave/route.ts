import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { createLeaveSchema } from "@/lib/validations/leave";

const leaveInclude = {
  user: {
    select: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  },
} as const;

export async function GET(request: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const isAdmin = session.user.role === "ADMIN";
  const statusFilter = request.nextUrl.searchParams.get("status");

  const where = {
    ...(!isAdmin && { userId: session.user.id }),
    ...(statusFilter && { status: statusFilter as "PENDING" | "APPROVED" | "REJECTED" }),
  };

  const leaveRequests = await prisma.leaveRequest.findMany({
    where,
    include: leaveInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: leaveRequests });
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = createLeaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      reason: parsed.data.reason ?? null,
    },
    include: leaveInclude,
  });

  return NextResponse.json({ data: leaveRequest }, { status: 201 });
}
