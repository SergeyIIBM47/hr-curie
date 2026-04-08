import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { scheduleMeetingSchema } from "@/lib/validations/meeting";

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiAuth("ADMIN");
  if (error) return error;

  const body = await request.json();
  const parsed = scheduleMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { title, type, scheduledAt, durationMinutes, participantUserIds, notes } =
    parsed.data;

  const meeting = await prisma.$transaction(async (tx) => {
    const created = await tx.meeting.create({
      data: {
        title,
        type,
        scheduledAt,
        durationMinutes,
        notes: notes || null,
        googleEventId: null,
        createdBy: session.user.id,
        participants: {
          create: participantUserIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: {
          select: {
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
          },
        },
      },
    });

    return created;
  });

  return NextResponse.json({ data: meeting }, { status: 201 });
}
