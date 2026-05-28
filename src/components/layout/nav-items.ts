import {
  LayoutDashboard,
  User,
  Users,
  CalendarOff,
  Calendar,
  Settings,
  Star,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

export type NavSection = "main" | "favorites";
export type NavCountKind = "pill" | "mono";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<LucideProps>;
  section: NavSection;
  adminOnly?: boolean;
  count?: number;
  countKey?: "employees" | "pendingLeave";
  countKind?: NavCountKind;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard, section: "main" },
  { label: "My Profile", href: "/profile", icon: User, section: "main" },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    section: "main",
    adminOnly: true,
    countKey: "employees",
    countKind: "mono",
  },
  {
    label: "Leave",
    href: "/leave",
    icon: CalendarOff,
    section: "main",
    countKey: "pendingLeave",
    countKind: "pill",
  },
  { label: "Calendar", href: "/calendar", icon: Calendar, section: "main" },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    section: "main",
    adminOnly: true,
  },
];

export const favoritesItems: NavItem[] = [
  {
    label: "Engineering team",
    href: "/employees?team=engineering",
    icon: Star,
    section: "favorites",
    adminOnly: true,
  },
  {
    label: "Q2 hiring plan",
    href: "/employees?view=hiring",
    icon: Star,
    section: "favorites",
    adminOnly: true,
  },
  {
    label: "Onboarding pipeline",
    href: "/employees?view=onboarding",
    icon: Star,
    section: "favorites",
    adminOnly: true,
  },
];

export interface NavCounts {
  employees: number;
  pendingLeave: number;
}

export function buildCurrentHref(
  pathname: string,
  searchParams: { toString(): string },
): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function isNavHrefActive(currentHref: string, href: string): boolean {
  const current = splitHref(currentHref);
  const target = splitHref(href);

  if (target.path === "/") return current.path === "/" && !current.query;

  if (target.query) {
    return (
      current.path === target.path && queryEquals(current.query, target.query)
    );
  }

  if (current.query && current.path === target.path) return false;
  return (
    current.path === target.path || current.path.startsWith(`${target.path}/`)
  );
}

function splitHref(href: string): { path: string; query: string } {
  const withoutHash = href.split("#")[0];
  const queryStart = withoutHash.indexOf("?");
  if (queryStart === -1) return { path: withoutHash, query: "" };
  return {
    path: withoutHash.slice(0, queryStart),
    query: withoutHash.slice(queryStart + 1),
  };
}

function queryEquals(currentQuery: string, targetQuery: string): boolean {
  const current = sortedQueryEntries(currentQuery);
  const target = sortedQueryEntries(targetQuery);

  if (current.length !== target.length) return false;

  return current.every(
    ([key, value], index) =>
      key === target[index][0] && value === target[index][1],
  );
}

function sortedQueryEntries(query: string): Array<[string, string]> {
  return Array.from(new URLSearchParams(query).entries()).sort(
    ([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue),
  );
}

export { getInitials } from "@/lib/utils";
