"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navItems, getInitials } from "@/components/layout/nav-items";
import type { Role } from "@prisma/client";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: Role;
    image?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[#C6C6C8] glass-heavy md:flex">
      <div className="p-6">
        <span className="text-[17px] font-semibold text-[#007AFF]">
          HR Curie
        </span>
      </div>

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-0 py-2">
        {navItems.map((item) => {
          if (item.adminOnly && user.role !== "ADMIN") return null;

          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`mx-3 mb-0.5 flex h-[44px] items-center gap-3 rounded-[8px] px-3 transition-colors duration-150 ${
                active
                  ? "border-l-[3px] border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]"
                  : "text-[#1D1D1F] hover:bg-[#E5E5EA]"
              }`}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.75} />
              <span className="text-[15px] font-medium">{item.label}</span>
              {item.adminOnly && (
                <span className="ml-auto rounded-[6px] bg-[#5856D6]/15 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-[#5856D6]">
                  Admin
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#C6C6C8] p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="bg-[#007AFF]/10 text-[13px] font-semibold text-[#007AFF]">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[14px] font-medium text-[#1D1D1F]">
              {user.name}
            </p>
            <p className="truncate text-[12px] text-[#8E8E93]">
              {user.role === "ADMIN" ? "Administrator" : "Employee"}
            </p>
          </div>
          <button
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="rounded-[8px] p-2 text-[#8E8E93] transition-colors duration-150 hover:bg-[#E5E5EA] hover:text-[#FF3B30]"
            aria-label="Sign out"
          >
            <LogOut className="size-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
