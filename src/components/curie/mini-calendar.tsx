"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IconBtn } from "./icon-btn";
import { IChevronLeft, IChevronRight } from "./icons";

interface MiniCalendarProps {
  events: Date[];
  selected?: Date;
  initialMonth?: Date;
  today?: Date;
  className?: string;
}

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

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

function isSameYMD(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function buildCells(viewMonth: Date): { date: Date; inMonth: boolean }[] {
  const year = viewMonth.getUTCFullYear();
  const month = viewMonth.getUTCMonth();

  const first = startOfMonth(viewMonth);
  const jsDow = first.getUTCDay();
  const mondayOffset = (jsDow + 6) % 7;

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = mondayOffset; i > 0; i--) {
    const d = new Date(Date.UTC(year, month, 1 - i));
    cells.push({ date: d, inMonth: false });
  }
  const days = daysInMonth(year, month);
  for (let d = 1; d <= days; d++) {
    cells.push({ date: new Date(Date.UTC(year, month, d)), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(
        Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate() + 1),
      ),
      inMonth: false,
    });
  }
  return cells.slice(0, 42);
}

export function MiniCalendar({
  events,
  selected,
  initialMonth,
  today,
  className,
}: MiniCalendarProps) {
  const initial = initialMonth ?? selected ?? today ?? new Date();
  const [viewMonth, setViewMonth] = React.useState<Date>(startOfMonth(initial));

  const eventSet = React.useMemo(() => {
    const s = new Set<string>();
    for (const e of events) {
      s.add(
        `${e.getUTCFullYear()}-${e.getUTCMonth()}-${e.getUTCDate()}`,
      );
    }
    return s;
  }, [events]);

  const cells = React.useMemo(() => buildCells(viewMonth), [viewMonth]);

  function prevMonth() {
    setViewMonth(
      (m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() - 1, 1)),
    );
  }

  function nextMonth() {
    setViewMonth(
      (m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1)),
    );
  }

  const monthLabel = `${MONTHS[viewMonth.getUTCMonth()]} ${viewMonth.getUTCFullYear()}`;

  return (
    <div
      data-curie="mini-calendar"
      className={cn(
        "bg-[var(--color-curie-surface)] rounded-[var(--radius-curie-lg)] p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[15px] font-medium tracking-[-0.01em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          {monthLabel}
        </div>
        <div className="flex gap-1">
          <IconBtn
            icon={IChevronLeft}
            label="Previous month"
            onClick={prevMonth}
            className="h-[22px] w-[22px]"
          />
          <IconBtn
            icon={IChevronRight}
            label="Next month"
            onClick={nextMonth}
            className="h-[22px] w-[22px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DOW.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className={cn(
              "px-0 py-1",
              "text-[10px] font-medium uppercase tracking-[0.06em]",
              "text-[var(--color-curie-fg-muted)]",
            )}
          >
            {d}
          </div>
        ))}
        {cells.map(({ date, inMonth }, i) => {
          const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
          const hasEvent = eventSet.has(key);
          const isToday = today ? isSameYMD(date, today) : false;
          const isSelected = selected ? isSameYMD(date, selected) : false;

          const label = `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;

          const baseDayClass = cn(
            "relative grid h-[30px] place-items-center",
            "font-[family-name:var(--font-curie-mono)]",
            "text-[12px]",
            "rounded-[var(--radius-curie-sm)]",
          );

          if (!inMonth) {
            return (
              <div
                key={`${key}-${i}`}
                aria-hidden="true"
                className={cn(baseDayClass, "text-[var(--color-curie-border-strong)]")}
              >
                {date.getUTCDate()}
              </div>
            );
          }

          return (
            <button
              key={`${key}-${i}`}
              type="button"
              aria-label={label}
              aria-pressed={isSelected || undefined}
              data-curie-today={isToday || undefined}
              data-curie-selected={isSelected || undefined}
              data-curie-has-event={hasEvent || undefined}
              className={cn(
                baseDayClass,
                "cursor-pointer",
                "transition-colors",
                isSelected
                  ? "bg-[var(--color-curie-fg)] text-[var(--color-curie-fg-on-ink)]"
                  : "text-[var(--color-curie-fg-secondary)] hover:bg-[var(--color-curie-surface-sunken)]",
                isToday && !isSelected && "font-bold text-[var(--color-curie-fg)]",
              )}
            >
              <span>{date.getUTCDate()}</span>
              {isToday && !isSelected ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2",
                    "h-0.5 w-3.5 rounded-sm",
                    "bg-[var(--color-curie-brand)]",
                  )}
                  style={{ bottom: 4 }}
                />
              ) : null}
              {hasEvent && !isToday ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2",
                    "h-[3px] w-[3px] rounded-full",
                    isSelected
                      ? "bg-[var(--color-curie-fg-on-ink)]"
                      : "bg-[var(--color-curie-fg)]",
                  )}
                  style={{ bottom: 4 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
