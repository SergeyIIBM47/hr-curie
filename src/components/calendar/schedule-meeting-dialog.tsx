"use client";

import { useId, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, Btn, IconBtn } from "@/components/curie";
import { cn } from "@/lib/utils";
import {
  scheduleMeetingSchema,
  type ScheduleMeetingInput,
} from "@/lib/validations/meeting";

const meetingTypes = [
  { value: "ONE_ON_ONE", label: "One-on-One" },
  { value: "PERFORMANCE_REVIEW", label: "Performance Review" },
] as const;

const durations = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
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

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  user: { id: string };
}

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

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
        className={cn(
          "mb-1.5 block",
          "text-[12px] font-medium",
          "text-[var(--color-curie-fg-secondary)]",
        )}
      >
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

function CloseIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

function ParticipantChip({
  employee,
  onRemove,
}: {
  employee: Employee;
  onRemove: () => void;
}) {
  const name = `${employee.firstName} ${employee.lastName}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "h-7 pl-1 pr-2",
        "rounded-[var(--radius-curie-pill)]",
        "bg-[var(--color-curie-brand-wash)]",
        "text-[12px] font-medium",
        "text-[var(--color-curie-brand-ink)]",
      )}
    >
      <Avatar
        name={name}
        size="xs"
        imageSrc={employee.avatarUrl ?? undefined}
      />
      <span>{name}</span>
      <IconBtn
        icon={CloseIcon}
        label={`Remove ${name}`}
        onClick={onRemove}
        className={cn(
          "h-5 w-5",
          "text-[var(--color-curie-brand-ink)]",
          "hover:bg-[var(--color-curie-brand-soft)]",
        )}
      />
    </span>
  );
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  onSuccess,
}: ScheduleMeetingDialogProps) {
  const formId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScheduleMeetingInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(scheduleMeetingSchema) as any,
    defaultValues: {
      durationMinutes: 30,
      syncToGoogleCalendar: false,
      participantUserIds: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    fetch("/api/employees")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setEmployees(json.data);
        }
      })
      .catch(() => {
        /* employees will remain empty */
      });
  }, [open]);

  useEffect(() => {
    setValue(
      "participantUserIds",
      selectedEmployees.map((e) => e.user.id),
    );
  }, [selectedEmployees, setValue]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
      setSelectedEmployees([]);
      setParticipantSearch("");
      setDropdownOpen(false);
    }
    onOpenChange(next);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIds = new Set(selectedEmployees.map((e) => e.id));
  const filteredEmployees = employees.filter((emp) => {
    if (selectedIds.has(emp.id)) return false;
    if (!participantSearch.trim()) return true;
    const q = participantSearch.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q)
    );
  });

  function toggleEmployee(emp: Employee) {
    setSelectedEmployees((prev) => [...prev, emp]);
    setParticipantSearch("");
    setDropdownOpen(false);
  }

  function removeEmployee(empId: string) {
    setSelectedEmployees((prev) => prev.filter((e) => e.id !== empId));
  }

  function fieldId(name: string) {
    return `${formId}-${name}`;
  }

  async function onSubmit(data: ScheduleMeetingInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/calendar/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Failed to schedule meeting");
        return;
      }

      toast.success("Meeting scheduled");
      handleOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto",
          "rounded-t-[var(--radius-curie-lg)] sm:rounded-[var(--radius-curie-lg)]",
          "bg-[var(--color-curie-surface)]",
          "shadow-[var(--shadow-curie-lifted)]",
          "sm:max-w-[480px]",
        )}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-center",
              "font-[family-name:var(--font-curie-display)]",
              "text-[20px] font-medium tracking-[-0.01em]",
              "text-[var(--color-curie-fg)]",
            )}
          >
            Schedule Meeting
          </DialogTitle>
        </DialogHeader>

        <form
          id={`${formId}-form`}
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <FormField
            label="Title"
            htmlFor={fieldId("title")}
            error={errors.title?.message}
          >
            <input
              {...register("title")}
              id={fieldId("title")}
              placeholder="Meeting title..."
              className={inputClass}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="Type"
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
                  Select type...
                </option>
                {meetingTypes.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Duration"
              htmlFor={fieldId("durationMinutes")}
              error={errors.durationMinutes?.message}
            >
              <select
                {...register("durationMinutes", { valueAsNumber: true })}
                id={fieldId("durationMinutes")}
                className={inputClass}
              >
                {durations.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField
            label="Date & Time"
            htmlFor={fieldId("scheduledAt")}
            error={errors.scheduledAt?.message}
          >
            <input
              {...register("scheduledAt")}
              id={fieldId("scheduledAt")}
              type="datetime-local"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Participants"
            htmlFor={fieldId("participants")}
            error={errors.participantUserIds?.message}
          >
            <div ref={dropdownRef} className="relative">
              {selectedEmployees.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {selectedEmployees.map((emp) => (
                    <ParticipantChip
                      key={emp.id}
                      employee={emp}
                      onRemove={() => removeEmployee(emp.id)}
                    />
                  ))}
                </div>
              )}

              <input
                id={fieldId("participants")}
                type="text"
                placeholder="Search employees..."
                value={participantSearch}
                onChange={(e) => {
                  setParticipantSearch(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                className={inputClass}
                autoComplete="off"
              />

              {dropdownOpen && filteredEmployees.length > 0 && (
                <div
                  className={cn(
                    "absolute top-full left-0 z-50 mt-1 w-full",
                    "max-h-[200px] overflow-y-auto",
                    "rounded-[var(--radius-curie-md)]",
                    "bg-[var(--color-curie-surface)]",
                    "shadow-[var(--shadow-curie-lifted)]",
                    "ring-1 ring-[var(--color-curie-border)]",
                  )}
                >
                  {filteredEmployees.map((emp) => {
                    const name = `${emp.firstName} ${emp.lastName}`;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => toggleEmployee(emp)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2.5 text-left",
                          "transition-colors",
                          "hover:bg-[var(--color-curie-surface-sunken)]",
                        )}
                      >
                        <Avatar
                          name={name}
                          size="sm"
                          imageSrc={emp.avatarUrl ?? undefined}
                        />
                        <span className="text-[14px] text-[var(--color-curie-fg)]">
                          {name}
                        </span>
                        {selectedIds.has(emp.id) && (
                          <CheckIcon className="ml-auto text-[var(--color-curie-brand)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </FormField>

          <FormField
            label="Notes (optional)"
            htmlFor={fieldId("notes")}
            error={errors.notes?.message}
          >
            <textarea
              {...register("notes")}
              id={fieldId("notes")}
              rows={3}
              placeholder="Add meeting notes..."
              className={cn(
                "w-full px-3 py-2.5",
                "rounded-[var(--radius-curie-sm)]",
                "border border-[var(--color-curie-border)]",
                "bg-[var(--color-curie-surface)]",
                "text-[14px] text-[var(--color-curie-fg)]",
                "outline-none",
                "placeholder:text-[var(--color-curie-fg-muted)]",
                "focus:border-[var(--color-curie-brand)]",
                "focus:ring-2 focus:ring-[var(--color-curie-brand-soft)]",
              )}
            />
          </FormField>
        </form>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          <Btn
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Btn>
          <Btn
            variant="primary"
            type="submit"
            form={`${formId}-form`}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              "Schedule"
            )}
          </Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
