"use client";

import Link from "next/link";
import { Avatar, Pill } from "@/components/curie";
import { cn } from "@/lib/utils";
import type { EmployeeListItem } from "@/types/employee";

interface EmployeeCardProps {
  employee: EmployeeListItem;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <Link
      href={`/employees/${employee.id}`}
      className={cn(
        "block p-4",
        "rounded-[var(--radius-curie-lg)]",
        "border border-[var(--color-curie-border)]",
        "bg-[var(--color-curie-surface)]",
        "shadow-[var(--shadow-curie-soft)]",
        "transition-colors duration-150",
        "hover:bg-[var(--color-curie-surface-sunken)]",
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar
          name={fullName}
          size="md"
          imageSrc={employee.avatarUrl ?? undefined}
        />

        <div className="flex-1 overflow-hidden">
          <p className="truncate text-[14px] font-medium text-[var(--color-curie-fg)]">
            {fullName}
          </p>
          <p className="truncate text-[12px] text-[var(--color-curie-fg-secondary)]">
            {employee.position ?? employee.workEmail}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Pill variant="role" className="uppercase">
            {employee.user.role === "ADMIN" ? "Admin" : "Employee"}
          </Pill>
          {employee.department && (
            <span className="text-[11px] text-[var(--color-curie-fg-muted)]">
              {employee.department}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
