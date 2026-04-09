import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export async function GET() {
  const { error } = await requireApiAuth();
  if (error) return error;

  const types = await prisma.employmentType.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data: types });
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth("ADMIN");
  if (error) return error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const existing = await prisma.employmentType.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Employment type already exists" },
      { status: 409 },
    );
  }

  const created = await prisma.employmentType.create({
    data: { name: parsed.data.name },
  });

  return NextResponse.json({ data: created }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireApiAuth("ADMIN");
  if (error) return error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const type = await prisma.employmentType.findUnique({
    where: { id },
    include: { _count: { select: { employees: true } } },
  });

  if (!type) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (type._count.employees > 0) {
    return NextResponse.json(
      { error: "Cannot delete — employees are assigned to this type" },
      { status: 409 },
    );
  }

  await prisma.employmentType.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
