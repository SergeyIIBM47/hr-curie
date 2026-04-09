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

const inputClass =
  "h-[44px] w-full rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 text-[17px] text-[#1D1D1F] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40";

const readOnlyInputClass =
  "h-[44px] w-full rounded-[8px] bg-[rgba(120,120,128,0.06)] px-3 text-[17px] text-[#8E8E93] outline-none cursor-not-allowed";

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
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[16px] text-[#3C3C43]"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[13px] text-[#FF3B30]">{error}</p>}
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
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Section 1: Required */}
      <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-[20px] font-semibold text-[#1D1D1F]">
          Required Information
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
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
      <div className="mt-6 rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-[20px] font-semibold text-[#1D1D1F]">
          Optional Information
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
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
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(
              isEdit ? `/employees/${props.employeeId}` : "/employees",
            )
          }
          className="h-[44px] w-full rounded-[8px] px-5 text-[17px] font-semibold text-[#007AFF] transition-colors duration-150 hover:bg-[#E5E5EA] sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-[44px] w-full items-center justify-center rounded-[8px] bg-[#007AFF] px-6 text-[17px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Employee"
          )}
        </button>
      </div>
    </form>
  );
}
