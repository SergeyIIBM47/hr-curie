"use client";

import Link from "next/link";
import { formatDateUTC, cn } from "@/lib/utils";
import { LeaveStatusBadge } from "./leave-status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Btn, IPlus } from "@/components/curie";
import { countWorkingDays } from "./leave-request-form";

interface LeaveHistoryItem {
  id: string;
  type: "SICK_LEAVE" | "DAY_OFF" | "VACATION";
  status: "PENDING" | "APPROVED" | "REJECTED";
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
}

interface LeaveHistoryTableProps {
  requests: LeaveHistoryItem[];
}

const typeLabels: Record<LeaveHistoryItem["type"], string> = {
  SICK_LEAVE: "Sick Leave",
  DAY_OFF: "Day Off",
  VACATION: "Vacation",
};

const HEADER_CLASS = cn(
  "h-10 px-4",
  "text-[11px] font-medium uppercase tracking-[0.06em]",
  "font-[family-name:var(--font-curie-mono)]",
  "text-[var(--color-curie-fg-muted)]",
);

const CARD_CLASS = cn(
  "rounded-[var(--radius-curie-lg)]",
  "border border-[var(--color-curie-border)]",
  "bg-[var(--color-curie-surface)]",
  "shadow-[var(--shadow-curie-soft)]",
);

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${formatDateUTC(s)} — ${formatDateUTC(e)}`;
}

function getDuration(start: string, end: string): string {
  const days = countWorkingDays(new Date(start), new Date(end));
  return `${days} day${days !== 1 ? "s" : ""}`;
}

function formatSubmitted(dateStr: string): string {
  return formatDateUTC(new Date(dateStr));
}

export function LeaveHistoryTable({ requests }: LeaveHistoryTableProps) {
  if (requests.length === 0) {
    return (
      <div className={cn(CARD_CLASS, "p-8 text-center")}>
        <p
          className={cn(
            "mb-1 font-[family-name:var(--font-curie-display)]",
            "text-[20px] font-medium text-[var(--color-curie-fg)]",
          )}
        >
          No leave requests yet
        </p>
        <p className="mb-6 text-[14px] text-[var(--color-curie-fg-secondary)]">
          Submit your first leave request to get started.
        </p>
        <Link href="/leave/request" className="inline-block">
          <Btn variant="primary" icon={IPlus}>
            Request Leave
          </Btn>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className={cn("hidden overflow-hidden md:block", CARD_CLASS)}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEADER_CLASS}>Type</TableHead>
              <TableHead className={HEADER_CLASS}>Dates</TableHead>
              <TableHead className={HEADER_CLASS}>Duration</TableHead>
              <TableHead className={HEADER_CLASS}>Status</TableHead>
              <TableHead className={HEADER_CLASS}>Reason</TableHead>
              <TableHead className={HEADER_CLASS}>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow
                key={req.id}
                className="h-[56px] hover:bg-[var(--color-curie-surface-sunken)]"
              >
                <TableCell className="px-4 text-[14px] font-medium text-[var(--color-curie-fg)]">
                  {typeLabels[req.type]}
                </TableCell>
                <TableCell className="px-4 text-[14px] text-[var(--color-curie-fg)]">
                  {formatDateRange(req.startDate, req.endDate)}
                </TableCell>
                <TableCell className="px-4 text-[14px] text-[var(--color-curie-fg-secondary)]">
                  {getDuration(req.startDate, req.endDate)}
                </TableCell>
                <TableCell className="px-4">
                  <LeaveStatusBadge status={req.status} />
                </TableCell>
                <TableCell className="max-w-[200px] truncate px-4 text-[14px] text-[var(--color-curie-fg-secondary)]">
                  {req.reason ?? "—"}
                </TableCell>
                <TableCell className="px-4 text-[14px] text-[var(--color-curie-fg-secondary)]">
                  {formatSubmitted(req.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {requests.map((req) => (
          <div key={req.id} className={cn(CARD_CLASS, "p-4")}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[14px] font-medium text-[var(--color-curie-fg)]">
                {typeLabels[req.type]}
              </span>
              <LeaveStatusBadge status={req.status} />
            </div>
            <p className="text-[13px] text-[var(--color-curie-fg-secondary)]">
              {formatDateRange(req.startDate, req.endDate)}
            </p>
            <p className="text-[13px] text-[var(--color-curie-fg-muted)]">
              {getDuration(req.startDate, req.endDate)} · Submitted{" "}
              {formatSubmitted(req.createdAt)}
            </p>
            {req.reason && (
              <p className="mt-2 text-[13px] text-[var(--color-curie-fg-secondary)]">
                {req.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
