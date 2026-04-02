"use client";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getInitials } from "@/components/layout/nav-items";
import type { Role } from "@prisma/client";

const pageTitles: Record<string, string> = {
  "/": "Overview",
  "/profile": "My Profile",
  "/employees": "Employees",
  "/leave": "Leave",
  "/calendar": "Calendar",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];

  for (const [path, title] of Object.entries(pageTitles)) {
    if (path !== "/" && pathname.startsWith(path)) return title;
  }

  return "Dashboard";
}

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: Role;
    image?: string;
  };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-[52px] items-center border-b border-[#C6C6C8] glass md:ml-[260px]">
      <div className="flex w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <MobileNav user={user} />
          <h1 className="text-[22px] font-bold text-[#1D1D1F]">{title}</h1>
        </div>

        <Avatar className="size-8">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-[#007AFF]/10 text-[11px] font-semibold text-[#007AFF]">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
