import { requireAuth } from "@/lib/auth-guard";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { cn } from "@/lib/utils";

export default async function LeaveRequestPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[28px] font-medium leading-tight tracking-[-0.015em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          Request Leave
        </h1>
        <p className="text-[15px] text-[var(--color-curie-fg-secondary)]">
          Submit a new leave request for approval
        </p>
      </div>

      <LeaveRequestForm />
    </div>
  );
}
