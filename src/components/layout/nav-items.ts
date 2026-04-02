import {
  LayoutDashboard,
  User,
  Users,
  CalendarOff,
  Calendar,
  Settings,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<LucideProps>;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Employees", href: "/employees", icon: Users, adminOnly: true },
  { label: "Leave", href: "/leave", icon: CalendarOff },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export { getInitials } from "@/lib/utils";
