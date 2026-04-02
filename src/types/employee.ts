import type { Role } from "@prisma/client";

export interface EmployeeListItem {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  position: string | null;
  department: string | null;
  avatarUrl: string | null;
  employmentType: { name: string };
  user: { id: string; role: Role };
}
