import type { Prisma } from "@prisma/client";

export interface EmployeeListFilters {
  q?: string;
  team?: string;
  view?: string;
}

export function buildEmployeeWhere(
  filters: EmployeeListFilters,
): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};

  const query = filters.q?.trim() ?? "";
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { workEmail: { contains: query, mode: "insensitive" } },
      { position: { contains: query, mode: "insensitive" } },
      { department: { contains: query, mode: "insensitive" } },
    ];
  }

  if (filters.team) {
    where.department = { equals: filters.team, mode: "insensitive" };
  }

  if (filters.view === "onboarding") {
    where.onboardingPlan = { is: { status: { not: "COMPLETE" } } };
  }

  return where;
}
