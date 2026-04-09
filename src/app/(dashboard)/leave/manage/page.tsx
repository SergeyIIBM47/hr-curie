import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { LeaveApprovalList } from "@/components/leave/leave-approval-list";

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
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F]">
            Manage Leave Requests
          </h1>
          <p className="text-[15px] text-[#8E8E93]">
            {pendingRequests.length} pending{" "}
            {pendingRequests.length === 1 ? "request" : "requests"}
          </p>
        </div>
        <Link
          href="/leave"
          className="inline-flex h-[44px] w-full items-center justify-center rounded-[8px] border border-[#007AFF] px-5 text-[17px] font-semibold text-[#007AFF] transition-all duration-150 hover:bg-[#007AFF]/5 active:scale-[0.98] sm:w-auto"
        >
          Back to Leave
        </Link>
      </div>

      <LeaveApprovalList initialRequests={serialized} />
    </div>
  );
}
