import { describe, expect, it } from "vitest";
import { buildOverviewCsv, overviewCsvFilename } from "./overview-report";

const baseInput = {
  headcount: { total: 8, deltaThisMonth: 8 },
  openRoles: { count: 7, deltaSinceLastWeek: 2 },
  onLeaveToday: { count: 0, total: 8 },
  pendingApprovals: { count: 1, total: 1 },
  timeOffThisWeek: [
    {
      name: "Maria Kovач",
      position: "Designer",
      startDate: new Date("2026-07-06T00:00:00.000Z"),
      endDate: new Date("2026-07-08T00:00:00.000Z"),
      status: "APPROVED",
    },
  ],
};

describe("buildOverviewCsv", () => {
  it("includes the four KPI metrics with values and details", () => {
    const csv = buildOverviewCsv(baseInput);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Metric,Value,Detail");
    expect(lines).toContain("Headcount,8,+8 this month");
    expect(lines).toContain("Open roles,7,+2 since last week");
    expect(lines).toContain("On leave today,0,of 8");
    expect(lines).toContain("Pending approvals,1,of 1");
  });

  it("uses flat labels when there is no delta", () => {
    const csv = buildOverviewCsv({
      ...baseInput,
      headcount: { total: 5, deltaThisMonth: 0 },
      openRoles: { count: 3, deltaSinceLastWeek: 0 },
    });
    expect(csv).toContain("Headcount,5,no change this month");
    expect(csv).toContain("Open roles,3,stable");
  });

  it("lists time off this week rows with ISO dates", () => {
    const csv = buildOverviewCsv(baseInput);
    const lines = csv.split("\n");
    expect(lines).toContain("Employee,Position,Start,End,Status");
    expect(lines).toContain("Maria Kovач,Designer,2026-07-06,2026-07-08,APPROVED");
  });

  it("omits the time off section when there are no rows", () => {
    const csv = buildOverviewCsv({ ...baseInput, timeOffThisWeek: [] });
    expect(csv).not.toContain("Employee,Position,Start,End,Status");
  });

  it("escapes fields containing commas and quotes", () => {
    const csv = buildOverviewCsv({
      ...baseInput,
      timeOffThisWeek: [
        {
          name: 'Smith, "Ace" John',
          position: "QA, Senior",
          startDate: new Date("2026-07-07T00:00:00.000Z"),
          endDate: new Date("2026-07-07T00:00:00.000Z"),
          status: "PENDING",
        },
      ],
    });
    expect(csv).toContain('"Smith, ""Ace"" John","QA, Senior",2026-07-07,2026-07-07,PENDING');
  });
});

describe("overviewCsvFilename", () => {
  it("stamps the UTC date into the filename", () => {
    expect(overviewCsvFilename(new Date("2026-07-09T04:00:00.000Z"))).toBe(
      "overview-report-2026-07-09.csv",
    );
  });
});
