import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { employeeDetailSelect } from "@/lib/employee-select";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;

  const where =
    session.user.role === "ADMIN"
      ? { id }
      : { id, userId: session.user.id };

  const employee = await prisma.employee.findUnique({
    where,
    select: employeeDetailSelect,
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: employee });
}
