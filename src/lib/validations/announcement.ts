import { z } from "zod";

export const announcementTagSchema = z.enum(["POLICY", "TEAM", "HR", "EVENT"]);

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  body: z.string().min(1, "Body is required"),
  tag: announcementTagSchema,
});

export type AnnouncementTagInput = z.infer<typeof announcementTagSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
