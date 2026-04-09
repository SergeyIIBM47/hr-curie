"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { CalendarMonthView } from "@/components/calendar/calendar-month-view";
import { ScheduleMeetingDialog } from "@/components/calendar/schedule-meeting-dialog";
import type { Meeting } from "@/components/calendar/meeting-card";

interface CalendarPageClientProps {
  initialMeetings: Meeting[];
  isAdmin: boolean;
}

export function CalendarPageClient({
  initialMeetings,
  isAdmin,
}: CalendarPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMeetingCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[28px] font-bold text-[#1D1D1F]">Calendar</h1>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#007AFF] px-5 text-[17px] font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] sm:w-auto"
          >
            <Plus className="size-5" aria-hidden="true" />
            Schedule Meeting
          </button>
        )}
      </div>

      <CalendarMonthView
        key={refreshKey}
        initialMeetings={initialMeetings}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <ScheduleMeetingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleMeetingCreated}
        />
      )}
    </div>
  );
}
