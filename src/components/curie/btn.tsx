"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type BtnVariant = "primary" | "secondary";
export type BtnSize = "sm" | "md";

type IconComponent = React.ComponentType<React.SVGAttributes<SVGSVGElement>>;

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: IconComponent;
}

const SIZE_CLASS: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-[12px] gap-1.5",
  md: "h-10 px-4 text-[13px] gap-2",
};

const VARIANT_CLASS: Record<BtnVariant, string> = {
  primary: cn(
    "bg-[var(--color-curie-brand)]",
    "hover:bg-[var(--color-curie-brand-hover)]",
    "text-[var(--color-curie-fg-on-brand)]",
  ),
  secondary: cn(
    "bg-[var(--color-curie-surface)]",
    "border border-[var(--color-curie-border)]",
    "text-[var(--color-curie-fg)]",
    "hover:bg-[var(--color-curie-surface-sunken)]",
  ),
};

export const Btn = React.forwardRef<HTMLButtonElement, BtnProps>(
  function Btn(
    { variant = "primary", size = "md", icon: Icon, children, className, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        data-curie="btn"
        data-variant={variant}
        data-size={size}
        className={cn(
          "inline-flex items-center justify-center",
          "font-medium leading-none",
          "rounded-[var(--radius-curie-pill)]",
          "transition-colors",
          "disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-curie-brand)]",
          SIZE_CLASS[size],
          VARIANT_CLASS[variant],
          className,
        )}
        {...rest}
      >
        {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
        {children}
      </button>
    );
  },
);
