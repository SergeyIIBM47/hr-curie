import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { DetailField } from "@/components/shared/detail-field";
import { Btn, Pill } from "@/components/curie";
import { cn, getInitials, formatDateUTC, isHttpUrl } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      workEmail: true,
      dateOfBirth: true,
      actualResidence: true,
      startYear: true,
      position: true,
      phone: true,
      department: true,
      location: true,
      healthInsurance: true,
      education: true,
      certifications: true,
      linkedinUrl: true,
      tshirtSize: true,
      avatarUrl: true,
      employmentType: { select: { name: true } },
      user: { select: { role: true } },
    },
  });

  if (!employee) redirect("/");

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const roleBadge = employee.user.role === "ADMIN" ? "Admin" : "Employee";
  const isAdmin = employee.user.role === "ADMIN";
  const linkedinHref =
    employee.linkedinUrl && isHttpUrl(employee.linkedinUrl)
      ? employee.linkedinUrl
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div
        className={cn(
          "rounded-[var(--radius-curie-lg)] p-6",
          "bg-[var(--color-curie-surface)]",
          "border border-[var(--color-curie-border)]",
          "shadow-[var(--shadow-curie-soft)]",
        )}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div
            className={cn(
              "size-[96px] shrink-0",
              "flex items-center justify-center",
              "rounded-full bg-[var(--color-curie-surface-sunken)]",
              "overflow-hidden",
            )}
          >
            {employee.avatarUrl && isHttpUrl(employee.avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={employee.avatarUrl}
                alt={fullName}
                className="size-full object-cover"
              />
            ) : (
              <span
                className={cn(
                  "font-[family-name:var(--font-curie-display)]",
                  "text-[28px] font-medium",
                  "text-[var(--color-curie-fg-secondary)]",
                )}
              >
                {getInitials(fullName)}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
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
          </div>

          {isAdmin ? (
            <div className="sm:self-start">
              <Link href={`/employees/${employee.id}/edit`}>
                <Btn variant="primary" size="sm">
                  Edit
                </Btn>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Info Card */}
      <div
        className={cn(
          "rounded-[var(--radius-curie-lg)] p-6",
          "bg-[var(--color-curie-surface)]",
          "border border-[var(--color-curie-border)]",
          "shadow-[var(--shadow-curie-soft)]",
        )}
      >
        <h2
          className={cn(
            "mb-6 font-[family-name:var(--font-curie-display)]",
            "text-[20px] font-medium leading-tight tracking-[-0.015em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          Personal Information
        </h2>

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
          {employee.phone ? (
            <DetailField label="Phone" value={employee.phone} />
          ) : null}
          {employee.department ? (
            <DetailField label="Department" value={employee.department} />
          ) : null}
          {employee.location ? (
            <DetailField label="Location" value={employee.location} />
          ) : null}
          {employee.education ? (
            <DetailField label="Education" value={employee.education} />
          ) : null}
          {employee.certifications ? (
            <DetailField
              label="Certifications"
              value={employee.certifications}
            />
          ) : null}
          {employee.healthInsurance ? (
            <DetailField
              label="Health Insurance"
              value={employee.healthInsurance}
            />
          ) : null}
          {employee.tshirtSize ? (
            <DetailField label="T-Shirt Size" value={employee.tshirtSize} />
          ) : null}
          {employee.linkedinUrl ? (
            <DetailField
              label="LinkedIn"
              value={employee.linkedinUrl}
              href={linkedinHref}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
