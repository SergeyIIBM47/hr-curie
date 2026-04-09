import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { CalendarPageClient } from "./calendar-page-client";

export default async function CalendarPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const meetings = await prisma.meeting.findMany({
    where: {
      scheduledAt: { gte: from, lte: to },
      ...(!isAdmin && {
        participants: { some: { userId: session.user.id } },
      }),
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
    orderBy: { scheduledAt: "asc" },
  });

  const serialized = meetings.map((m) => ({
    ...m,
    scheduledAt: m.scheduledAt.toISOString(),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  return <CalendarPageClient initialMeetings={serialized} isAdmin={isAdmin} />;
}
