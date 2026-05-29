"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeaveStatusBadge } from "./leave-status-badge";
import { formatDateUTC, cn } from "@/lib/utils";
import { countWorkingDays } from "./leave-request-form";
import { Avatar, Btn } from "@/components/curie";

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

const CARD_CLASS = cn(
  "p-6",
  "rounded-[var(--radius-curie-lg)]",
  "bg-[var(--color-curie-surface)]",
  "border border-[var(--color-curie-border)]",
  "shadow-[var(--shadow-curie-soft)]",
);

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
          transition:
            "opacity 350ms cubic-bezier(0.25, 0.1, 0.25, 1), max-height 350ms cubic-bezier(0.25, 0.1, 0.25, 1), margin 350ms cubic-bezier(0.25, 0.1, 0.25, 1), padding 350ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          opacity: dismissed ? 0 : 1,
          maxHeight: dismissed ? "0px" : "500px",
          marginBottom: dismissed ? "0px" : undefined,
          paddingTop: dismissed ? "0px" : undefined,
          paddingBottom: dismissed ? "0px" : undefined,
          overflow: "hidden",
        }}
        className={CARD_CLASS}
      >
        {/* Header: Avatar + Name + Type */}
        <div className="mb-4 flex items-center gap-3">
          <Avatar
            name={fullName}
            size="md"
            imageSrc={employee?.avatarUrl ?? undefined}
          />
          <div className="flex-1">
            <p className="text-[14px] font-medium text-[var(--color-curie-fg)]">
              {fullName}
            </p>
            <p className="text-[12px] text-[var(--color-curie-fg-secondary)]">
              {typeLabels[request.type]}
            </p>
          </div>
          <LeaveStatusBadge status={request.status} />
        </div>

        {/* Details */}
        <div className="mb-4 space-y-1.5">
          <p className="text-[14px] text-[var(--color-curie-fg)]">
            {formatDateUTC(startDate)} — {formatDateUTC(endDate)}
          </p>
          <p className="text-[12px] text-[var(--color-curie-fg-muted)]">
            {duration} working day{duration !== 1 ? "s" : ""} · Submitted{" "}
            {formatDateUTC(new Date(request.createdAt))}
          </p>
          {request.reason && (
            <p className="text-[13px] text-[var(--color-curie-fg-secondary)]">
              {request.reason}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Btn
            variant="secondary"
            size="sm"
            onClick={() => setConfirmAction("reject")}
          >
            Reject
          </Btn>
          <Btn
            variant="primary"
            size="sm"
            onClick={() => setConfirmAction("approve")}
          >
            Approve
          </Btn>
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
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-end">
            <Btn
              variant="secondary"
              size="sm"
              onClick={() => setConfirmAction(null)}
              disabled={loading}
            >
              Cancel
            </Btn>
            <Btn
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : confirmAction === "approve"
                  ? "Approve"
                  : "Reject"}
            </Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
