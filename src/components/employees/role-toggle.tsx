"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoleToggleProps {
  employeeId: string;
  currentRole: "ADMIN" | "EMPLOYEE";
  isSelf: boolean;
}

export function RoleToggle({
  employeeId,
  currentRole,
  isSelf,
}: RoleToggleProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === "ADMIN";
  const pendingRole = isAdmin ? "EMPLOYEE" : "ADMIN";

  function handleToggleClick(_checked: boolean) {
    if (isSelf) {
      toast.error("Cannot change your own role");
      return;
    }
    setConfirmOpen(true);
  }

  async function confirmRoleChange() {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: pendingRole }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Failed to update role");
        return;
      }

      setRole(pendingRole);
      toast.success(`Role updated to ${pendingRole.toLowerCase()}`);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Switch
          checked={isAdmin}
          onCheckedChange={handleToggleClick}
          disabled={loading}
        />
        <span className="text-[15px] font-medium text-[#1D1D1F]">
          Admin Access
        </span>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to {isAdmin ? "remove" : "grant"} admin
              access? This will change the user&apos;s role to{" "}
              <strong>{pendingRole.toLowerCase()}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
              className="h-[36px] rounded-[8px] px-4 text-[15px] font-semibold text-[#007AFF] transition-colors hover:bg-[#E5E5EA]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRoleChange}
              disabled={loading}
              className="h-[36px] rounded-[8px] bg-[#007AFF] px-4 text-[15px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Updating..." : "Confirm"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
