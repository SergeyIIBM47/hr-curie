"use client";

import { useState, useCallback } from "react";
import { CalendarMonthView } from "@/components/calendar/calendar-month-view";
import { ScheduleMeetingDialog } from "@/components/calendar/schedule-meeting-dialog";
import { Btn, IPlus } from "@/components/curie";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1
          className={cn(
            "font-[family-name:var(--font-curie-display)]",
            "text-[28px] font-medium leading-tight tracking-[-0.015em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          Calendar
        </h1>
        {isAdmin && (
          <Btn
            variant="primary"
            icon={IPlus}
            onClick={() => setDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            Schedule meeting
          </Btn>
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
