import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { EmploymentTypeManager } from "./employment-type-manager";

export default async function SettingsPage() {
  await requireAuth("ADMIN");

  const types = await prisma.employmentType.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  const serialized = types.map((t) => ({
    id: t.id,
    name: t.name,
    employeeCount: t._count.employees,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[28px] font-medium leading-tight tracking-[-0.015em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          Settings
        </h1>
        <p className="text-[15px] text-[var(--color-curie-fg-secondary)]">
          Manage system configuration
        </p>
      </div>

      <EmploymentTypeManager initialTypes={serialized} />
    </div>
  );
}
