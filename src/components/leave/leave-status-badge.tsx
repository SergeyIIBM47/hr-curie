import { Pill, type PillVariant } from "@/components/curie";

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

const statusVariants: Record<LeaveStatus, PillVariant> = {
  PENDING: "status-pending",
  APPROVED: "status-approved",
  REJECTED: "status-rejected",
};

const statusLabels: Record<LeaveStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  return (
    <Pill variant={statusVariants[status]} className="uppercase">
      {statusLabels[status]}
    </Pill>
  );
}
