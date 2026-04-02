import { redirect } from "next/navigation";
import { format } from "date-fns";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { DetailField } from "@/components/shared/detail-field";
import { getInitials } from "@/lib/utils";

function formatDateUTC(date: Date): string {
  return format(
    new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    "MMMM d, yyyy",
  );
}

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default async function ProfilePage() {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: {
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
  const linkedinHref =
    employee.linkedinUrl && isHttpUrl(employee.linkedinUrl)
      ? employee.linkedinUrl
      : undefined;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex size-[96px] shrink-0 items-center justify-center rounded-full bg-[#E5E5EA]">
          {employee.avatarUrl ? (
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
          <h1 className="text-[28px] font-bold text-[#1D1D1F]">{fullName}</h1>
          {employee.position && (
            <p className="text-[15px] text-[#8E8E93]">{employee.position}</p>
          )}
          <span
            className={`rounded-[6px] px-2 py-0.5 text-[12px] font-semibold uppercase ${
              employee.user.role === "ADMIN"
                ? "bg-[#5856D6]/15 text-[#5856D6]"
                : "bg-[#007AFF]/10 text-[#007AFF]"
            }`}
          >
            {roleBadge}
          </span>
        </div>
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
