import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { LeaveApprovalList } from "@/components/leave/leave-approval-list";
import { Btn } from "@/components/curie";
import { cn } from "@/lib/utils";

export default async function LeaveManagePage() {
  await requireAuth("ADMIN");

  const pendingRequests = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const serialized = pendingRequests.map((lr) => ({
    id: lr.id,
    type: lr.type,
    status: lr.status as "PENDING",
    startDate: lr.startDate.toISOString(),
    endDate: lr.endDate.toISOString(),
    reason: lr.reason,
    createdAt: lr.createdAt.toISOString(),
    user: lr.user,
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
            Manage Leave Requests
          </h1>
          <p className="text-[15px] text-[var(--color-curie-fg-secondary)]">
            {pendingRequests.length} pending{" "}
            {pendingRequests.length === 1 ? "request" : "requests"}
          </p>
        </div>
        <Link href="/leave">
          <Btn variant="secondary">Back to Leave</Btn>
        </Link>
      </div>

      <LeaveApprovalList initialRequests={serialized} />
    </div>
  );
}
