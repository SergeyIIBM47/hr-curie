import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/employees/employee-form";
import { cn } from "@/lib/utils";

export default async function NewEmployeePage() {
  await requireAuth("ADMIN");

  const employmentTypes = await prisma.employmentType.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1
        className={cn(
          "font-[family-name:var(--font-curie-display)]",
          "text-[28px] font-medium leading-tight tracking-[-0.015em]",
          "text-[var(--color-curie-fg)]",
        )}
      >
        Add Employee
      </h1>
      <EmployeeForm employmentTypes={employmentTypes} />
    </div>
  );
}
