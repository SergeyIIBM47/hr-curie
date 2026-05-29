"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "@/lib/validations/employee";
import { Btn } from "@/components/curie";
import { cn } from "@/lib/utils";

interface EmploymentType {
  id: string;
  name: string;
}

interface EmployeeFormBaseProps {
  employmentTypes: EmploymentType[];
}

interface CreateFormProps extends EmployeeFormBaseProps {
  mode?: "create";
  defaultValues?: undefined;
  employeeId?: undefined;
}

interface EditFormProps extends EmployeeFormBaseProps {
  mode: "edit";
  defaultValues: UpdateEmployeeInput & { workEmail: string };
  employeeId: string;
}

type EmployeeFormProps = CreateFormProps | EditFormProps;

const inputClass = cn(
  "h-10 w-full px-3",
  "rounded-[var(--radius-curie-sm)]",
  "border border-[var(--color-curie-border)]",
  "bg-[var(--color-curie-surface)]",
  "text-[14px] text-[var(--color-curie-fg)]",
  "outline-none",
  "placeholder:text-[var(--color-curie-fg-muted)]",
  "focus:border-[var(--color-curie-brand)]",
  "focus:ring-2 focus:ring-[var(--color-curie-brand-soft)]",
);

const readOnlyInputClass = cn(
  "h-10 w-full px-3",
  "rounded-[var(--radius-curie-sm)]",
  "border border-[var(--color-curie-border)]",
  "bg-[var(--color-curie-surface-sunken)]",
  "text-[14px] text-[var(--color-curie-fg-muted)]",
  "outline-none cursor-not-allowed",
);

const cardClass = cn(
  "p-6",
  "rounded-[var(--radius-curie-lg)]",
  "bg-[var(--color-curie-surface)]",
  "border border-[var(--color-curie-border)]",
  "shadow-[var(--shadow-curie-soft)]",
);

const sectionHeading = cn(
  "mb-6",
  "text-[11px] font-medium uppercase tracking-[0.06em]",
  "font-[family-name:var(--font-curie-mono)]",
  "text-[var(--color-curie-fg-muted)]",
);

