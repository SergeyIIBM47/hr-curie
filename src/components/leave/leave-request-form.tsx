"use client";

import { useId, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { differenceInCalendarDays, addDays, isWeekend } from "date-fns";
import { createLeaveSchema } from "@/lib/validations/leave";

const leaveTypes = [
  { value: "SICK_LEAVE", label: "🤒 Sick Leave" },
  { value: "DAY_OFF", label: "🏠 Day Off" },
  { value: "VACATION", label: "🏖️ Vacation" },
] as const;

const inputClass =
  "h-[44px] w-full rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 text-[17px] text-[#1D1D1F] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40";

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-[10px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-[20px] font-semibold text-[#1D1D1F]">
          Leave Details
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
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
              <p className="text-[15px] font-medium text-[#007AFF]" data-testid="working-days">
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
                className="w-full rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 py-2.5 text-[17px] text-[#1D1D1F] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40"
              />
            </FormField>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/leave")}
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
          ) : (
            "Submit Request"
          )}
        </button>
      </div>
    </form>
  );
}
