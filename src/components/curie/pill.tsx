import * as React from "react";
import { cn } from "@/lib/utils";

export type PillVariant =
  | "role"
  | "tag"
  | "count"
  | "status-pending"
  | "status-approved"
  | "status-rejected"
  | "status-info";

const VARIANT_CLASS: Record<PillVariant, string> = {
  role: cn(
    "bg-transparent",
    "border border-[var(--color-curie-border-strong)]",
    "text-[var(--color-curie-fg-secondary)]",
  ),
  tag: cn(
    "bg-[var(--color-curie-surface-sunken)]",
    "text-[var(--color-curie-fg-secondary)]",
  ),
  count: cn(
    "bg-[var(--color-curie-brand-soft)]",
    "text-[var(--color-curie-brand-ink)]",
    "font-[family-name:var(--font-curie-mono)]",
  ),
  "status-pending": cn(
    "bg-[var(--color-curie-warning-soft)]",
    "text-[var(--color-curie-warning)]",
  ),
  "status-approved": cn(
    "bg-[var(--color-curie-success-soft)]",
    "text-[var(--color-curie-success)]",
  ),
  "status-rejected": cn(
    "bg-[var(--color-curie-danger-soft)]",
    "text-[var(--color-curie-danger)]",
  ),
  "status-info": cn(
    "bg-[var(--color-curie-info-soft)]",
    "text-[var(--color-curie-info)]",
  ),
};

interface PillProps {
  variant: PillVariant;
  children: React.ReactNode;
  className?: string;
}

export function Pill({ variant, children, className }: PillProps) {
  return (
    <span
      data-curie="pill"
      data-variant={variant}
      className={cn(
        "inline-flex items-center gap-1.5",
        "h-[22px] px-2.5",
        "text-[11px] font-medium tracking-[0.01em]",
        "rounded-[var(--radius-curie-pill)]",
        "whitespace-nowrap leading-none",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
