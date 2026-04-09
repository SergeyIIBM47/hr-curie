import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
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
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1D1D1F]">Settings</h1>
        <p className="text-[15px] text-[#8E8E93]">
          Manage system configuration
        </p>
      </div>

      <EmploymentTypeManager initialTypes={serialized} />
    </div>
  );
}
