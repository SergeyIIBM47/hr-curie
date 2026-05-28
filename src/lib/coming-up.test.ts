import { describe, expect, it } from "vitest";
import {
  nextBirthdays,
  nextAnniversaries,
  type ComingUpEmployee,
} from "./coming-up";

function emp(
  id: string,
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  startDate: string | null = null,
): ComingUpEmployee {
  return {
    id,
    firstName,
    lastName,
    dateOfBirth: new Date(`${dateOfBirth}T00:00:00Z`),
    startDate: startDate ? new Date(`${startDate}T00:00:00Z`) : null,
  };
}

describe("nextBirthdays", () => {
  const today = new Date("2026-05-26T00:00:00Z");

  it("returns birthdays within the window", () => {
    const employees = [
      emp("1", "Aarav", "Mehta", "1990-05-28"),
      emp("2", "Far", "Future", "1990-07-15"),
    ];
    const out = nextBirthdays(employees, today, 14);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe("Aarav Mehta");
    expect(out[0].date.toISOString()).toBe("2026-05-28T00:00:00.000Z");
  });

  it("sorts by date ascending", () => {
    const employees = [
      emp("1", "Late", "One", "1990-06-05"),
      emp("2", "Early", "Two", "1990-05-27"),
    ];
    const out = nextBirthdays(employees, today, 14);
    expect(out.map((e) => e.name)).toEqual(["Early Two", "Late One"]);
  });

  it("handles year-boundary (Dec→Jan)", () => {
    const december = new Date("2026-12-28T00:00:00Z");
    const employees = [emp("1", "New", "Year", "1990-01-03")];
    const out = nextBirthdays(employees, december, 14);
    expect(out).toHaveLength(1);
    expect(out[0].date.toISOString()).toBe("2027-01-03T00:00:00.000Z");
  });

  it("maps Feb 29 to Mar 1 in non-leap years", () => {
    const t = new Date("2026-02-25T00:00:00Z");
    const employees = [emp("1", "Leap", "Baby", "1992-02-29")];
    const out = nextBirthdays(employees, t, 14);
    expect(out).toHaveLength(1);
    expect(out[0].date.toISOString()).toBe("2026-03-01T00:00:00.000Z");
  });

  it("keeps Feb 29 in leap years", () => {
    const t = new Date("2024-02-20T00:00:00Z");
    const employees = [emp("1", "Leap", "Baby", "1992-02-29")];
    const out = nextBirthdays(employees, t, 14);
    expect(out).toHaveLength(1);
    expect(out[0].date.toISOString()).toBe("2024-02-29T00:00:00.000Z");
  });
});

describe("nextAnniversaries", () => {
  const today = new Date("2026-05-26T00:00:00Z");

  it("returns anniversaries with year count", () => {
    const employees = [
      emp("1", "Lina", "Okafor", "1990-01-01", "2023-06-02"),
    ];
    const out = nextAnniversaries(employees, today, 14);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe("Lina Okafor");
    expect(out[0].years).toBe(3);
    expect(out[0].date.toISOString()).toBe("2026-06-02T00:00:00.000Z");
  });

  it("skips employees with no start date", () => {
    const employees = [emp("1", "No", "Start", "1990-01-01", null)];
    const out = nextAnniversaries(employees, today, 14);
    expect(out).toHaveLength(0);
  });

  it("skips zero-year anniversaries (same year as start)", () => {
    const t = new Date("2026-05-26T00:00:00Z");
    const employees = [emp("1", "New", "Hire", "1990-01-01", "2026-05-30")];
    const out = nextAnniversaries(employees, t, 14);
    expect(out).toHaveLength(0);
  });

  it("handles year-boundary anniversaries", () => {
    const december = new Date("2026-12-28T00:00:00Z");
    const employees = [emp("1", "Year", "Edge", "1990-01-01", "2020-01-05")];
    const out = nextAnniversaries(employees, december, 14);
    expect(out).toHaveLength(1);
    expect(out[0].years).toBe(7);
    expect(out[0].date.toISOString()).toBe("2027-01-05T00:00:00.000Z");
  });
});
