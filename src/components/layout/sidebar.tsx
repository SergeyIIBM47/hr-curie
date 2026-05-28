"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  navItems,
  favoritesItems,
  buildCurrentHref,
  getInitials,
  isNavHrefActive,
  type NavItem,
  type NavCounts,
} from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: Role;
    image?: string;
  };
  counts: NavCounts;
}

export function Sidebar({ user, counts }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHref = buildCurrentHref(pathname, searchParams);

  const canViewItem = (item: NavItem) =>
    !(item.adminOnly && user.role !== "ADMIN");
  const visibleMain = navItems.filter(canViewItem);
  const visibleFavorites = favoritesItems.filter(canViewItem);

  return (
    <aside
      aria-label="Primary"
      data-sidebar="desktop"
      className={cn(`
        sticky top-0 z-30
        hidden h-screen
        w-[60px] shrink-0
        flex-col
        bg-[var(--color-curie-bg)]
        px-4 pb-5 pt-7
        md:flex
        lg:w-[var(--curie-sidebar-w)]
      `)}
    >
      {/* Brand */}
      <Link
        href="/"
        className="mb-7 flex items-center gap-2.5 px-3 lg:gap-2.5"
        aria-label="HR Curie home"
      >
        <span
          className={cn(`
            grid h-7 w-7 place-items-center
            rounded-[var(--radius-curie-sm)]
            bg-[var(--color-curie-brand)]
            text-[18px] font-medium leading-none
            text-[var(--color-curie-fg-on-brand)]
            font-[family-name:var(--font-curie-display)]
      `)}
          aria-hidden="true"
        >
          C
        </span>
        <span
          className={cn(`
            hidden lg:inline
            font-[family-name:var(--font-curie-display)]
            text-[20px] font-medium
            text-[var(--color-curie-fg)]
      `)}
        >
          HR&nbsp;Curie
        </span>
      </Link>

      <nav
        aria-label="Main navigation"
        className="flex flex-1 flex-col gap-7 overflow-y-auto"
      >
        <NavSection
          title="Main menu"
          items={visibleMain}
          currentHref={currentHref}
          counts={counts}
        />
        <NavSection
          title="Favorites"
          items={visibleFavorites}
          currentHref={currentHref}
          counts={counts}
        />
      </nav>

      {/* Account block */}
      <div className="hidden lg:block">
        <Link
          href="/profile"
          className={cn(`
            mt-4 -mx-4 flex items-center gap-2.5
            border-t border-[var(--color-curie-border)]
            px-7 pb-1 pt-3.5
            transition-colors hover:bg-[var(--color-curie-surface-sunken)]
      `)}
        >
          <span
            className={cn(`
            grid h-9 w-9 place-items-center
              rounded-[var(--radius-curie-pill)]
              bg-[var(--color-curie-brand-soft)] text-[var(--color-curie-brand-ink)]
              font-[family-name:var(--font-curie-display)]
              text-[13px] font-medium
      `)}
            aria-hidden="true"
          >
            {getInitials(user.name)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-semibold text-[var(--color-curie-fg)]">
              {user.name}
            </span>
            <span className="block truncate text-[12px] text-[var(--color-curie-fg-muted)]">
              {user.role === "ADMIN" ? "Administrator" : "Employee"}
            </span>
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-[var(--color-curie-fg-muted)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </aside>
  );
}

interface NavSectionProps {
  title: string;
  items: NavItem[];
  currentHref: string;
  counts: NavCounts;
}

function NavSection({ title, items, currentHref, counts }: NavSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col">
      <span
        className={cn(`
          hidden lg:block
          px-3 pb-2
          text-[11px] font-medium uppercase tracking-[0.08em]
          text-[var(--color-curie-fg-muted)]
      `)}
      >
        {title}
      </span>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavItemLink
            key={item.href + item.label}
            item={item}
            active={isNavHrefActive(currentHref, item.href)}
            counts={counts}
          />
        ))}
      </ul>
    </div>
  );
}

interface NavItemLinkProps {
  item: NavItem;
  active: boolean;
  counts: NavCounts;
}

function NavItemLink({ item, active, counts }: NavItemLinkProps) {
  const Icon = item.icon;
  const count = item.countKey ? counts[item.countKey] : undefined;
  const showCount = typeof count === "number" && count > 0;

  return (
    <li className="relative">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        title={item.label}
        className={cn(`
          relative flex items-center gap-2.5
          rounded-[var(--radius-curie-sm)]
          px-3 py-2
          text-[14px] font-medium
          transition-colors
          ${
            active
              ? "bg-[var(--color-curie-brand-wash)] text-[var(--color-curie-fg)]"
              : "text-[var(--color-curie-fg-secondary)] hover:bg-[var(--color-curie-surface-sunken)]"
          }
        `)}
      >
        {active ? (
          <span
            aria-hidden="true"
            className={cn(`
              absolute -left-4 top-2 bottom-2
              w-[3px]
              rounded-r-[var(--radius-curie-xs)]
              bg-[var(--color-curie-brand)]
      `)}
          />
        ) : null}
        <Icon
          className="size-4 shrink-0"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <span className="hidden flex-1 truncate lg:block">{item.label}</span>

        {showCount ? (
          item.countKind === "pill" ? (
            <span
              className={cn(`
                ml-auto hidden lg:inline-flex
                h-[22px] items-center
                rounded-[var(--radius-curie-pill)]
                bg-[var(--color-curie-brand-soft)]
                px-2.5
                font-[family-name:var(--font-curie-mono)]
                text-[11px] font-medium
                text-[var(--color-curie-brand-ink)]
      `)}
              aria-label={`${count} pending`}
            >
              {count}
            </span>
          ) : (
            <span
              className={cn(`
                ml-auto hidden lg:inline
                font-[family-name:var(--font-curie-mono)]
                text-[11px]
                text-[var(--color-curie-fg-muted)]
      `)}
            >
              {count}
            </span>
          )
        ) : null}
      </Link>
    </li>
  );
}
