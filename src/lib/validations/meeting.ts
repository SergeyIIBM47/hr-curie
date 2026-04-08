import { z } from "zod";

export const scheduleMeetingSchema = z.object({
  title: z.string().min(1, "Required"),
  type: z.enum(["ONE_ON_ONE", "PERFORMANCE_REVIEW"]),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  participantUserIds: z
    .array(z.string())
    .min(1, "Select at least one participant"),
  notes: z.string().optional().or(z.literal("")),
  syncToGoogleCalendar: z.boolean().default(false),
});

export type ScheduleMeetingInput = z.infer<typeof scheduleMeetingSchema>;
