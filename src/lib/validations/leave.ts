import { z } from "zod";

export const createLeaveSchema = z
  .object({
    type: z.enum(["SICK_LEAVE", "DAY_OFF", "VACATION"]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
