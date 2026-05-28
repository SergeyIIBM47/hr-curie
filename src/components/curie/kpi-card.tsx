import * as React from "react";
import { cn } from "@/lib/utils";
import { AvatarStack } from "./avatar-stack";
import { Sparkline, type SparklineTone } from "./sparkline";
import { IArrowUp, IArrowDown, IArrowRight } from "./icons";
import type { AvatarSize } from "./avatar";

interface KpiDelta {
  dir: "up" | "down" | "flat";
  label: string;
}

type KpiFooter =
  | { kind: "sparkline"; points: number[]; tone: SparklineTone }
  | {
      kind: "stack";
      avatars: { name: string }[];
      avatarSize?: AvatarSize;
      max?: number;
      trailing?: string;
    }
  | { kind: "text"; text: string };

interface KpiCardProps {
  label: string;
  value: number | string;
  unit?: string;
  pill?: React.ReactNode;
  delta?: KpiDelta;
  footer: KpiFooter;
  className?: string;
}

const DELTA_TONE: Record<KpiDelta["dir"], string> = {
  up: "text-[var(--color-curie-success)]",
  down: "text-[var(--color-curie-danger)]",
  flat: "text-[var(--color-curie-fg-muted)]",
};

const DELTA_ICON: Record<KpiDelta["dir"], React.ComponentType<React.SVGAttributes<SVGSVGElement>> | null> = {
  up: IArrowUp,
  down: IArrowDown,
  flat: null,
};

export function KpiCard({
  label,
  value,
  unit,
  pill,
  delta,
  footer,
  className,
}: KpiCardProps) {
  const DeltaIcon = delta ? DELTA_ICON[delta.dir] : null;

  return (
    <div
      data-curie="kpi-card"
      className={cn(
        "flex flex-col gap-4 overflow-hidden",
        "bg-[var(--color-curie-surface)]",
        "rounded-[var(--radius-curie-lg)]",
        "px-6 pt-[22px] pb-[18px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          "font-[family-name:var(--font-curie-sans)]",
          "text-[11px] font-medium uppercase tracking-[0.08em]",
          "text-[var(--color-curie-fg-muted)]",
        )}
      >
        <span>{label}</span>
        {pill}
      </div>

      <div
        className={cn(
          "font-[family-name:var(--font-curie-display)]",
          "text-[44px] font-normal leading-none tracking-[-0.03em]",
          "text-[var(--color-curie-fg)]",
        )}
      >
        {value}
        {unit ? (
          <span className="ml-1 text-[18px] tracking-normal text-[var(--color-curie-fg-muted)]">
            {unit}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              "font-[family-name:var(--font-curie-mono)]",
              "text-[11px] font-medium",
              DELTA_TONE[delta.dir],
            )}
          >
            {DeltaIcon ? <DeltaIcon width={14} height={14} /> : null}
            {delta.label}
          </span>
        ) : (
          <span />
        )}
        <KpiFooterView footer={footer} />
      </div>
    </div>
  );
}

function KpiFooterView({ footer }: { footer: KpiFooter }) {
  if (footer.kind === "sparkline") {
    return (
      <span className="h-7 max-w-[100px] flex-1">
        <Sparkline
          points={footer.points}
          tone={footer.tone}
          area={footer.tone === "brand"}
        />
      </span>
    );
  }

  if (footer.kind === "stack") {
    return (
      <div className="flex items-center gap-2">
        <AvatarStack
          names={footer.avatars.map((a) => a.name)}
          size={footer.avatarSize ?? "sm"}
          max={footer.max ?? 4}
        />
        {footer.trailing ? (
          <span
            className={cn(
              "font-[family-name:var(--font-curie-mono)]",
              "text-[11px] text-[var(--color-curie-fg-muted)]",
            )}
          >
            {footer.trailing}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <span
      className={cn(
        "font-[family-name:var(--font-curie-mono)]",
        "text-[11px] text-[var(--color-curie-fg-muted)]",
      )}
    >
      {footer.text}
    </span>
  );
}

export { IArrowRight };
