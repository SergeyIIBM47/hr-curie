import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EmployeeSearch } from "@/components/employees/employee-search";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeCard } from "@/components/employees/employee-card";
import type { EmployeeListItem } from "@/types/employee";

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
  searchParams: Promise<{ q?: string }>;
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  await requireAuth("ADMIN");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const where = query
    ? {
        OR: [
          { firstName: { contains: query, mode: "insensitive" as const } },
          { lastName: { contains: query, mode: "insensitive" as const } },
          { workEmail: { contains: query, mode: "insensitive" as const } },
          { position: { contains: query, mode: "insensitive" as const } },
          { department: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const employees: EmployeeListItem[] = await prisma.employee.findMany({
    where,
    select: employeeSelect,
    orderBy: { lastName: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F]">Employees</h1>
          <p className="text-[15px] text-[#8E8E93]">
            {employees.length} {employees.length === 1 ? "employee" : "employees"}
          </p>
        </div>
        <Link
          href="/employees/new"
          className="inline-flex h-[44px] items-center justify-center rounded-[8px] bg-[#007AFF] px-5 text-[17px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Add Employee
        </Link>
      </div>

      <div className="mb-6">
        <EmployeeSearch />
      </div>

      <EmployeeTable employees={employees} />

      <div className="flex flex-col gap-3 md:hidden">
        {employees.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} />
        ))}
        {employees.length === 0 && (
          <p className="py-8 text-center text-[15px] text-[#8E8E93]">
            No employees found.
          </p>
        )}
      </div>
    </div>
  );
}
