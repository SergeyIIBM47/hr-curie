import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";
import { Pill, type PillVariant } from "./pill";
import { prisma } from "@/lib/prisma";

interface TimeOffRow {
  id: string;
  name: string;
  position: string;
  startDate: Date;
  endDate: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface TimeOffThisWeekCardProps {
  weekStart: Date;
  weekEnd: Date;
  rows?: TimeOffRow[];
  className?: string;
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function shortDate(date: Date): string {
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

const STATUS_VARIANT: Record<
  TimeOffRow["status"],
  { variant: PillVariant; label: string }
> = {
  PENDING: { variant: "status-pending", label: "Awaiting approval" },
  APPROVED: { variant: "status-approved", label: "Approved" },
  REJECTED: { variant: "status-rejected", label: "Rejected" },
};

async function fetchRows(weekStart: Date, weekEnd: Date): Promise<TimeOffRow[]> {
  const requests = await prisma.leaveRequest.findMany({
    where: {
      startDate: { lte: weekEnd },
      endDate: { gte: weekStart },
    },
    include: {
      user: {
        select: {
          employee: {
            select: { firstName: true, lastName: true, position: true, department: true },
          },
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return requests
    .filter((r) => r.user.employee != null)
    .map((r) => {
      const e = r.user.employee!;
      const position = [e.department, e.position].filter(Boolean).join(" · ");
      return {
        id: r.id,
        name: `${e.firstName} ${e.lastName}`,
        position: position || "—",
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
      };
    });
}

export async function TimeOffThisWeekCard({
  weekStart,
  weekEnd,
  rows,
  className,
}: TimeOffThisWeekCardProps) {
  const data = rows ?? (await fetchRows(weekStart, weekEnd));
  const requestedDays = data.reduce((sum, r) => {
    const days =
      Math.floor((r.endDate.getTime() - r.startDate.getTime()) / 86_400_000) + 1;
    return sum + Math.max(1, days);
  }, 0);

  return (
    <div
      data-curie="time-off-card"
      className={cn(
        "bg-[var(--color-curie-surface)] rounded-[var(--radius-curie-lg)] p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[20px] font-medium leading-tight tracking-[-0.015em]",
              "text-[var(--color-curie-fg)]",
            )}
          >
            Time off this week
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-curie-fg-muted)]">
            {shortDate(weekStart)} — {shortDate(weekEnd)} · {requestedDays} days
            requested
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {data.length === 0 ? (
          <div className="text-[13px] text-[var(--color-curie-fg-muted)]">
            No leave requests this week.
          </div>
        ) : (
          data.map((row) => {
            const status = STATUS_VARIANT[row.status];
            return (
              <div key={row.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={row.name} size="md" />
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--color-curie-fg)]">
                      {row.name}
                    </div>
                    <div className="text-[12px] text-[var(--color-curie-fg-muted)]">
                      {row.position}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "font-[family-name:var(--font-curie-mono)]",
                      "text-[12px] text-[var(--color-curie-fg-secondary)]",
                    )}
                  >
                    {shortDate(row.startDate)} → {shortDate(row.endDate)}
                  </div>
                  <Pill variant={status.variant} className="mt-1">
                    {status.label}
                  </Pill>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
