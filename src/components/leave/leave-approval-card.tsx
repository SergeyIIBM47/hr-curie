"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeaveStatusBadge } from "./leave-status-badge";
import { formatDateUTC, getInitials } from "@/lib/utils";
import { countWorkingDays } from "./leave-request-form";

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

interface LeaveApprovalCardProps {
  request: PendingLeaveRequest;
  onResolved: (id: string) => void;
}

const typeLabels: Record<PendingLeaveRequest["type"], string> = {
  SICK_LEAVE: "Sick Leave",
  DAY_OFF: "Day Off",
  VACATION: "Vacation",
};

export function LeaveApprovalCard({
  request,
  onResolved,
}: LeaveApprovalCardProps) {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const employee = request.user.employee;
  const fullName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "Unknown Employee";
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  const duration = countWorkingDays(startDate, endDate);

  async function handleConfirm() {
    if (!confirmAction) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/leave/${request.id}/${confirmAction}`,
        { method: "POST" },
      );

      if (!res.ok) {
        const body = await res.json();
        toast.error(
          body.error ?? `Failed to ${confirmAction} request`,
        );
        return;
      }

      toast.success(
        confirmAction === "approve"
          ? "Leave request approved"
          : "Leave request rejected",
      );

      setDismissed(true);

      // Wait for animation to complete before notifying parent
      setTimeout(() => {
        onResolved(request.id);
        router.refresh();
      }, 350);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        style={{
          transition: "opacity 350ms cubic-bezier(0.25, 0.1, 0.25, 1), max-height 350ms cubic-bezier(0.25, 0.1, 0.25, 1), margin 350ms cubic-bezier(0.25, 0.1, 0.25, 1), padding 350ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          opacity: dismissed ? 0 : 1,
          maxHeight: dismissed ? "0px" : "500px",
          marginBottom: dismissed ? "0px" : undefined,
          paddingTop: dismissed ? "0px" : undefined,
          paddingBottom: dismissed ? "0px" : undefined,
          overflow: "hidden",
        }}
        className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]"
      >
        {/* Header: Avatar + Name + Type */}
        <div className="mb-4 flex items-center gap-3">
          <Avatar className="size-10">
            {employee?.avatarUrl && (
              <AvatarImage src={employee.avatarUrl} alt={fullName} />
            )}
            <AvatarFallback className="bg-[#007AFF]/10 text-[13px] font-semibold text-[#007AFF]">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-[15px] font-medium text-[#1D1D1F]">
              {fullName}
            </p>
            <p className="text-[13px] text-[#8E8E93]">
              {typeLabels[request.type]}
            </p>
          </div>
          <LeaveStatusBadge status={request.status} />
        </div>

        {/* Details */}
        <div className="mb-4 space-y-1.5">
          <p className="text-[15px] text-[#1D1D1F]">
            {formatDateUTC(startDate)} — {formatDateUTC(endDate)}
          </p>
          <p className="text-[13px] text-[#8E8E93]">
            {duration} working day{duration !== 1 ? "s" : ""} · Submitted{" "}
            {formatDateUTC(new Date(request.createdAt))}
          </p>
          {request.reason && (
            <p className="text-[14px] text-[#3C3C43]">{request.reason}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConfirmAction("reject")}
            className="h-[44px] flex-1 rounded-[8px] bg-[#FF3B30] text-[17px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setConfirmAction("approve")}
            className="h-[44px] flex-1 rounded-[8px] bg-[#34C759] text-[17px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Approve
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve"
                ? "Approve Leave Request"
                : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {confirmAction === "approve" ? "approve" : "reject"}{" "}
              <strong>{fullName}</strong>&apos;s{" "}
              {typeLabels[request.type].toLowerCase()} request for{" "}
              {duration} working day{duration !== 1 ? "s" : ""}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              disabled={loading}
              className="h-[44px] w-full rounded-[8px] px-4 text-[15px] font-semibold text-[#007AFF] transition-colors duration-150 hover:bg-[#E5E5EA] sm:h-[36px] sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`h-[44px] w-full rounded-[8px] px-4 text-[15px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:h-[36px] sm:w-auto ${
                confirmAction === "approve"
                  ? "bg-[#34C759]"
                  : "bg-[#FF3B30]"
              }`}
            >
              {loading
                ? "Processing..."
                : confirmAction === "approve"
                  ? "Approve"
                  : "Reject"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
