"use client";

import { useId, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { differenceInCalendarDays, addDays, isWeekend } from "date-fns";
import { createLeaveSchema } from "@/lib/validations/leave";
import { Btn } from "@/components/curie";
import { cn } from "@/lib/utils";

const leaveTypes = [
  { value: "SICK_LEAVE", label: "Sick Leave" },
  { value: "DAY_OFF", label: "Day Off" },
  { value: "VACATION", label: "Vacation" },
] as const;

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

const textareaClass = cn(
  "w-full px-3 py-2.5",
  "rounded-[var(--radius-curie-sm)]",
  "border border-[var(--color-curie-border)]",
  "bg-[var(--color-curie-surface)]",
  "text-[14px] text-[var(--color-curie-fg)]",
  "outline-none",
  "placeholder:text-[var(--color-curie-fg-muted)]",
  "focus:border-[var(--color-curie-brand)]",
  "focus:ring-2 focus:ring-[var(--color-curie-brand-soft)]",
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

export function countWorkingDays(start: Date, end: Date): number {
  if (end < start) return 0;
  const totalDays = differenceInCalendarDays(end, start) + 1;
  let working = 0;
  for (let i = 0; i < totalDays; i++) {
    if (!isWeekend(addDays(start, i))) {
      working++;
    }
  }
  return working;
}

interface LeaveFormValues {
  type: "SICK_LEAVE" | "DAY_OFF" | "VACATION";
  startDate: string;
  endDate: string;
  reason?: string;
}

export function LeaveRequestForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const formId = useId();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createLeaveSchema) as any,
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const workingDays = useMemo(() => {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    if (e < s) return null;
    return countWorkingDays(s, e);
  }, [startDate, endDate]);

  function fieldId(name: string) {
    return `${formId}-${name}`;
  }

  async function onSubmit(data: LeaveFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Failed to submit leave request");
        return;
      }

      toast.success("Leave request submitted");
      router.refresh();
      router.push("/leave");
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
      <div className={cardClass}>
        <h2 className={sectionHeading}>Leave Details</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Leave Type"
            htmlFor={fieldId("type")}
            error={errors.type?.message}
          >
            <select
              {...register("type")}
              id={fieldId("type")}
              className={inputClass}
              defaultValue=""
            >
              <option value="" disabled>
                Select leave type...
              </option>
              {leaveTypes.map((lt) => (
                <option key={lt.value} value={lt.value}>
                  {lt.label}
                </option>
              ))}
            </select>
          </FormField>

          <div />

          <FormField
            label="Start Date"
            htmlFor={fieldId("startDate")}
            error={errors.startDate?.message}
          >
            <input
              {...register("startDate")}
              id={fieldId("startDate")}
              type="date"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="End Date"
            htmlFor={fieldId("endDate")}
            error={errors.endDate?.message}
          >
            <input
              {...register("endDate")}
              id={fieldId("endDate")}
              type="date"
              className={inputClass}
            />
          </FormField>

          {workingDays !== null && (
            <div className="md:col-span-2">
              <p
                className="text-[14px] font-medium text-[var(--color-curie-brand)]"
                data-testid="working-days"
              >
                {workingDays} working day{workingDays !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div className="md:col-span-2">
            <FormField
              label="Reason (optional)"
              htmlFor={fieldId("reason")}
              error={errors.reason?.message}
            >
              <textarea
                {...register("reason")}
                id={fieldId("reason")}
                rows={3}
                placeholder="Provide a reason for your leave..."
                className={textareaClass}
              />
            </FormField>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Btn
          variant="secondary"
          type="button"
          onClick={() => router.push("/leave")}
        >
          Cancel
        </Btn>
        <Btn variant="primary" type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Submit Request"
          )}
        </Btn>
      </div>
    </form>
  );
}
