import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/employees/employee-form";
import { format } from "date-fns";

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  await requireAuth("ADMIN");
  const { id } = await params;

  const [employee, employmentTypes] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        workEmail: true,
        dateOfBirth: true,
        actualResidence: true,
        startYear: true,
        phone: true,
        position: true,
        department: true,
        location: true,
        healthInsurance: true,
        education: true,
        certifications: true,
        linkedinUrl: true,
        tshirtSize: true,
        employmentTypeId: true,
      },
    }),
    prisma.employmentType.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!employee) notFound();

  const defaultValues = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    workEmail: employee.workEmail,
    employmentTypeId: employee.employmentTypeId,
    dateOfBirth: format(
      new Date(
        employee.dateOfBirth.getUTCFullYear(),
        employee.dateOfBirth.getUTCMonth(),
        employee.dateOfBirth.getUTCDate(),
      ),
      "yyyy-MM-dd",
    ),
    actualResidence: employee.actualResidence,
    startYear: employee.startYear,
    phone: employee.phone ?? "",
    position: employee.position ?? "",
    department: employee.department ?? "",
    location: employee.location ?? "",
    healthInsurance: employee.healthInsurance ?? "",
    education: employee.education ?? "",
    certifications: employee.certifications ?? "",
    linkedinUrl: employee.linkedinUrl ?? "",
    tshirtSize: employee.tshirtSize ?? "",
  };

  return (
    <div>
      <h1 className="mb-6 text-[28px] font-bold text-[#1D1D1F]">
        Edit Employee
      </h1>
      <EmployeeForm
        mode="edit"
        employeeId={id}
        employmentTypes={employmentTypes}
        defaultValues={defaultValues}
      />
    </div>
  );
}
