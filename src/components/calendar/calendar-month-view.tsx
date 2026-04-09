"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { MeetingCard, type Meeting } from "./meeting-card";

interface CalendarMonthViewProps {
  initialMeetings: Meeting[];
  isAdmin: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DOT_COLORS: Record<string, string> = {
  ONE_ON_ONE: "#007AFF",
  PERFORMANCE_REVIEW: "#5856D6",
};

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
  const startOffset = firstDay.getDay();
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
  isAdmin,
}: CalendarMonthViewProps) {
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

  const getDotTypes = useCallback(
    (date: Date): string[] => {
      const dayMeetings = getMeetingsForDate(date);
      const types = new Set(dayMeetings.map((m) => m.type));
      return Array.from(types);
    },
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

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Month Grid */}
      <div className="min-w-0 flex-1">
        {/* Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-semibold text-[#1D1D1F]">
              {monthLabel}
            </h2>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-[6px] px-2 py-1 text-[13px] font-medium text-[#007AFF] transition-colors hover:bg-[#007AFF]/10"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="flex size-9 items-center justify-center rounded-[8px] text-[#3C3C43] transition-colors hover:bg-[#F2F2F7]"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="flex size-9 items-center justify-center rounded-[8px] text-[#3C3C43] transition-colors hover:bg-[#F2F2F7]"
              aria-label="Next month"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[#E5E5EA]">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="pb-2 text-center text-[12px] font-semibold uppercase tracking-wider text-[#8E8E93]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {weeks.map((week, wi) =>
            week.map((date, di) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${wi}-${di}`}
                    className="min-h-[72px] border-b border-r border-[#F2F2F7] last:border-r-0 sm:min-h-[84px]"
                  />
                );
              }

              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const dotTypes = getDotTypes(date);
              const dayNum = date.getDate();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`relative flex min-h-[72px] flex-col items-center border-b border-r border-[#F2F2F7] pt-2 transition-colors last:border-r-0 sm:min-h-[84px] ${
                    isSelected
                      ? "bg-[#007AFF]/5"
                      : "hover:bg-[#F2F2F7]"
                  }`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-[15px] ${
                      isToday
                        ? "bg-[#007AFF] font-semibold text-white"
                        : isSelected
                          ? "font-semibold text-[#007AFF]"
                          : "text-[#1D1D1F]"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dotTypes.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {dotTypes.map((type) => (
                        <span
                          key={type}
                          className="size-[6px] rounded-full"
                          style={{
                            backgroundColor:
                              DOT_COLORS[type] ?? "#8E8E93",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Day Detail Panel */}
      <div className="w-full rounded-[12px] bg-[#F9F9FB] p-4 lg:w-[340px]">
        <h3 className="mb-3 text-[17px] font-semibold text-[#1D1D1F]">
          {selectedDate.toLocaleDateString("default", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h3>

        {selectedMeetings.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CalendarDays className="mb-2 size-12 text-[#D1D1D6]" strokeWidth={1.5} />
            <p className="text-[15px] text-[#8E8E93]">No meetings</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
