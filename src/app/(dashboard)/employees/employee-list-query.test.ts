import { describe, expect, it } from "vitest";
import { buildEmployeeWhere } from "./employee-list-query";

describe("buildEmployeeWhere", () => {
  it("returns empty where for no filters", () => {
    expect(buildEmployeeWhere({})).toEqual({});
  });

  it("builds a text search across name, email, position, department", () => {
    const where = buildEmployeeWhere({ q: "sofia" });
    expect(where.OR).toEqual([
      { firstName: { contains: "sofia", mode: "insensitive" } },
      { lastName: { contains: "sofia", mode: "insensitive" } },
      { workEmail: { contains: "sofia", mode: "insensitive" } },
      { position: { contains: "sofia", mode: "insensitive" } },
      { department: { contains: "sofia", mode: "insensitive" } },
    ]);
  });

  it("trims the search query and ignores whitespace-only input", () => {
    expect(buildEmployeeWhere({ q: "  " })).toEqual({});
    const where = buildEmployeeWhere({ q: " ana " });
    expect(where.OR?.[0]).toEqual({
      firstName: { contains: "ana", mode: "insensitive" },
    });
  });

  it("filters by team as a case-insensitive department match", () => {
    expect(buildEmployeeWhere({ team: "engineering" })).toEqual({
      department: { equals: "engineering", mode: "insensitive" },
    });
  });

  it("filters view=onboarding to employees with an unfinished onboarding plan", () => {
    expect(buildEmployeeWhere({ view: "onboarding" })).toEqual({
      onboardingPlan: { is: { status: { not: "COMPLETE" } } },
    });
  });

  it("ignores unknown view values", () => {
    expect(buildEmployeeWhere({ view: "hiring" })).toEqual({});
  });

  it("combines search with a team filter", () => {
    const where = buildEmployeeWhere({ q: "kai", team: "engineering" });
    expect(where.department).toEqual({
      equals: "engineering",
      mode: "insensitive",
    });
    expect(where.OR).toHaveLength(5);
  });
});
