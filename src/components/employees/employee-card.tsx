"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { EmployeeListItem } from "@/types/employee";

interface EmployeeCardProps {
  employee: EmployeeListItem;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <Link
      href={`/employees/${employee.id}`}
      className="block rounded-[10px] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] transition-colors hover:bg-[#F2F2F7]"
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          {employee.avatarUrl && (
            <AvatarImage src={employee.avatarUrl} alt={fullName} />
          )}
          <AvatarFallback className="bg-[#007AFF]/10 text-[13px] font-semibold text-[#007AFF]">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 overflow-hidden">
          <p className="truncate text-[15px] font-medium text-[#1D1D1F]">
            {fullName}
          </p>
          <p className="truncate text-[13px] text-[#8E8E93]">
            {employee.workEmail}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold uppercase ${
              employee.user.role === "ADMIN"
                ? "bg-[#5856D6]/15 text-[#5856D6]"
                : "bg-[#007AFF]/10 text-[#007AFF]"
            }`}
          >
            {employee.user.role === "ADMIN" ? "Admin" : "Employee"}
          </span>
          {employee.department && (
            <span className="text-[12px] text-[#8E8E93]">
              {employee.department}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
