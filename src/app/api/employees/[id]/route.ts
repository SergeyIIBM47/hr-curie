import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { employeeDetailSelect } from "@/lib/employee-select";
import { updateEmployeeSchema } from "@/lib/validations/employee";

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateEmployeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const {
    dateOfBirth,
    firstName,
    lastName,
    employmentTypeId,
    actualResidence,
    startYear,
    phone,
    position,
    department,
    location,
    healthInsurance,
    education,
    certifications,
    linkedinUrl,
    tshirtSize,
  } = parsed.data;

  const data: Prisma.EmployeeUpdateInput = {
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(employmentTypeId !== undefined && {
      employmentType: { connect: { id: employmentTypeId } },
    }),
    ...(actualResidence !== undefined && { actualResidence }),
    ...(startYear !== undefined && { startYear }),
    ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
    ...(phone !== undefined && { phone }),
    ...(position !== undefined && { position }),
    ...(department !== undefined && { department }),
    ...(location !== undefined && { location }),
    ...(healthInsurance !== undefined && { healthInsurance }),
    ...(education !== undefined && { education }),
    ...(certifications !== undefined && { certifications }),
    ...(linkedinUrl !== undefined && { linkedinUrl }),
    ...(tshirtSize !== undefined && { tshirtSize }),
  };

  const employee = await prisma.employee.update({
    where: { id },
    data,
    select: employeeDetailSelect,
  });

  return NextResponse.json({ data: employee });
}
