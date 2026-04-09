import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { LeaveHistoryTable } from "@/components/leave/leave-history-table";

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
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F]">Leave</h1>
          <p className="text-[15px] text-[#8E8E93]">
            {leaveRequests.length}{" "}
            {leaveRequests.length === 1 ? "request" : "requests"}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {isAdmin && (
            <Link
              href="/leave/manage"
              className="inline-flex h-[44px] items-center justify-center rounded-[8px] border border-[#007AFF] px-5 text-[17px] font-semibold text-[#007AFF] transition-all duration-150 hover:bg-[#007AFF]/5 active:scale-[0.98]"
            >
              Manage Requests
            </Link>
          )}
          <Link
            href="/leave/request"
            className="inline-flex h-[44px] items-center justify-center rounded-[8px] bg-[#007AFF] px-5 text-[17px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Request Leave
          </Link>
        </div>
      </div>

      <LeaveHistoryTable requests={serialized} />
    </div>
  );
}
