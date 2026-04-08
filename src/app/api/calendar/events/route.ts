import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const participantSelect = {
  user: {
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
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  const isAdmin = session.user.role === "ADMIN";

  const where = {
    ...(from || to
      ? {
          scheduledAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
    ...(!isAdmin && {
      participants: {
        some: { userId: session.user.id },
      },
    }),
  };

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      participants: {
        select: participantSelect,
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ data: meetings });
}
