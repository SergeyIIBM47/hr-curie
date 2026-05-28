import * as React from "react";
import { cn } from "@/lib/utils";

export type SparklineTone = "neutral" | "brand";

interface SparklineProps {
  points: number[];
  tone?: SparklineTone;
  area?: boolean;
  className?: string;
  ariaLabel?: string;
}

const VIEW_W = 100;
const VIEW_H = 28;
const PAD = 2;

export function Sparkline({
  points,
  tone = "neutral",
  area = false,
  className,
  ariaLabel,
}: SparklineProps) {
  const reactId = React.useId();
  const gradientId = `spark-${reactId.replace(/[:]/g, "")}`;

  const polyline = pointsToPolyline(points);
  const strokeVar =
    tone === "brand"
      ? "var(--color-curie-brand)"
      : "var(--color-curie-fg-muted)";
  const showArea = area && tone === "brand" && polyline !== "";

  return (
    <svg
      data-curie="sparkline"
      data-tone={tone}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      className={cn("block w-full h-7", className)}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {showArea ? (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-curie-brand)"
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor="var(--color-curie-brand)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <polygon
            fill={`url(#${gradientId})`}
            stroke="none"
            points={`0,${VIEW_H} ${polyline} ${VIEW_W},${VIEW_H}`}
          />
        </>
      ) : null}
      {polyline === "" ? null : (
        <polyline
          fill="none"
          stroke={strokeVar}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polyline}
        />
      )}
    </svg>
  );
}

function pointsToPolyline(points: number[]): string {
  if (points.length < 2) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = VIEW_W / (points.length - 1);

  return points
    .map((p, i) => {
      const x = i * step;
      const y = VIEW_H - PAD - ((p - min) / range) * (VIEW_H - PAD * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
