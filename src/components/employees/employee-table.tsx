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
import { Avatar, Pill } from "@/components/curie";
import { cn } from "@/lib/utils";
import type { EmployeeListItem } from "@/types/employee";

interface EmployeeTableProps {
  employees: EmployeeListItem[];
}

const HEADER_CLASS = cn(
  "h-10 px-4",
  "text-[11px] font-medium uppercase tracking-[0.06em]",
  "font-[family-name:var(--font-curie-mono)]",
  "text-[var(--color-curie-fg-muted)]",
);

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "hidden overflow-hidden md:block",
        "rounded-[var(--radius-curie-lg)]",
        "border border-[var(--color-curie-border)]",
        "bg-[var(--color-curie-surface)]",
        "shadow-[var(--shadow-curie-soft)]",
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEADER_CLASS}>Name</TableHead>
            <TableHead className={HEADER_CLASS}>Department</TableHead>
            <TableHead className={HEADER_CLASS}>Employment Type</TableHead>
            <TableHead className={HEADER_CLASS}>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            return (
              <TableRow
                key={emp.id}
                tabIndex={0}
                className={cn(
                  "h-[56px] cursor-pointer transition-colors duration-150",
                  "hover:bg-[var(--color-curie-surface-sunken)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-curie-brand)]",
                )}
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
                    <Avatar
                      name={fullName}
                      size="sm"
                      imageSrc={emp.avatarUrl ?? undefined}
                    />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[var(--color-curie-fg)]">
                        {fullName}
                      </span>
                      {emp.position ? (
                        <span className="text-[12px] text-[var(--color-curie-fg-secondary)]">
                          {emp.position}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 text-[14px] text-[var(--color-curie-fg-secondary)]">
                  {emp.department ?? "—"}
                </TableCell>
                <TableCell className="px-4 text-[14px] text-[var(--color-curie-fg-secondary)]">
                  {emp.employmentType.name}
                </TableCell>
                <TableCell className="px-4">
                  <Pill variant="role" className="uppercase">
                    {emp.user.role === "ADMIN" ? "Admin" : "Employee"}
                  </Pill>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
