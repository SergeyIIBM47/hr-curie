"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<React.SVGAttributes<SVGSVGElement>>;

interface IconBtnProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  icon: IconComponent;
  label: string;
  dot?: boolean;
}

export const IconBtn = React.forwardRef<HTMLButtonElement, IconBtnProps>(
  function IconBtn(
    { icon: Icon, label, dot = false, className, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        data-curie="icon-btn"
        data-dot={dot ? "true" : undefined}
        className={cn(
          "relative inline-grid place-items-center shrink-0",
          "h-9 w-9 rounded-[var(--radius-curie-pill)]",
          "text-[var(--color-curie-fg-secondary)]",
          "transition-colors",
          "hover:bg-[var(--color-curie-surface-sunken)]",
          "disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-curie-brand)]",
          className,
        )}
        {...rest}
      >
        <Icon aria-hidden="true" />
        {dot ? (
          <span
            data-curie="icon-btn-dot"
            aria-hidden="true"
            className={cn(
              "absolute top-2 right-[9px]",
              "h-2 w-2 rounded-full",
              "bg-[var(--color-curie-brand)]",
              "ring-2 ring-[var(--color-curie-bg)]",
            )}
          />
        ) : null}
      </button>
    );
  },
);
