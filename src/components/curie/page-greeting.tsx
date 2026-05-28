import * as React from "react";
import { cn } from "@/lib/utils";

interface PageGreetingProps {
  name: string;
  date: Date;
  className?: string;
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

function formatOverline(date: Date): string {
  const weekday = WEEKDAYS[date.getUTCDay()].slice(0, 3);
  const month = MONTHS[date.getUTCMonth()];
  const day = date.getUTCDate();
  return `${weekday} · ${month} ${day}`;
}

export function PageGreeting({ name, date, className }: PageGreetingProps) {
  return (
    <header
      data-curie="page-greeting"
      className={cn("flex flex-col", className)}
    >
      <span
        className={cn(
          "block",
          "font-[family-name:var(--font-curie-mono)]",
          "text-[11px] font-medium uppercase tracking-[0.08em]",
          "text-[var(--color-curie-fg-muted)]",
          "mb-3",
        )}
      >
        {formatOverline(date)}
      </span>
      <span
        className={cn(
          "font-[family-name:var(--font-curie-display)]",
          "text-[56px] font-normal leading-[1.05] tracking-[-0.025em]",
          "text-[var(--color-curie-fg)]",
        )}
      >
        Good morning, <em className="italic font-medium">{name}</em>.
      </span>
    </header>
  );
}
