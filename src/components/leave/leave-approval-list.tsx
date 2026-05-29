"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { LeaveApprovalCard } from "./leave-approval-card";
import { cn } from "@/lib/utils";

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
      <div
        className={cn(
          "p-8 text-center",
          "rounded-[var(--radius-curie-lg)]",
          "border border-[var(--color-curie-border)]",
          "bg-[var(--color-curie-surface)]",
          "shadow-[var(--shadow-curie-soft)]",
        )}
      >
        <CheckCircle className="mx-auto mb-3 size-12 text-[var(--color-curie-success)]" />
        <p
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[20px] font-medium text-[var(--color-curie-fg)]",
          )}
        >
          All caught up!
        </p>
        <p className="text-[14px] text-[var(--color-curie-fg-secondary)]">
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
