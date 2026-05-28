import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { createAnnouncementSchema } from "@/lib/validations/announcement";

const announcementInclude = {
  author: {
    select: {
      id: true,
      email: true,
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
  const { error } = await requireApiAuth();
  if (error) return error;

  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : NaN;
  const take =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 100)
      : 20;

  const announcements = await prisma.announcement.findMany({
    take,
    orderBy: { createdAt: "desc" },
    include: announcementInclude,
  });

  return NextResponse.json({ data: announcements });
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth("ADMIN");
  if (error) return error;

  const body = await request.json();
  const parsed = createAnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const announcement = await prisma.announcement.create({
    data: {
      authorId: session.user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      tag: parsed.data.tag,
    },
    include: announcementInclude,
  });

  return NextResponse.json({ data: announcement }, { status: 201 });
}
