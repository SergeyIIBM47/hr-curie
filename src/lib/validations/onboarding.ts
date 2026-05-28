import { z } from "zod";

export const onboardingStatusSchema = z.enum([
  "ON_TRACK",
  "AT_RISK",
  "BLOCKED",
  "COMPLETE",
]);

export const stepStatusSchema = z.enum(["DONE", "CURRENT", "UPCOMING"]);

const dateString = z
  .string()
  .min(1, "Start date is required")
  .refine(
    (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)),
    "Invalid date (expected YYYY-MM-DD)",
  );

export const onboardingStepSchema = z.object({
  ord: z.number().int().min(1, "Order must be >= 1"),
  label: z.string().min(1, "Step label is required"),
  status: stepStatusSchema.optional(),
});

export const createOnboardingPlanSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  startDate: dateString,
  status: onboardingStatusSchema.optional(),
  notes: z.string().optional(),
  steps: z.array(onboardingStepSchema).min(1, "At least one step is required"),
});

export const updateOnboardingStepSchema = z.object({
  status: stepStatusSchema,
  completedAt: z.string().datetime().optional().nullable(),
});

export type CreateOnboardingPlanInput = z.infer<typeof createOnboardingPlanSchema>;
export type UpdateOnboardingStepInput = z.infer<typeof updateOnboardingStepSchema>;
