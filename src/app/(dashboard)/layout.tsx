import { requireAuth } from "@/lib/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const user = {
    name: session.user.name ?? session.user.email,
    email: session.user.email,
    role: session.user.role,
    image: session.user.image ?? undefined,
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <Sidebar user={user} />
      <Topbar user={user} />

      <main id="main-content" className="md:pl-[260px]">
        <div className="mx-auto max-w-[1200px] p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