const labelClass = cn(
  "mb-1.5 block",
  "text-[13px] font-medium",
  "text-[var(--color-curie-fg-secondary)]",
);

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[12px] text-[var(--color-curie-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function EmployeeForm(props: EmployeeFormProps) {
  const { employmentTypes, mode = "create" } = props;
  const isEdit = mode === "edit";

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const formId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEmployeeInput | UpdateEmployeeInput>({
    resolver: zodResolver(isEdit ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: isEdit ? props.defaultValues : undefined,
  });

  function fieldId(name: string) {
    return `${formId}-${name}`;
  }

  async function onSubmit(data: CreateEmployeeInput | UpdateEmployeeInput) {
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/employees/${props.employeeId}`
        : "/api/employees";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(
          body.error ?? `Failed to ${isEdit ? "update" : "create"} employee`,
        );
        return;
      }

      toast.success(
        `Employee ${isEdit ? "updated" : "created"} successfully`,
      );
      router.refresh();
      router.push(isEdit ? `/employees/${props.employeeId}` : "/employees");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Section 1: Required */}
      <div className={cardClass}>
        <h2 className={sectionHeading}>Required Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="First Name"
            htmlFor={fieldId("firstName")}
            error={errors.firstName?.message}
          >
            <input
              {...register("firstName")}
              id={fieldId("firstName")}
              placeholder="John"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Last Name"
            htmlFor={fieldId("lastName")}
            error={errors.lastName?.message}
          >
            <input
              {...register("lastName")}
              id={fieldId("lastName")}
              placeholder="Doe"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Work Email"
            htmlFor={fieldId("workEmail")}
            error={
              !isEdit
                ? (errors as { workEmail?: { message?: string } }).workEmail
                    ?.message
                : undefined
            }
          >
            {props.mode === "edit" ? (
              <input
                id={fieldId("workEmail")}
                type="email"
                value={props.defaultValues.workEmail}
                readOnly
                className={readOnlyInputClass}
              />
            ) : (
              <input
                {...register("workEmail" as keyof CreateEmployeeInput)}
                id={fieldId("workEmail")}
                type="email"
                placeholder="john@company.com"
                className={inputClass}
              />
            )}
          </FormField>

          {!isEdit && (
            <FormField
              label="Password"
              htmlFor={fieldId("password")}
              error={
                (errors as { password?: { message?: string } }).password
                  ?.message
              }
            >
              <input
                {...register("password" as keyof CreateEmployeeInput)}
                id={fieldId("password")}
                type="password"
                placeholder="Minimum 8 characters"
                className={inputClass}
              />
            </FormField>
          )}

          <FormField
            label="Employment Type"
            htmlFor={fieldId("employmentTypeId")}
            error={errors.employmentTypeId?.message}
          >
            <select
              {...register("employmentTypeId")}
              id={fieldId("employmentTypeId")}
              className={inputClass}
              defaultValue={isEdit ? undefined : ""}
            >
              {!isEdit && (
                <option value="" disabled>
                  Select type...
                </option>
              )}
              {employmentTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Date of Birth"
            htmlFor={fieldId("dateOfBirth")}
            error={errors.dateOfBirth?.message}
          >
            <input
              {...register("dateOfBirth")}
              id={fieldId("dateOfBirth")}
              type="date"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Actual Residence"
            htmlFor={fieldId("actualResidence")}
            error={errors.actualResidence?.message}
          >
            <input
              {...register("actualResidence")}
              id={fieldId("actualResidence")}
              placeholder="City, Country"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Start Year"
            htmlFor={fieldId("startYear")}
            error={errors.startYear?.message}
          >
            <input
              {...register("startYear", { valueAsNumber: true })}
              id={fieldId("startYear")}
              type="number"
              placeholder={String(new Date().getFullYear())}
              className={inputClass}
            />
          </FormField>
        </div>
      </div>

      {/* Section 2: Optional */}
      <div className={cardClass}>
        <h2 className={sectionHeading}>Optional Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Phone"
            htmlFor={fieldId("phone")}
            error={errors.phone?.message}
          >
            <input
              {...register("phone")}
              id={fieldId("phone")}
              placeholder="+1 234 567 890"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Position"
            htmlFor={fieldId("position")}
            error={errors.position?.message}
          >
            <input
              {...register("position")}
              id={fieldId("position")}
              placeholder="Software Engineer"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Department"
            htmlFor={fieldId("department")}
            error={errors.department?.message}
          >
            <input
              {...register("department")}
              id={fieldId("department")}
              placeholder="Engineering"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Location"
            htmlFor={fieldId("location")}
            error={errors.location?.message}
          >
            <input
              {...register("location")}
              id={fieldId("location")}
              placeholder="Office location"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Health Insurance"
            htmlFor={fieldId("healthInsurance")}
            error={errors.healthInsurance?.message}
          >
            <input
              {...register("healthInsurance")}
              id={fieldId("healthInsurance")}
              placeholder="Provider name"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Education"
            htmlFor={fieldId("education")}
            error={errors.education?.message}
          >
            <input
              {...register("education")}
              id={fieldId("education")}
              placeholder="University, Degree"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Certifications"
            htmlFor={fieldId("certifications")}
            error={errors.certifications?.message}
          >
            <input
              {...register("certifications")}
              id={fieldId("certifications")}
              placeholder="AWS, PMP, etc."
              className={inputClass}
            />
          </FormField>

          <FormField
            label="LinkedIn"
            htmlFor={fieldId("linkedinUrl")}
            error={errors.linkedinUrl?.message}
          >
            <input
              {...register("linkedinUrl")}
              id={fieldId("linkedinUrl")}
              placeholder="https://linkedin.com/in/..."
              className={inputClass}
            />
          </FormField>

          <FormField
            label="T-Shirt Size"
            htmlFor={fieldId("tshirtSize")}
            error={errors.tshirtSize?.message}
          >
            <input
              {...register("tshirtSize")}
              id={fieldId("tshirtSize")}
              placeholder="M, L, XL..."
              className={inputClass}
            />
          </FormField>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Btn
          variant="secondary"
          type="button"
          onClick={() =>
            router.push(
              isEdit ? `/employees/${props.employeeId}` : "/employees",
            )
          }
        >
          Cancel
        </Btn>
        <Btn variant="primary" type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Employee"
          )}
        </Btn>
      </div>
    </form>
  );
}
