import type { ReactNode } from "react";
import { RightRail } from "@/components/layout/right-rail";

interface AppShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  rail?: ReactNode;
}

export function AppShell({ sidebar, topbar, children, rail }: AppShellProps) {
  return (
    <div
      data-shell="app"
      className="min-h-screen bg-[var(--color-curie-bg)] text-[var(--color-curie-fg)]"
    >
      <div
        className="
          grid min-h-screen min-w-0
          grid-cols-1
          md:grid-cols-[60px_minmax(0,1fr)]
          lg:grid-cols-[var(--curie-sidebar-w)_minmax(0,1fr)]
          xl:grid-cols-[var(--curie-sidebar-w)_minmax(0,1fr)_auto]
        "
      >
        {sidebar}

        <main
          id="main-content"
          data-shell-main="true"
          className="flex min-w-0 flex-col"
        >
          {topbar}
          <div className="px-4 pb-16 md:px-6 lg:px-10">{children}</div>
          <RightRail variant="stacked">{rail}</RightRail>
        </main>

        <RightRail variant="sticky">{rail}</RightRail>
      </div>
    </div>
  );
}
