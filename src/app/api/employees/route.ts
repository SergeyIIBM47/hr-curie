import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const employeeSelect = {
  id: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  position: true,
  department: true,
  avatarUrl: true,
  employmentType: { select: { name: true } },
  user: { select: { id: true, role: true } },
} as const;

export async function GET(request: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  if (session.user.role !== "ADMIN") {
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      select: employeeSelect,
    });

    return NextResponse.json({ data: employee ? [employee] : [] });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { workEmail: { contains: q, mode: "insensitive" as const } },
          { position: { contains: q, mode: "insensitive" as const } },
          { department: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const employees = await prisma.employee.findMany({
    where,
    select: employeeSelect,
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json({ data: employees });
}
