import { describe, expect, it } from "vitest";
import { createAnnouncementSchema } from "./announcement";
import {
  createJobRequisitionSchema,
  updateJobRequisitionSchema,
} from "./job-requisition";
import {
  createOnboardingPlanSchema,
  updateOnboardingStepSchema,
} from "./onboarding";

describe("createAnnouncementSchema", () => {
  it("accepts a valid announcement", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "Policy update",
      body: "Remote Tuesdays return.",
      tag: "POLICY",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title and an unknown tag", () => {
    expect(
      createAnnouncementSchema.safeParse({ title: "", body: "x", tag: "HR" })
        .success,
    ).toBe(false);
    expect(
      createAnnouncementSchema.safeParse({ title: "t", body: "x", tag: "NEWS" })
        .success,
    ).toBe(false);
  });
});

describe("job requisition schemas", () => {
  it("accepts a minimal create payload and applies optional fields", () => {
    expect(
      createJobRequisitionSchema.safeParse({
        title: "Data Analyst",
        department: "Analytics",
      }).success,
    ).toBe(true);
    expect(
      createJobRequisitionSchema.safeParse({
        title: "Data Analyst",
        department: "Analytics",
        location: "Remote (EU)",
        status: "OPEN",
        priority: true,
      }).success,
    ).toBe(true);
  });

  it("rejects a create payload without a department", () => {
    expect(
      createJobRequisitionSchema.safeParse({ title: "Data Analyst" }).success,
    ).toBe(false);
  });

  it("accepts partial updates including nullable fills", () => {
    expect(
      updateJobRequisitionSchema.safeParse({
        status: "FILLED",
        filledById: null,
        filledAt: "2026-05-26T09:35:00.000Z",
      }).success,
    ).toBe(true);
    expect(
      updateJobRequisitionSchema.safeParse({ filledAt: "not-a-date" }).success,
    ).toBe(false);
  });
});

describe("onboarding schemas", () => {
  const validPlan = {
    employeeId: "emp-1",
    startDate: "2026-05-23",
    steps: [{ ord: 1, label: "Offer signed" }],
  };

  it("accepts a valid plan", () => {
    expect(createOnboardingPlanSchema.safeParse(validPlan).success).toBe(true);
  });

  it("rejects malformed start dates and empty step lists", () => {
    expect(
      createOnboardingPlanSchema.safeParse({
        ...validPlan,
        startDate: "23/05/2026",
      }).success,
    ).toBe(false);
    expect(
      createOnboardingPlanSchema.safeParse({ ...validPlan, steps: [] }).success,
    ).toBe(false);
  });

  it("validates step status updates", () => {
    expect(
      updateOnboardingStepSchema.safeParse({
        status: "DONE",
        completedAt: "2026-05-26T09:35:00.000Z",
      }).success,
    ).toBe(true);
    expect(
      updateOnboardingStepSchema.safeParse({ status: "SKIPPED" }).success,
    ).toBe(false);
  });
});
