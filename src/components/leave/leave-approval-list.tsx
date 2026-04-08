"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { LeaveApprovalCard } from "./leave-approval-card";

interface PendingLeaveRequest {
  id: string;
  type: "SICK_LEAVE" | "DAY_OFF" | "VACATION";
  status: "PENDING";
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
  user: {
    employee: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  };
}

interface LeaveApprovalListProps {
  initialRequests: PendingLeaveRequest[];
}

export function LeaveApprovalList({ initialRequests }: LeaveApprovalListProps) {
  const [requests, setRequests] = useState(initialRequests);

  function handleResolved(id: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-[10px] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
        <CheckCircle className="mx-auto mb-3 size-12 text-[#34C759]" />
        <p className="text-[17px] font-medium text-[#1D1D1F]">
          All caught up!
        </p>
        <p className="text-[15px] text-[#8E8E93]">
          No pending leave requests to review.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {requests.map((req) => (
        <LeaveApprovalCard
          key={req.id}
          request={req}
          onResolved={handleResolved}
        />
      ))}
    </div>
  );
}
