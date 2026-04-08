import { describe, it, expect } from "vitest";
import { createLeaveSchema } from "./leave";

describe("createLeaveSchema", () => {
  const validInput = {
    type: "SICK_LEAVE" as const,
    startDate: "2026-05-01",
    endDate: "2026-05-03",
  };

  it("passes with all required fields and valid dates", () => {
    const result = createLeaveSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("passes when reason is provided", () => {
    const result = createLeaveSchema.safeParse({ ...validInput, reason: "Flu" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe("Flu");
    }
  });

  it("passes when reason is omitted", () => {
    const result = createLeaveSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBeUndefined();
    }
  });

  it("passes when startDate equals endDate (single-day leave)", () => {
    const result = createLeaveSchema.safeParse({
      ...validInput,
      startDate: "2026-05-01",
      endDate: "2026-05-01",
    });
    expect(result.success).toBe(true);
  });

  it.each(["SICK_LEAVE", "DAY_OFF", "VACATION"] as const)(
    "passes for leave type %s",
    (type) => {
      const result = createLeaveSchema.safeParse({ ...validInput, type });
      expect(result.success).toBe(true);
    },
  );

  it("coerces ISO string dates to Date objects", () => {
    const result = createLeaveSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date);
      expect(result.data.endDate).toBeInstanceOf(Date);
    }
  });

  it("strips extra fields", () => {
    const result = createLeaveSchema.safeParse({
      ...validInput,
      extra: "should-be-stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("extra" in result.data).toBe(false);
    }
  });

  it("fails when type is missing", () => {
    const { type: _, ...rest } = validInput;
    const result = createLeaveSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when type is invalid enum value", () => {
    const result = createLeaveSchema.safeParse({ ...validInput, type: "HOLIDAY" });
    expect(result.success).toBe(false);
  });

  it("fails when startDate is missing", () => {
    const { startDate: _, ...rest } = validInput;
    const result = createLeaveSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when endDate is missing", () => {
    const { endDate: _, ...rest } = validInput;
    const result = createLeaveSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when endDate is before startDate", () => {
    const result = createLeaveSchema.safeParse({
      ...validInput,
      startDate: "2026-05-05",
      endDate: "2026-05-01",
    });
    expect(result.success).toBe(false);
  });

  it("refine error targets the endDate path", () => {
    const result = createLeaveSchema.safeParse({
      ...validInput,
      startDate: "2026-05-05",
      endDate: "2026-05-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endDateError = result.error.issues.find(
        (i) => i.path.includes("endDate"),
      );
      expect(endDateError).toBeDefined();
      expect(endDateError!.message).toBe("End date must be on or after start date");
    }
  });

  it("fails with non-date string for startDate", () => {
    const result = createLeaveSchema.safeParse({
      ...validInput,
      startDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });
});
