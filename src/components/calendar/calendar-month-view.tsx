"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { IconBtn, IChevronLeft, IChevronRight } from "@/components/curie";
import { cn } from "@/lib/utils";
import { MeetingCard, type Meeting } from "./meeting-card";

interface CalendarMonthViewProps {
  initialMeetings: Meeting[];
  isAdmin: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday-first offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function CalendarMonthView({
  initialMeetings,
  isAdmin: _isAdmin,
}: CalendarMonthViewProps) {
  void _isAdmin;
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const weeks = useMemo(
    () => getMonthGrid(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const d = new Date(m.scheduledAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return map;
  }, [meetings]);

  const getMeetingsForDate = useCallback(
    (date: Date): Meeting[] => {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      return meetingsByDate.get(key) ?? [];
    },
    [meetingsByDate],
  );

  const hasEvent = useCallback(
    (date: Date): boolean => getMeetingsForDate(date).length > 0,
    [getMeetingsForDate],
  );

  const selectedMeetings = useMemo(
    () => getMeetingsForDate(selectedDate),
    [selectedDate, getMeetingsForDate],
  );

  useEffect(() => {
    const from = new Date(currentYear, currentMonth, 1).toISOString();
    const to = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

    fetch(`/api/calendar/events?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setMeetings(json.data);
      })
      .catch(() => {
        /* keep existing meetings */
      });
  }, [currentYear, currentMonth]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  }

  const monthLabel = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    { month: "long", year: "numeric" },
  );

  const selectedTitle = selectedDate.toLocaleDateString("default", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Month Grid */}
      <div
        className={cn(
          "min-w-0 flex-1",
          "bg-[var(--color-curie-surface)]",
          "rounded-[var(--radius-curie-lg)]",
          "p-4 sm:p-6",
        )}
      >
        {/* Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "font-[family-name:var(--font-curie-display)]",
                "text-[20px] font-medium tracking-[-0.01em]",
                "text-[var(--color-curie-fg)]",
              )}
            >
              {monthLabel}
            </h2>
            <button
              type="button"
              onClick={goToToday}
              className={cn(
                "rounded-[var(--radius-curie-pill)] px-2.5 py-1",
                "text-[12px] font-medium",
                "text-[var(--color-curie-brand)]",
                "transition-colors duration-150",
                "hover:bg-[var(--color-curie-brand-wash)]",
              )}
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-1">
            <IconBtn
              icon={IChevronLeft}
              label="Previous month"
              onClick={prevMonth}
            />
            <IconBtn
              icon={IChevronRight}
              label="Next month"
              onClick={nextMonth}
            />
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className={cn(
                "px-0 py-2 text-center",
                "text-[10px] font-medium uppercase tracking-[0.08em]",
                "text-[var(--color-curie-fg-muted)]",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${wi}-${di}`}
                    aria-hidden="true"
                    className="min-h-[64px] sm:min-h-[88px]"
                  />
                );
              }

              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const dayHasEvent = hasEvent(date);
              const dayNum = date.getDate();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  aria-label={date.toLocaleDateString("default", {
                    month: "long",
                    day: "numeric",
                  })}
                  aria-pressed={isSelected || undefined}
                  data-curie-today={isToday || undefined}
                  data-curie-selected={isSelected || undefined}
                  data-curie-has-event={dayHasEvent || undefined}
                  className={cn(
                    "relative min-h-[64px] sm:min-h-[88px]",
                    "flex flex-col items-center pt-2",
                    "rounded-[var(--radius-curie-sm)]",
                    "font-[family-name:var(--font-curie-mono)]",
                    "transition-colors duration-150",
                    "cursor-pointer",
                    isSelected
                      ? "bg-[var(--color-curie-fg)] text-[var(--color-curie-fg-on-ink)]"
                      : cn(
                          "text-[var(--color-curie-fg-secondary)]",
                          "hover:bg-[var(--color-curie-surface-sunken)]",
                        ),
                    isToday &&
                      !isSelected &&
                      "font-bold text-[var(--color-curie-fg)]",
                  )}
                >
                  <span className="text-[14px] leading-none">{dayNum}</span>

                  {isToday && !isSelected ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-1/2 top-[26px] -translate-x-1/2",
                        "h-0.5 w-4 rounded-sm",
                        "bg-[var(--color-curie-brand)]",
                      )}
                    />
                  ) : null}

                  {dayHasEvent ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-2 left-1/2 -translate-x-1/2",
                        "h-1 w-1 rounded-full",
                        isSelected
                          ? "bg-[var(--color-curie-fg-on-ink)]"
                          : "bg-[var(--color-curie-fg)]",
                      )}
                    />
                  ) : null}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Day Detail Panel */}
      <aside
        className={cn(
          "w-full lg:w-[340px]",
          "bg-[var(--color-curie-surface)]",
          "rounded-[var(--radius-curie-lg)]",
          "p-4 sm:p-6",
        )}
      >
        <h3
          className={cn(
            "mb-4",
            "font-[family-name:var(--font-curie-display)]",
            "text-[22px] font-medium leading-tight tracking-[-0.01em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          {selectedTitle}
        </h3>

        {selectedMeetings.length === 0 ? (
          <p className="text-[13px] text-[var(--color-curie-fg-muted)]">
            Nothing scheduled.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {selectedMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
