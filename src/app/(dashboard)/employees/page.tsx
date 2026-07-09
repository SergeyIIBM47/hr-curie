import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EmployeeSearch } from "@/components/employees/employee-search";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeCard } from "@/components/employees/employee-card";
import { Btn, IPlus } from "@/components/curie";
import { cn } from "@/lib/utils";
import type { EmployeeListItem } from "@/types/employee";
import { buildEmployeeWhere } from "./employee-list-query";

const employeeSelect = {
  id: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  position: true,
  department: true,
  avatarUrl: true,
  employmentType: { select: { name: true } },
  user: { select: { id: true, role: true } },
} as const;

interface EmployeesPageProps {
  searchParams: Promise<{ q?: string; team?: string; view?: string }>;
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  await requireAuth("ADMIN");

  const { q, team, view } = await searchParams;
  const where = buildEmployeeWhere({ q, team, view });

  const employees: EmployeeListItem[] = await prisma.employee.findMany({
    where,
    select: employeeSelect,
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[28px] font-medium leading-tight tracking-[-0.015em]",
              "text-[var(--color-curie-fg)]",
            )}
          >
            Employees
          </h1>
          <p className="text-[15px] text-[var(--color-curie-fg-secondary)]">
            {employees.length} {employees.length === 1 ? "employee" : "employees"}
          </p>
        </div>
        <Link href="/employees/new" className="sm:self-start">
          <Btn variant="primary" icon={IPlus}>
            Add Employee
          </Btn>
        </Link>
      </div>

      <EmployeeSearch />

      <EmployeeTable employees={employees} />

      <div className="flex flex-col gap-3 md:hidden">
        {employees.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} />
        ))}
        {employees.length === 0 && (
          <p className="py-8 text-center text-[15px] text-[var(--color-curie-fg-muted)]">
            No employees found.
          </p>
        )}
      </div>
    </div>
  );
}
