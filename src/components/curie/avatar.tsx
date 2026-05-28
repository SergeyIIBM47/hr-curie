import * as React from "react";
import { cn, getInitials } from "@/lib/utils";
import { getTintLetter, type TintLetter } from "@/lib/name-hash";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<AvatarSize, { box: number; font: number }> = {
  xs: { box: 20, font: 10 },
  sm: { box: 28, font: 11 },
  md: { box: 36, font: 13 },
  lg: { box: 44, font: 15 },
};

const TINT_BG: Record<TintLetter, string> = {
  a: "#DBE5F4",
  b: "#D2DAE8",
  c: "#E3E7F1",
  d: "#D8E2F0",
  e: "#DCE2EE",
  f: "#D6DEEA",
};

const TINT_FG: Record<TintLetter, string> = {
  a: "#0B0F1A",
  b: "#1E293B",
  c: "#1E3A8A",
  d: "#1F2937",
  e: "#1E3A8A",
  f: "#1F2937",
};

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  tint?: TintLetter;
  imageSrc?: string;
  className?: string;
  bordered?: boolean;
}

export function Avatar({
  name,
  size = "md",
  tint,
  imageSrc,
  className,
  bordered = false,
}: AvatarProps) {
  const resolvedTint = tint ?? getTintLetter(name);
  const initials = getInitials(name);
  const dims = SIZE_PX[size];

  return (
    <span
      data-curie="avatar"
      data-size={size}
      data-tint={resolvedTint}
      aria-label={name}
      role="img"
      className={cn(
        "inline-grid place-items-center select-none overflow-hidden relative shrink-0",
        "rounded-[var(--radius-curie-pill)]",
        "font-medium leading-none",
        bordered && "box-content border-2 border-[var(--color-curie-surface)]",
        className,
      )}
      style={{
        width: dims.box,
        height: dims.box,
        fontSize: dims.font,
        background: TINT_BG[resolvedTint],
        color: TINT_FG[resolvedTint],
        letterSpacing: "-0.02em",
      }}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
