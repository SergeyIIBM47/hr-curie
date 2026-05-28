import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, type AvatarSize } from "./avatar";

const CHIP_PX: Record<AvatarSize, { box: number; font: number }> = {
  xs: { box: 20, font: 9 },
  sm: { box: 28, font: 10 },
  md: { box: 36, font: 11 },
  lg: { box: 44, font: 12 },
};

interface AvatarStackProps {
  names: string[];
  size?: AvatarSize;
  max?: number;
  className?: string;
}

export function AvatarStack({
  names,
  size = "sm",
  max = 4,
  className,
}: AvatarStackProps) {
  const visible = names.slice(0, max);
  const remaining = names.length - visible.length;
  const chipDims = CHIP_PX[size];

  return (
    <span
      data-curie="avatar-stack"
      className={cn("inline-flex items-center", className)}
    >
      {visible.map((name, i) => (
        <span
          key={`${name}-${i}`}
          style={{ marginLeft: i === 0 ? 0 : -8 }}
          className="inline-flex"
        >
          <Avatar name={name} size={size} bordered />
        </span>
      ))}
      {remaining > 0 ? (
        <span
          data-curie="avatar-stack-more"
          aria-label={`${remaining} more`}
          className={cn(
            "inline-grid place-items-center box-content shrink-0",
            "rounded-[var(--radius-curie-pill)]",
            "border-2 border-[var(--color-curie-surface)]",
            "bg-[var(--color-curie-surface-sunken)]",
            "text-[var(--color-curie-fg-secondary)]",
            "font-[family-name:var(--font-curie-mono)]",
            "font-semibold leading-none",
          )}
          style={{
            width: chipDims.box,
            height: chipDims.box,
            fontSize: chipDims.font,
            marginLeft: -8,
          }}
        >
          +{remaining}
        </span>
      ) : null}
    </span>
  );
}
