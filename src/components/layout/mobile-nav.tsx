"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface MobileNavProps {
  user: {
    name: string;
    email: string;
    role: Role;
    image?: string;
  };
  counts: NavCounts;
}

export function MobileNav({ user, counts }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHref = buildCurrentHref(pathname, searchParams);

  const canViewItem = (item: NavItem) =>
    !(item.adminOnly && user.role !== "ADMIN");
  const visibleMain = navItems.filter(canViewItem);
  const visibleFavorites = favoritesItems.filter(canViewItem);

  return (
    <div data-mobile-nav="true" className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className={cn(`
            grid h-9 w-9 place-items-center
            rounded-[var(--radius-curie-pill)]
            text-[var(--color-curie-fg-secondary)]
            transition-colors
            hover:bg-[var(--color-curie-surface)]
      `)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(`
            w-[280px]
            border-r border-[var(--color-curie-border)]
            bg-[var(--color-curie-bg)]
            p-0
      `)}
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>

          <div className="flex h-full flex-col">
            {/* Account at top */}
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className={cn(`
                flex items-center gap-2.5
                border-b border-[var(--color-curie-border)]
                px-6 py-4
                transition-colors hover:bg-[var(--color-curie-surface-sunken)]
      `)}
            >
              <span
                className={cn(`
                  grid h-10 w-10 place-items-center
                  rounded-[var(--radius-curie-pill)]
                  bg-[var(--color-curie-brand-soft)] text-[var(--color-curie-brand-ink)]
                  font-[family-name:var(--font-curie-display)]
                  text-[14px] font-medium
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
                className="size-4 text-[var(--color-curie-fg-muted)]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>

            {/* Brand row */}
            <div className="flex items-center gap-2.5 px-6 pt-5 pb-3">
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
                  font-[family-name:var(--font-curie-display)]
                  text-[18px] font-medium
                  text-[var(--color-curie-fg)]
      `)}
              >
                HR&nbsp;Curie
              </span>
            </div>

            <nav
              aria-label="Main navigation"
              className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-2"
            >
              <Section
                title="Main menu"
                items={visibleMain}
                currentHref={currentHref}
                counts={counts}
                onNavigate={() => setOpen(false)}
              />
              <Section
                title="Favorites"
                items={visibleFavorites}
                currentHref={currentHref}
                counts={counts}
                onNavigate={() => setOpen(false)}
              />
            </nav>

            <div className="border-t border-[var(--color-curie-border)] p-4">
              <button
                onClick={() => void signOut({ callbackUrl: "/login" })}
                className={cn(`
                  flex w-full items-center gap-2.5
                  rounded-[var(--radius-curie-sm)] px-3 py-2
                  text-[14px] font-medium
                  text-[var(--color-curie-fg-secondary)]
                  transition-colors
                  hover:bg-[var(--color-curie-surface-sunken)] hover:text-[var(--color-curie-danger)]
      `)}
                aria-label="Sign out"
              >
                <LogOut className="size-4" strokeWidth={1.5} aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface SectionProps {
  title: string;
  items: NavItem[];
  currentHref: string;
  counts: NavCounts;
  onNavigate: () => void;
}

function Section({ title, items, currentHref, counts, onNavigate }: SectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col">
      <span
        className={cn(`
          px-3 pb-2
          text-[11px] font-medium uppercase tracking-[0.08em]
          text-[var(--color-curie-fg-muted)]
      `)}
      >
        {title}
      </span>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = isNavHrefActive(currentHref, item.href);
          const Icon = item.icon;
          const count = item.countKey ? counts[item.countKey] : undefined;
          const showCount = typeof count === "number" && count > 0;

          return (
            <li key={item.href + item.label} className="relative">
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
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
                      absolute -left-1 top-2 bottom-2
                      w-[3px] rounded-r-[var(--radius-curie-xs)]
                      bg-[var(--color-curie-brand)]
      `)}
                  />
                ) : null}
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{item.label}</span>
                {showCount ? (
                  item.countKind === "pill" ? (
                    <span
                      className={cn(`
                        inline-flex h-[22px] items-center
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
        })}
      </ul>
    </div>
  );
}
