export interface OverviewCsvInput {
  headcount: { total: number; deltaThisMonth: number };
  openRoles: { count: number; deltaSinceLastWeek: number };
  onLeaveToday: { count: number; total: number };
  pendingApprovals: { count: number; total: number };
  timeOffThisWeek: {
    name: string;
    position: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }[];
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function csvRow(fields: string[]): string {
  return fields.map(escapeCsvField).join(",");
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildOverviewCsv(data: OverviewCsvInput): string {
  const { headcount, openRoles, onLeaveToday, pendingApprovals, timeOffThisWeek } = data;

  const lines: string[] = [
    csvRow(["Metric", "Value", "Detail"]),
    csvRow([
      "Headcount",
      String(headcount.total),
      headcount.deltaThisMonth > 0
        ? `+${headcount.deltaThisMonth} this month`
        : "no change this month",
    ]),
    csvRow([
      "Open roles",
      String(openRoles.count),
      openRoles.deltaSinceLastWeek > 0
        ? `+${openRoles.deltaSinceLastWeek} since last week`
        : "stable",
    ]),
    csvRow(["On leave today", String(onLeaveToday.count), `of ${onLeaveToday.total}`]),
    csvRow([
      "Pending approvals",
      String(pendingApprovals.count),
      `of ${pendingApprovals.total}`,
    ]),
  ];

  if (timeOffThisWeek.length > 0) {
    lines.push("");
    lines.push(csvRow(["Employee", "Position", "Start", "End", "Status"]));
    for (const row of timeOffThisWeek) {
      lines.push(
        csvRow([
          row.name,
          row.position,
          isoDate(row.startDate),
          isoDate(row.endDate),
          row.status,
        ]),
      );
    }
  }

  return lines.join("\n");
}

export function overviewCsvFilename(today: Date): string {
  return `overview-report-${isoDate(today)}.csv`;
}
