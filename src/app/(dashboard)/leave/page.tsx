import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { LeaveHistoryTable } from "@/components/leave/leave-history-table";
import { Btn, IPlus } from "@/components/curie";
import { cn } from "@/lib/utils";

export default async function LeavePage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      startDate: true,
      endDate: true,
      reason: true,
      createdAt: true,
    },
  });

  const serialized = leaveRequests.map((lr) => ({
    ...lr,
    startDate: lr.startDate.toISOString(),
    endDate: lr.endDate.toISOString(),
    createdAt: lr.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[28px] font-medium leading-tight tracking-[-0.015em]",
              "text-[var(--color-curie-fg)]",
            )}
          >
            Leave
          </h1>
          <p className="text-[15px] text-[var(--color-curie-fg-secondary)]">
            {leaveRequests.length}{" "}
            {leaveRequests.length === 1 ? "request" : "requests"}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {isAdmin && (
            <Link href="/leave/manage">
              <Btn variant="secondary">Manage Requests</Btn>
            </Link>
          )}
          <Link href="/leave/request">
            <Btn variant="primary" icon={IPlus}>
              Request Leave
            </Btn>
          </Link>
        </div>
      </div>

      <LeaveHistoryTable requests={serialized} />
    </div>
  );
}
