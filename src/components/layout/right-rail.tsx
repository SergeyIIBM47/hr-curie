import type { ReactNode } from "react";

interface RightRailProps {
  children?: ReactNode;
  variant: "sticky" | "stacked";
}

export function RightRail({ children, variant }: RightRailProps) {
  if (children == null || children === false) {
    return null;
  }

  if (variant === "sticky") {
    return (
      <aside
        aria-label="Workspace details"
        data-rail="sticky"
        className="
          curie-rail-sticky
          hidden xl:block
          sticky top-0
          h-screen w-[var(--curie-rail-w)]
          overflow-y-auto
          border-l border-[var(--color-curie-border)]
          bg-[var(--color-curie-bg)]
          px-6 pb-10 pt-6
          empty:border-0 empty:p-0 empty:hidden
        "
      >
        {children}
      </aside>
    );
  }

  return (
    <aside
      aria-label="Workspace details"
      data-rail="stacked"
      className="
        curie-rail-stacked
        xl:hidden
        mt-8
        border-t border-[var(--color-curie-border)]
        bg-[var(--color-curie-bg)]
        px-4 pb-10 pt-6 md:px-6 lg:px-10
        empty:hidden empty:m-0 empty:p-0 empty:border-0
      "
    >
      {children}
    </aside>
  );
}
