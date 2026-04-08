"use client";

import { useId, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const inputClass =
  "h-[44px] w-full rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 text-[17px] text-[#1D1D1F] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40";

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
        className="mb-1.5 block text-[15px] font-medium text-[#3C3C43]"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[13px] text-[#FF3B30]">{error}</p>}
    </div>
  );
}

function ParticipantChip({
  employee,
  onRemove,
}: {
  employee: Employee;
  onRemove: () => void;
}) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007AFF]/10 py-1 pl-1 pr-2 text-[13px] text-[#007AFF]">
      {employee.avatarUrl ? (
        <img
          src={employee.avatarUrl}
          alt=""
          className="size-5 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-5 items-center justify-center rounded-full bg-[#007AFF]/20 text-[10px] font-medium">
          {initials}
        </span>
      )}
      <span className="font-medium">
        {employee.firstName} {employee.lastName}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 flex size-4 items-center justify-center rounded-full transition-colors hover:bg-[#007AFF]/20"
      >
        <X className="size-3" />
      </button>
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
    if (!open) {
      reset();
      setSelectedEmployees([]);
      setParticipantSearch("");
      setDropdownOpen(false);
    }
  }, [open, reset]);

  useEffect(() => {
    setValue(
      "participantUserIds",
      selectedEmployees.map((e) => e.user.id),
    );
  }, [selectedEmployees, setValue]);

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
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[480px] rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-center text-[20px] font-semibold text-[#1D1D1F]">
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

          <div className="grid grid-cols-2 gap-3">
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
                <div className="absolute top-full left-0 z-50 mt-1 max-h-[200px] w-full overflow-y-auto rounded-[10px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => toggleEmployee(emp)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#F2F2F7]"
                    >
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt=""
                          className="size-7 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-7 items-center justify-center rounded-full bg-[#E5E5EA] text-[12px] font-medium text-[#3C3C43]">
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </span>
                      )}
                      <span className="text-[15px] text-[#1D1D1F]">
                        {emp.firstName} {emp.lastName}
                      </span>
                      {selectedIds.has(emp.id) && (
                        <Check className="ml-auto size-4 text-[#007AFF]" />
                      )}
                    </button>
                  ))}
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
              className="w-full rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 py-2.5 text-[17px] text-[#1D1D1F] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40"
            />
          </FormField>
        </form>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-[38px] rounded-[8px] px-4 text-[15px] font-semibold text-[#007AFF] transition-colors hover:bg-[#E5E5EA]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={`${formId}-form`}
            disabled={submitting}
            className="inline-flex h-[38px] items-center justify-center rounded-[8px] bg-[#007AFF] px-5 text-[15px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Schedule"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
