import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  await requireAuth("ADMIN");

  const employmentTypes = await prisma.employmentType.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-[28px] font-bold text-[#1D1D1F]">
        Add Employee
      </h1>
      <EmployeeForm employmentTypes={employmentTypes} />
    </div>
  );
}
