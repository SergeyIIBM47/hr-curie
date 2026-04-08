"use client";

import Link from "next/link";
import { formatDateUTC } from "@/lib/utils";
import { LeaveStatusBadge } from "./leave-status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
      <div className="rounded-[10px] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
        <p className="mb-1 text-[17px] font-medium text-[#1D1D1F]">
          No leave requests yet
        </p>
        <p className="mb-4 text-[15px] text-[#8E8E93]">
          Submit your first leave request to get started.
        </p>
        <Link
          href="/leave/request"
          className="inline-flex h-[44px] items-center justify-center rounded-[8px] bg-[#007AFF] px-5 text-[17px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Request Leave
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden rounded-[10px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                Type
              </TableHead>
              <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                Dates
              </TableHead>
              <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                Duration
              </TableHead>
              <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                Status
              </TableHead>
              <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                Reason
              </TableHead>
              <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
                Submitted
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} className="h-[52px] hover:bg-[#F2F2F7]">
                <TableCell className="px-4 text-[15px] font-medium text-[#1D1D1F]">
                  {typeLabels[req.type]}
                </TableCell>
                <TableCell className="px-4 text-[15px] text-[#1D1D1F]">
                  {formatDateRange(req.startDate, req.endDate)}
                </TableCell>
                <TableCell className="px-4 text-[15px] text-[#8E8E93]">
                  {getDuration(req.startDate, req.endDate)}
                </TableCell>
                <TableCell className="px-4">
                  <LeaveStatusBadge status={req.status} />
                </TableCell>
                <TableCell className="max-w-[200px] truncate px-4 text-[15px] text-[#8E8E93]">
                  {req.reason ?? "—"}
                </TableCell>
                <TableCell className="px-4 text-[15px] text-[#8E8E93]">
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
          <div
            key={req.id}
            className="rounded-[10px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#1D1D1F]">
                {typeLabels[req.type]}
              </span>
              <LeaveStatusBadge status={req.status} />
            </div>
            <p className="text-[13px] text-[#8E8E93]">
              {formatDateRange(req.startDate, req.endDate)}
            </p>
            <p className="text-[13px] text-[#8E8E93]">
              {getDuration(req.startDate, req.endDate)} · Submitted{" "}
              {formatSubmitted(req.createdAt)}
            </p>
            {req.reason && (
              <p className="mt-2 text-[13px] text-[#3C3C43]">{req.reason}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
