"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Btn, IconBtn, IPlus, type IconProps } from "@/components/curie";
import { cn } from "@/lib/utils";

interface EmploymentType {
  id: string;
  name: string;
  employeeCount: number;
}

interface EmploymentTypeManagerProps {
  initialTypes: EmploymentType[];
}

function TrashIcon(props: IconProps) {
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
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function EmploymentTypeManager({
  initialTypes,
}: EmploymentTypeManagerProps) {
  const [types, setTypes] = useState<EmploymentType[]>(initialTypes);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setAdding(true);
    try {
      const res = await fetch("/api/employment-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Failed to add type");
        return;
      }

      const { data } = await res.json();
      setTypes((prev) =>
        [...prev, { id: data.id, name: data.name, employeeCount: 0 }].sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
      );
      setNewName("");
      toast.success(`"${data.name}" added`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(type: EmploymentType) {
    setDeletingId(type.id);
    try {
      const res = await fetch(`/api/employment-types?id=${type.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Failed to delete type");
        return;
      }

      setTypes((prev) => prev.filter((t) => t.id !== type.id));
      toast.success(`"${type.name}" deleted`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2
        className={cn(
          "font-[family-name:var(--font-curie-display)]",
          "text-[20px] font-medium tracking-[-0.01em]",
          "text-[var(--color-curie-fg)]",
        )}
      >
        Employment Types
      </h2>

      <ul className="flex flex-col gap-2">
        {types.length === 0 && (
          <li className="text-[15px] text-[var(--color-curie-fg-muted)]">
            No employment types yet.
          </li>
        )}
        {types.map((type) => {
          const hasEmployees = type.employeeCount > 0;
          const isDeleting = deletingId === type.id;

          return (
            <li
              key={type.id}
              className={cn(
                "flex items-center gap-3 p-4",
                "rounded-[var(--radius-curie-lg)]",
                "border border-[var(--color-curie-border)]",
                "bg-[var(--color-curie-surface)]",
                "shadow-[var(--shadow-curie-soft)]",
              )}
            >
              <span className="flex-1 truncate text-[14px] font-medium text-[var(--color-curie-fg)]">
                {type.name}
              </span>
              <span
                className={cn(
                  "font-[family-name:var(--font-curie-mono)]",
                  "text-[12px] text-[var(--color-curie-fg-muted)]",
                )}
              >
                {type.employeeCount}{" "}
                {type.employeeCount === 1 ? "employee" : "employees"}
              </span>
              <IconBtn
                icon={TrashIcon}
                label={
                  hasEmployees
                    ? `Cannot delete ${type.name} — ${type.employeeCount} employee${type.employeeCount > 1 ? "s" : ""} assigned`
                    : `Delete ${type.name}`
                }
                title={
                  hasEmployees
                    ? `Cannot delete — ${type.employeeCount} employee${type.employeeCount > 1 ? "s" : ""} assigned`
                    : `Delete "${type.name}"`
                }
                disabled={hasEmployees || isDeleting}
                onClick={() => handleDelete(type)}
                className={cn(
                  "text-[var(--color-curie-fg-muted)]",
                  "enabled:hover:text-[var(--color-curie-danger)]",
                )}
              />
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="New employment type..."
          aria-label="New employment type name"
          className={cn(
            "h-10 w-full px-3",
            "rounded-[var(--radius-curie-sm)]",
            "border border-[var(--color-curie-border)]",
            "bg-[var(--color-curie-surface)]",
            "text-[14px] text-[var(--color-curie-fg)]",
            "outline-none",
            "placeholder:text-[var(--color-curie-fg-muted)]",
            "focus:border-[var(--color-curie-brand)]",
            "focus:ring-2 focus:ring-[var(--color-curie-brand-soft)]",
            "sm:flex-1",
          )}
        />
        <Btn
          variant="primary"
          icon={IPlus}
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="w-full sm:w-auto"
        >
          {adding ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            "Add type"
          )}
        </Btn>
      </div>
    </section>
  );
}
