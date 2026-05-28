import * as React from "react";
import { cn } from "@/lib/utils";
import { AvatarStack } from "./avatar-stack";
import { Pill, type PillVariant } from "./pill";
import { IClock, IMeeting, IPin } from "./icons";
import { prisma } from "@/lib/prisma";

export interface ScheduleItem {
  id: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  participants: { name: string }[];
  badge: { kind: "Meet" | "Final" | "Room"; label: string };
}

interface TodayScheduleListProps {
  date: Date;
  now?: Date;
  items?: ScheduleItem[];
  className?: string;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(date: Date): string {
  return `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
}

function deriveBadge(meeting: {
  type: string;
  notes: string | null;
}): ScheduleItem["badge"] {
  const raw = (meeting.notes ?? meeting.type ?? "Meet").trim();
  if (/room/i.test(raw)) return { kind: "Room", label: raw };
  if (/final/i.test(raw)) return { kind: "Final", label: "Final" };
  return { kind: "Meet", label: "Meet" };
}

async function fetchSchedule(date: Date): Promise<ScheduleItem[]> {
  const dayStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayEnd = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  );

  const rows = await prisma.meeting.findMany({
    where: { scheduledAt: { gte: dayStart, lt: dayEnd } },
    orderBy: { scheduledAt: "asc" },
    include: {
      participants: {
        include: {
          user: {
            select: {
              employee: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });

  return rows.map((m) => ({
    id: m.id,
    title: m.title,
    scheduledAt: m.scheduledAt,
    durationMinutes: m.durationMinutes,
    participants: m.participants
      .map((p) =>
        p.user.employee
          ? { name: `${p.user.employee.firstName} ${p.user.employee.lastName}` }
          : null,
      )
      .filter((p): p is { name: string } => p != null),
    badge: deriveBadge({ type: m.type, notes: m.notes }),
  }));
}

const BADGE_VARIANT: Record<
  ScheduleItem["badge"]["kind"],
  { variant: PillVariant; icon: React.ComponentType<React.SVGAttributes<SVGSVGElement>> }
> = {
  Meet: { variant: "tag", icon: IMeeting },
  Final: { variant: "status-info", icon: IMeeting },
  Room: { variant: "tag", icon: IPin },
};

export async function TodayScheduleList({
  date,
  now,
  items,
  className,
}: TodayScheduleListProps) {
  const data = items ?? (await fetchSchedule(date));
  const referenceNow = now ?? new Date();

  return (
    <div data-curie="today-schedule" className={cn("flex flex-col", className)}>
      {data.length === 0 ? (
        <div className="text-[13px] text-[var(--color-curie-fg-muted)]">
          Nothing scheduled today.
        </div>
      ) : (
        data.map((item) => {
          const end = new Date(
            item.scheduledAt.getTime() + item.durationMinutes * 60_000,
          );
          const isNow =
            referenceNow.getTime() >= item.scheduledAt.getTime() &&
            referenceNow.getTime() < end.getTime();
          const badge = BADGE_VARIANT[item.badge.kind];
          const BadgeIcon = badge.icon;

          return (
            <div
              key={item.id}
              data-curie-now={isNow || undefined}
              className={cn(
                "relative mb-2.5 px-4 py-3.5",
                "bg-[var(--color-curie-surface)]",
                "rounded-[var(--radius-curie-md)]",
                isNow && "shadow-[var(--shadow-curie-soft)]",
              )}
            >
              {isNow ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-3.5 bottom-3.5",
                    "w-[3px] rounded-r-sm",
                    "bg-[var(--color-curie-fg)]",
                  )}
                />
              ) : null}
              <div
                className={cn(
                  "mb-1.5 flex items-center gap-1.5",
                  "font-[family-name:var(--font-curie-mono)]",
                  "text-[11px] text-[var(--color-curie-fg-muted)]",
                )}
              >
                <IClock width={14} height={14} />
                <span>
                  {formatTime(item.scheduledAt)} — {formatTime(end)}
                  {isNow ? " · Now" : ""}
                </span>
              </div>
              <div
                className={cn(
                  "mb-2 font-[family-name:var(--font-curie-display)]",
                  "text-[15px] font-medium leading-tight tracking-[-0.01em]",
                  "text-[var(--color-curie-fg)]",
                )}
              >
                {item.title}
              </div>
              <div className="flex items-center justify-between gap-2.5">
                <AvatarStack
                  names={item.participants.map((p) => p.name)}
                  size="sm"
                  max={3}
                />
                <Pill variant={badge.variant}>
                  <BadgeIcon width={14} height={14} />
                  {item.badge.label}
                </Pill>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
