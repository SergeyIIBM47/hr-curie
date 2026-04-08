import { cn } from "@/lib/utils";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

const statusStyles: Record<LeaveStatus, string> = {
  PENDING: "bg-[#FF9500]/15 text-[#FF9500]",
  APPROVED: "bg-[#34C759]/15 text-[#34C759]",
  REJECTED: "bg-[#FF3B30]/15 text-[#FF3B30]",
};

const statusLabels: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-[6px] px-2.5 py-0.5 text-[12px] font-semibold uppercase",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
