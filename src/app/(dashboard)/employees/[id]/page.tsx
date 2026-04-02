import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { employeeDetailSelect } from "@/lib/employee-select";
import { DetailField } from "@/components/shared/detail-field";
import { RoleToggle } from "@/components/employees/role-toggle";
import { getInitials, formatDateUTC, isHttpUrl } from "@/lib/utils";

interface EmployeeProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeProfilePage({
  params,
}: EmployeeProfilePageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    select: employeeDetailSelect,
  });

  if (!employee) notFound();

  if (
    session.user.role !== "ADMIN" &&
    employee.user.id !== session.user.id
  ) {
    redirect("/profile");
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const isAdmin = session.user.role === "ADMIN";
  const linkedinHref =
    employee.linkedinUrl && isHttpUrl(employee.linkedinUrl)
      ? employee.linkedinUrl
      : undefined;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex size-[96px] shrink-0 items-center justify-center rounded-full bg-[#E5E5EA]">
            {employee.avatarUrl && isHttpUrl(employee.avatarUrl) ? (
              <img
                src={employee.avatarUrl}
                alt={fullName}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <span className="text-[28px] font-bold text-[#8E8E93]">
                {getInitials(fullName)}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-start">
            <h1 className="text-[28px] font-bold text-[#1D1D1F]">
              {fullName}
            </h1>
            {employee.position && (
              <p className="text-[15px] text-[#8E8E93]">
                {employee.position}
              </p>
            )}
            <span
              className={`rounded-[6px] px-2 py-0.5 text-[12px] font-semibold uppercase ${
                employee.user.role === "ADMIN"
                  ? "bg-[#5856D6]/15 text-[#5856D6]"
                  : "bg-[#007AFF]/10 text-[#007AFF]"
              }`}
            >
              {employee.user.role === "ADMIN" ? "Admin" : "Employee"}
            </span>
            {isAdmin && (
              <RoleToggle
                employeeId={id}
                currentRole={employee.user.role}
                isSelf={employee.user.id === session.user.id}
              />
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-3 self-center sm:self-start">
            <Link
              href="/employees"
              className="inline-flex h-[44px] items-center rounded-[8px] px-5 text-[17px] font-semibold text-[#007AFF] transition-colors hover:bg-[#E5E5EA]"
            >
              Back to List
            </Link>
            <Link
              href={`/employees/${id}/edit`}
              className="inline-flex h-[44px] items-center justify-center rounded-[8px] bg-[#007AFF] px-5 text-[17px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-6 rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-[20px] font-semibold text-[#1D1D1F]">
          Personal Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <DetailField label="First Name" value={employee.firstName} />
          <DetailField label="Last Name" value={employee.lastName} />
          <DetailField label="Work Email" value={employee.workEmail} />
          <DetailField
            label="Employment Type"
            value={employee.employmentType?.name}
          />
          <DetailField
            label="Date of Birth"
            value={formatDateUTC(employee.dateOfBirth)}
          />
          <DetailField
            label="Actual Residence"
            value={employee.actualResidence}
          />
          <DetailField
            label="Start Year"
            value={String(employee.startYear)}
          />
          {employee.phone && (
            <DetailField label="Phone" value={employee.phone} />
          )}
          {employee.department && (
            <DetailField label="Department" value={employee.department} />
          )}
          {employee.location && (
            <DetailField label="Location" value={employee.location} />
          )}
          {employee.education && (
            <DetailField label="Education" value={employee.education} />
          )}
          {employee.certifications && (
            <DetailField
              label="Certifications"
              value={employee.certifications}
            />
          )}
          {employee.healthInsurance && (
            <DetailField
              label="Health Insurance"
              value={employee.healthInsurance}
            />
          )}
          {employee.tshirtSize && (
            <DetailField label="T-Shirt Size" value={employee.tshirtSize} />
          )}
          {employee.linkedinUrl && (
            <DetailField
              label="LinkedIn"
              value={employee.linkedinUrl}
              href={linkedinHref}
            />
          )}
        </div>
      </div>
    </div>
  );
}
