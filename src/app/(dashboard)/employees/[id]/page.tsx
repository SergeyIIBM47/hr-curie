import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { employeeDetailSelect } from "@/lib/employee-select";
import { DetailField } from "@/components/shared/detail-field";
import { RoleToggle } from "@/components/employees/role-toggle";
import { Avatar, Btn, Pill } from "@/components/curie";
import { cn, formatDateUTC, isHttpUrl } from "@/lib/utils";

interface EmployeeProfilePageProps {
  params: Promise<{ id: string }>;
}

const CARD_CLASS = cn(
  "rounded-[var(--radius-curie-lg)] p-6",
  "bg-[var(--color-curie-surface)]",
  "border border-[var(--color-curie-border)]",
  "shadow-[var(--shadow-curie-soft)]",
);

const SECTION_HEADING = cn(
  "mb-6 font-[family-name:var(--font-curie-display)]",
  "text-[20px] font-medium leading-tight tracking-[-0.015em]",
  "text-[var(--color-curie-fg)]",
);

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
  const roleBadge = employee.user.role === "ADMIN" ? "Admin" : "Employee";
  const avatarSrc =
    employee.avatarUrl && isHttpUrl(employee.avatarUrl)
      ? employee.avatarUrl
      : undefined;
  const linkedinHref =
    employee.linkedinUrl && isHttpUrl(employee.linkedinUrl)
      ? employee.linkedinUrl
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className={CARD_CLASS}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar name={fullName} size="lg" imageSrc={avatarSrc} />

            <div className="flex flex-col items-center gap-2 sm:items-start">
              <h1
                className={cn(
                  "font-[family-name:var(--font-curie-display)]",
                  "text-[28px] font-medium leading-tight tracking-[-0.015em]",
                  "text-[var(--color-curie-fg)]",
                )}
              >
                {fullName}
              </h1>
              {employee.position ? (
                <p className="text-[15px] text-[var(--color-curie-fg-secondary)]">
                  {employee.position}
                </p>
              ) : null}
              <Pill variant="role" className="uppercase">
                {roleBadge}
              </Pill>
              {isAdmin ? (
                <RoleToggle
                  employeeId={id}
                  currentRole={employee.user.role}
                  isSelf={employee.user.id === session.user.id}
                />
              ) : null}
            </div>
          </div>

          {isAdmin ? (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:self-start">
              <Link href="/employees">
                <Btn variant="secondary" size="sm">
                  Back to List
                </Btn>
              </Link>
              <Link href={`/employees/${id}/edit`}>
                <Btn variant="primary" size="sm">
                  Edit
                </Btn>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Info card */}
      <div className={CARD_CLASS}>
        <h2 className={SECTION_HEADING}>Personal Information</h2>

        <div className="grid gap-6 md:grid-cols-2">
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
          <DetailField label="Start Year" value={String(employee.startYear)} />
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
