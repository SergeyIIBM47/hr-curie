import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});
