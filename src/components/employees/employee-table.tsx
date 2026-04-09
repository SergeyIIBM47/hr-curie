"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { EmployeeListItem } from "@/types/employee";

interface EmployeeTableProps {
  employees: EmployeeListItem[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter();

  return (
    <div className="hidden rounded-[10px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Name
            </TableHead>
            <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Email
            </TableHead>
            <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Role
            </TableHead>
            <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Department
            </TableHead>
            <TableHead className="h-10 px-4 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Employment Type
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            return (
              <TableRow
                key={emp.id}
                tabIndex={0}
                className="h-[52px] cursor-pointer transition-colors duration-150 hover:bg-[#F2F2F7]"
                onClick={() => router.push(`/employees/${emp.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/employees/${emp.id}`);
                  }
                }}
              >
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {emp.avatarUrl && (
                        <AvatarImage src={emp.avatarUrl} alt={fullName} />
                      )}
                      <AvatarFallback className="bg-[#007AFF]/10 text-[11px] font-semibold text-[#007AFF]">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[15px] font-medium text-[#1D1D1F]">
                      {fullName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-[15px] text-[#1D1D1F]">
                  {emp.workEmail}
                </TableCell>
                <TableCell className="px-4">
                  <span
                    className={`rounded-[6px] px-1.5 py-0.5 text-[11px] font-semibold uppercase ${
                      emp.user.role === "ADMIN"
                        ? "bg-[#5856D6]/15 text-[#5856D6]"
                        : "bg-[#007AFF]/10 text-[#007AFF]"
                    }`}
                  >
                    {emp.user.role === "ADMIN" ? "Admin" : "Employee"}
                  </span>
                </TableCell>
                <TableCell className="px-4 text-[15px] text-[#8E8E93]">
                  {emp.department ?? "—"}
                </TableCell>
                <TableCell className="px-4 text-[15px] text-[#8E8E93]">
                  {emp.employmentType.name}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
