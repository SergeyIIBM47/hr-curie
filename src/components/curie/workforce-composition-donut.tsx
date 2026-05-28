import * as React from "react";
import { cn } from "@/lib/utils";
import { computeSlices } from "@/lib/donut";

export interface WorkforceCount {
  label: string;
  count: number;
  color: string;
}

interface WorkforceCompositionDonutProps {
  counts: WorkforceCount[];
  className?: string;
}

const TRACK_COLOR = "#EEF2F8";

export function WorkforceCompositionDonut({
  counts,
  className,
}: WorkforceCompositionDonutProps) {
  const total = counts.reduce((sum, c) => sum + Math.max(0, c.count), 0);
  const slices = computeSlices(counts.map((c) => c.count));

  return (
    <div
      data-curie="workforce-donut"
      className={cn("flex items-center gap-7", className)}
    >
      <div className="relative h-40 w-40 shrink-0">
        <svg
          viewBox="0 0 36 36"
          width="160"
          height="160"
          role="img"
          aria-label={`Workforce composition: ${total} people total`}
        >
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={TRACK_COLOR}
            strokeWidth="3"
          />
          {counts.map((c, i) => {
            const slice = slices[i];
            if (!slice || slice.percent === 0) return null;
            return (
              <circle
                key={c.label}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={c.color}
                strokeWidth="3"
                strokeDasharray={slice.dasharray}
                strokeDashoffset={slice.dashoffset}
                strokeLinecap="butt"
                transform="rotate(-90 18 18)"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div
              className={cn(
                "font-[family-name:var(--font-curie-display)]",
                "text-[36px] font-normal leading-none tracking-[-0.025em]",
                "text-[var(--color-curie-fg)]",
              )}
            >
              {total}
            </div>
            <div
              className={cn(
                "mt-1 text-[11px] font-medium uppercase tracking-[0.08em]",
                "text-[var(--color-curie-fg-muted)]",
              )}
            >
              Total people
            </div>
          </div>
        </div>
      </div>

      <ul className="flex-1">
        {counts.map((c, i) => (
          <li
            key={c.label}
            className={cn(
              "flex items-center gap-2.5 py-2",
              "text-[13px] text-[var(--color-curie-fg)]",
              i < counts.length - 1
                ? "border-b border-[var(--color-curie-border)]"
                : "",
            )}
          >
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-[3px]"
              style={{ background: c.color }}
            />
            <span className="flex-1">{c.label}</span>
            <span
              className={cn(
                "ml-auto font-[family-name:var(--font-curie-mono)]",
                "text-[12px] text-[var(--color-curie-fg-secondary)]",
              )}
            >
              {c.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
