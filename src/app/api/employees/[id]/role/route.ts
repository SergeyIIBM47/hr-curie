import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid role value" },
      { status: 400 },
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (employee.userId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: employee.userId },
    data: { role: parsed.data.role },
    select: { id: true, role: true },
  });

  return NextResponse.json({ data: user });
}
