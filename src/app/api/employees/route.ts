import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { createEmployeeSchema } from "@/lib/validations/employee";

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

export async function POST(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const body = await request.json();
  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { password, workEmail, dateOfBirth, startYear, ...employeeData } =
    parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: workEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const employee = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: workEmail,
        passwordHash,
      },
    });

    return tx.employee.create({
      data: {
        userId: user.id,
        workEmail,
        dateOfBirth: new Date(dateOfBirth),
        startYear,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        employmentTypeId: employeeData.employmentTypeId,
        actualResidence: employeeData.actualResidence,
        phone: employeeData.phone ?? null,
        position: employeeData.position ?? null,
        department: employeeData.department ?? null,
        location: employeeData.location ?? null,
        healthInsurance: employeeData.healthInsurance ?? null,
        education: employeeData.education ?? null,
        certifications: employeeData.certifications ?? null,
        linkedinUrl: employeeData.linkedinUrl ?? null,
        tshirtSize: employeeData.tshirtSize ?? null,
      },
      select: employeeSelect,
    });
  });

  return NextResponse.json({ data: employee }, { status: 201 });
}
