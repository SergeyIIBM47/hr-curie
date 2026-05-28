import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { NavCounts } from "@/components/layout/nav-items";

interface DashboardLayoutProps {
  children: React.ReactNode;
  rail?: React.ReactNode;
}

export default async function DashboardLayout({
  children,
  rail,
}: DashboardLayoutProps) {
  const session = await requireAuth();

  const [employees, pendingLeave] = await Promise.all([
    prisma.employee.count(),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
  ]);

  const counts: NavCounts = { employees, pendingLeave };

  const user = {
    name: session.user.name ?? session.user.email,
    email: session.user.email,
    role: session.user.role,
    image: session.user.image ?? undefined,
  };

  return (
    <AppShell
      sidebar={
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar user={user} counts={counts} />
        </Suspense>
      }
      topbar={
        <Suspense fallback={<TopbarFallback />}>
          <Topbar user={user} counts={counts} />
        </Suspense>
      }
      rail={rail}
    >
      {children}
    </AppShell>
  );
}

function SidebarFallback() {
  return (
    <aside
      aria-hidden="true"
      className="
        sticky top-0 z-30
        hidden h-screen
        bg-[var(--color-curie-bg)]
        md:block
      "
    />
  );
}

function TopbarFallback() {
  return (
    <header
      aria-hidden="true"
      className="
        sticky top-0 z-40
        h-[72px]
        bg-[var(--color-curie-bg)]
      "
    />
  );
}
