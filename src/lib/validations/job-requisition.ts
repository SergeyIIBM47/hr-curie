import { z } from "zod";

export const jobStatusSchema = z.enum(["OPEN", "PAUSED", "FILLED"]);

export const createJobRequisitionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().optional(),
  status: jobStatusSchema.optional(),
  priority: z.boolean().optional(),
});

export const updateJobRequisitionSchema = z.object({
  title: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  location: z.string().nullable().optional(),
  status: jobStatusSchema.optional(),
  priority: z.boolean().optional(),
  filledById: z.string().nullable().optional(),
  filledAt: z.string().datetime().nullable().optional(),
});

export type CreateJobRequisitionInput = z.infer<typeof createJobRequisitionSchema>;
export type UpdateJobRequisitionInput = z.infer<typeof updateJobRequisitionSchema>;
