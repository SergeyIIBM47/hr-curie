"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import type { NavCounts } from "@/components/layout/nav-items";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: Role;
    image?: string;
  };
  counts: NavCounts;
  hasNotifications?: boolean;
}

export function Topbar({ user, counts, hasNotifications = true }: TopbarProps) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  return (
    <header
      data-topbar="true"
      className={cn(`
        sticky top-0 z-40
        flex h-[72px] items-center
        gap-4
        bg-[var(--color-curie-bg)]
        px-4 md:px-6 lg:px-10
      `)}
    >
      <div className="flex items-center gap-3 md:hidden">
        <MobileNav user={user} counts={counts} />
      </div>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol
          className={cn(`
            flex items-center gap-1
            font-[family-name:var(--font-curie-mono)]
            text-[12px] tracking-[0.02em]
            text-[var(--color-curie-fg-muted)]
          `)}
        >
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={`${crumb}-${i}`} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden="true" className="mx-1.5 opacity-50">
                    /
                  </span>
                )}
                <span
                  className={
                    isLast
                      ? "text-[var(--color-curie-fg)]"
                      : "text-[var(--color-curie-fg-muted)]"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex items-center gap-3">
        {/* Search pill — disabled placeholder until Phase 9 */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="Search (coming soon)"
          tabIndex={-1}
          className={cn(`
            hidden
            h-9 w-[280px] items-center gap-2
            rounded-[var(--radius-curie-pill)]
            border border-[var(--color-curie-border)]
            bg-[var(--color-curie-surface)]
            px-3.5
            text-[13px] text-[var(--color-curie-fg-muted)]
            select-none
            disabled:cursor-not-allowed
            md:flex
          `)}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate">Search people, leave, meetings…</span>
          <kbd
            className={cn(`
              ml-auto
              rounded-[var(--radius-curie-xs)]
              bg-[var(--color-curie-surface-sunken)]
              px-1.5 py-0.5
              font-[family-name:var(--font-curie-mono)]
              text-[11px]
              text-[var(--color-curie-fg-secondary)]
            `)}
          >
            ⌘K
          </kbd>
        </button>

        {/* Search collapsed to icon below md */}
        <button
          type="button"
          aria-label="Search (coming soon)"
          aria-disabled="true"
          disabled
          className={cn(`
            grid h-9 w-9 place-items-center
            rounded-[var(--radius-curie-pill)]
            text-[var(--color-curie-fg-secondary)]
            disabled:cursor-not-allowed
            md:hidden
          `)}
        >
          <Search className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className={cn(`
            relative grid h-9 w-9 place-items-center
            rounded-[var(--radius-curie-pill)]
            text-[var(--color-curie-fg-secondary)]
            transition-colors
            hover:bg-[var(--color-curie-surface)]
          `)}
        >
          <Bell className="size-4" strokeWidth={1.5} aria-hidden="true" />
          {hasNotifications ? (
            <span
              aria-hidden="true"
              className={cn(`
                absolute right-[9px] top-[8px]
                h-2 w-2 rounded-[var(--radius-curie-pill)]
                bg-[var(--color-curie-brand)]
                ring-2 ring-[var(--color-curie-bg)]
              `)}
            />
          ) : null}
        </button>
      </div>
    </header>
  );
}

function buildCrumbs(pathname: string): string[] {
  const root = "workspace";
  if (pathname === "/" || pathname === "") return [root, "overview"];

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((s) => decodeURIComponent(s).replace(/-/g, " "));

  return [root, ...segments];
}
