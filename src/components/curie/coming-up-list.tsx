import * as React from "react";
import { cn } from "@/lib/utils";
import { ICake, IStar } from "./icons";
import { prisma } from "@/lib/prisma";
import {
  nextBirthdays,
  nextAnniversaries,
  type ComingUpEmployee,
  type BirthdayEntry,
  type AnniversaryEntry,
} from "@/lib/coming-up";

interface ComingUpListProps {
  today: Date;
  windowDays?: number;
  employees?: ComingUpEmployee[];
  className?: string;
}

interface ComingUpEntry {
  id: string;
  name: string;
  date: Date;
  kind: "birthday" | "anniversary";
  years?: number;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(d: Date): string {
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

async function fetchEmployees(): Promise<ComingUpEmployee[]> {
  const rows = await prisma.employee.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      startDate: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    dateOfBirth: r.dateOfBirth,
    startDate: r.startDate,
  }));
}

function mergeEntries(
  birthdays: BirthdayEntry[],
  anniversaries: AnniversaryEntry[],
): ComingUpEntry[] {
  const entries: ComingUpEntry[] = [
    ...birthdays.map((b) => ({ ...b, kind: "birthday" as const })),
    ...anniversaries.map((a) => ({ ...a, kind: "anniversary" as const })),
  ];
  entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  return entries;
}

export async function ComingUpList({
  today,
  windowDays = 14,
  employees,
  className,
}: ComingUpListProps) {
  const list = employees ?? (await fetchEmployees());
  const birthdays = nextBirthdays(list, today, windowDays);
  const anniversaries = nextAnniversaries(list, today, windowDays);
  const entries = mergeEntries(birthdays, anniversaries);

  return (
    <div
      data-curie="coming-up"
      className={cn("flex flex-col gap-3", className)}
    >
      {entries.length === 0 ? (
        <div className="text-[13px] text-[var(--color-curie-fg-muted)]">
          Nothing in the next {windowDays} days.
        </div>
      ) : (
        entries.map((entry) => {
          const Icon = entry.kind === "birthday" ? ICake : IStar;
          const label =
            entry.kind === "birthday"
              ? "Birthday"
              : `${entry.years} year${entry.years === 1 ? "" : "s"}`;
          return (
            <div
              key={`${entry.kind}-${entry.id}`}
              className="flex items-center gap-2.5"
            >
              <Icon
                width={16}
                height={16}
                className="shrink-0 text-[var(--color-curie-fg-secondary)]"
              />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[var(--color-curie-fg)]">
                  {entry.name} · {label}
                </div>
                <div
                  className={cn(
                    "font-[family-name:var(--font-curie-mono)]",
                    "text-[11px] text-[var(--color-curie-fg-muted)]",
                  )}
                >
                  {formatDate(entry.date)}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
