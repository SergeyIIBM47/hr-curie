import { requireAuth } from "@/lib/auth-guard";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";

export default async function LeaveRequestPage() {
  await requireAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#1D1D1F]">
          Request Leave
        </h1>
        <p className="text-[15px] text-[#8E8E93]">
          Submit a new leave request for approval
        </p>
      </div>

      <LeaveRequestForm />
    </div>
  );
}
