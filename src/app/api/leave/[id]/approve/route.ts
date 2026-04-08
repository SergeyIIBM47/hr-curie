import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) {
    return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
  }
  if (leave.status !== "PENDING") {
    return NextResponse.json(
      { error: "Only PENDING requests can be approved" },
      { status: 400 },
    );
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ data: updated });
}
