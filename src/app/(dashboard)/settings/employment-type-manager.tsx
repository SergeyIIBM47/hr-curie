"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EmploymentType {
  id: string;
  name: string;
  employeeCount: number;
}

interface EmploymentTypeManagerProps {
  initialTypes: EmploymentType[];
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
    <div className="rounded-[12px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <h2 className="mb-4 text-[20px] font-semibold text-[#1D1D1F]">
        Employment Types
      </h2>

      {/* Chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {types.length === 0 && (
          <p className="text-[15px] text-[#8E8E93]">
            No employment types yet.
          </p>
        )}
        {types.map((type) => {
          const hasEmployees = type.employeeCount > 0;
          const isDeleting = deletingId === type.id;

          return (
            <span
              key={type.id}
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#E5E5EA] py-1.5 pl-3 pr-2 text-[16px] text-[#1D1D1F]"
            >
              {type.name}
              {hasEmployees && (
                <span className="text-[12px] text-[#8E8E93]">
                  ({type.employeeCount})
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(type)}
                disabled={hasEmployees || isDeleting}
                aria-label={
                  hasEmployees
                    ? `Cannot delete ${type.name} — ${type.employeeCount} employee${type.employeeCount > 1 ? "s" : ""} assigned`
                    : `Delete ${type.name}`
                }
                title={
                  hasEmployees
                    ? `Cannot delete — ${type.employeeCount} employee${type.employeeCount > 1 ? "s" : ""} assigned`
                    : `Delete "${type.name}"`
                }
                className="ml-0.5 flex size-5 items-center justify-center rounded-full transition-colors duration-150 enabled:hover:bg-[#D1D1D6] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isDeleting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <X className="size-3.5" />
                )}
              </button>
            </span>
          );
        })}
      </div>

      {/* Add Type */}
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
          className="h-[44px] w-full rounded-[8px] bg-[rgba(120,120,128,0.12)] px-3 text-[17px] text-[#1D1D1F] outline-none placeholder:text-[rgba(60,60,67,0.3)] focus:ring-2 focus:ring-[#007AFF]/40 sm:flex-1"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="inline-flex h-[44px] w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#007AFF] px-4 text-[15px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:w-auto"
        >
          {adding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Plus className="size-4" />
              Add Type
            </>
          )}
        </button>
      </div>
    </div>
  );
}
