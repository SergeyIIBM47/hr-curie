import { describe, it, expect } from "vitest";
import { scheduleMeetingSchema } from "./meeting";

describe("scheduleMeetingSchema", () => {
  const validInput = {
    title: "Weekly 1:1",
    type: "ONE_ON_ONE" as const,
    scheduledAt: "2026-06-10T10:00:00Z",
    durationMinutes: 30,
    participantUserIds: ["user-001"],
  };

  it("passes with all required fields", () => {
    const result = scheduleMeetingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("passes with optional notes", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      notes: "Discuss Q3 goals",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe("Discuss Q3 goals");
    }
  });

  it("passes with empty string notes", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("defaults syncToGoogleCalendar to false", () => {
    const result = scheduleMeetingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.syncToGoogleCalendar).toBe(false);
    }
  });

  it("accepts syncToGoogleCalendar as true", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      syncToGoogleCalendar: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.syncToGoogleCalendar).toBe(true);
    }
  });

  it.each(["ONE_ON_ONE", "PERFORMANCE_REVIEW"] as const)(
    "passes for meeting type %s",
    (type) => {
      const result = scheduleMeetingSchema.safeParse({ ...validInput, type });
      expect(result.success).toBe(true);
    },
  );

  it("coerces string scheduledAt to Date", () => {
    const result = scheduleMeetingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheduledAt).toBeInstanceOf(Date);
    }
  });

  it("coerces string durationMinutes to number", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      durationMinutes: "60",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(60);
    }
  });

  it("passes with multiple participants", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      participantUserIds: ["user-001", "user-002", "user-003"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.participantUserIds).toHaveLength(3);
    }
  });

  it("strips extra fields", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      extra: "should-be-stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("extra" in result.data).toBe(false);
    }
  });

  // --- Failure cases ---

  it("fails when title is missing", () => {
    const { title: _, ...rest } = validInput;
    const result = scheduleMeetingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when title is empty string", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when type is invalid", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      type: "STANDUP",
    });
    expect(result.success).toBe(false);
  });

  it("fails when scheduledAt is missing", () => {
    const { scheduledAt: _, ...rest } = validInput;
    const result = scheduleMeetingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when scheduledAt is not a valid date", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      scheduledAt: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("fails when durationMinutes is below 15", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      durationMinutes: 10,
    });
    expect(result.success).toBe(false);
  });

  it("fails when durationMinutes is above 480", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      durationMinutes: 500,
    });
    expect(result.success).toBe(false);
  });

  it("fails when durationMinutes is not an integer", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      durationMinutes: 30.5,
    });
    expect(result.success).toBe(false);
  });

  it("fails when participantUserIds is empty array", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      participantUserIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes("participantUserIds"),
      );
      expect(issue?.message).toBe("Select at least one participant");
    }
  });

  it("fails when participantUserIds is missing", () => {
    const { participantUserIds: _, ...rest } = validInput;
    const result = scheduleMeetingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts boundary durationMinutes 15", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      durationMinutes: 15,
    });
    expect(result.success).toBe(true);
  });

  it("accepts boundary durationMinutes 480", () => {
    const result = scheduleMeetingSchema.safeParse({
      ...validInput,
      durationMinutes: 480,
    });
    expect(result.success).toBe(true);
  });
});
