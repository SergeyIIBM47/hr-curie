import { z } from "zod";

const optionalString = z
  .string()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

/** For update schemas: empty string becomes null (to clear the DB column) */
const nullableString = z
  .string()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const nullableUrl = z
  .string()
  .transform((v) => {
    if (v === "") return null;
    return v;
  })
  .nullable()
  .optional()
  .pipe(
    z
      .string()
      .url("Must be a valid URL")
      .refine(
        (v) => v.startsWith("https://") || v.startsWith("http://"),
        "URL must use http or https",
      )
      .nullable()
      .optional(),
  );

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  workEmail: z.string().email("Valid email required"),
  password: z.string().min(8, "Minimum 8 characters"),
  employmentTypeId: z.string().min(1, "Employment type is required"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)),
      "Invalid date (expected YYYY-MM-DD)",
    ),
  actualResidence: z.string().min(1, "Actual residence is required"),
  startYear: z
    .number({ error: "Start year is required" })
    .int("Must be a whole number")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 1, "Invalid year"),
  phone: optionalString,
  position: optionalString,
  department: optionalString,
  location: optionalString,
  healthInsurance: optionalString,
  education: optionalString,
  certifications: optionalString,
  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (v) => v.startsWith("https://") || v.startsWith("http://"),
      "URL must use http or https",
    )
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v))
    .optional(),
  tshirtSize: optionalString,
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  employmentTypeId: z.string().min(1, "Employment type is required").optional(),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)),
      "Invalid date (expected YYYY-MM-DD)",
    )
    .optional(),
  actualResidence: z.string().min(1, "Actual residence is required").optional(),
  startYear: z
    .number({ error: "Start year is required" })
    .int("Must be a whole number")
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 1, "Invalid year")
    .optional(),
  phone: nullableString,
  position: nullableString,
  department: nullableString,
  location: nullableString,
  healthInsurance: nullableString,
  education: nullableString,
  certifications: nullableString,
  linkedinUrl: nullableUrl,
  tshirtSize: nullableString,
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
