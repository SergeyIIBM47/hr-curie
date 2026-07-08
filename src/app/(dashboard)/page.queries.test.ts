import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "next-auth";
import {
  getDateWindow,
  fetchAdminOverview,
  fetchEmployeeOverview,
  fetchAdminRailData,
  fetchEmployeeRailData,
} from "./page.queries";
import { prisma } from "@/lib/prisma";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    employmentType: { findMany: vi.fn() },
    leaveRequest: { findMany: vi.fn(), count: vi.fn() },
    jobRequisition: { findMany: vi.fn(), count: vi.fn() },
    onboardingPlan: { findFirst: vi.fn() },
    announcement: { findMany: vi.fn() },
    meeting: { findMany: vi.fn() },
  },
}));

// Frozen "today": Tuesday 2026-05-26 (the visual-parity reference date)
const TODAY = new Date("2026-05-26T09:35:00.000Z");

const SESSION = {
  user: { id: "user-1", role: "ADMIN", name: "Sofia" },
} as unknown as Session;

type WhereArgs = { where?: Record<string, unknown>; select?: Record<string, unknown> };

function utc(iso: string): Date {
  return new Date(iso);
}

describe("getDateWindow", () => {
  it("computes Monday-based week and month boundaries for a Tuesday", () => {
    const w = getDateWindow(TODAY);
    expect(w.todayStart.toISOString()).toBe("2026-05-26T00:00:00.000Z");
    expect(w.todayEnd.toISOString()).toBe("2026-05-27T00:00:00.000Z");
    expect(w.weekStart.toISOString()).toBe("2026-05-25T00:00:00.000Z");
    expect(w.weekEnd.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(w.monthStart.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(w.monthEnd.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(w.sevenDaysAgo.toISOString()).toBe("2026-05-19T00:00:00.000Z");
    expect(w.eightWeeksAgo.toISOString()).toBe("2026-03-31T00:00:00.000Z");
  });

  it("treats Sunday as the last day of the week", () => {
    const w = getDateWindow(utc("2026-05-31T12:00:00.000Z"));
    expect(w.weekStart.toISOString()).toBe("2026-05-25T00:00:00.000Z");
    expect(w.weekEnd.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("starts the week on the same day for a Monday", () => {
    const w = getDateWindow(utc("2026-05-25T00:30:00.000Z"));
    expect(w.weekStart.toISOString()).toBe("2026-05-25T00:00:00.000Z");
  });

  it("rolls the month end across a year boundary", () => {
    const w = getDateWindow(utc("2026-12-15T00:00:00.000Z"));
    expect(w.monthEnd.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});

function primeAdminOverviewMocks(): void {
  // employee.findMany serves three shapes: headcount (createdAt only),
  // coming-up (dateOfBirth/startDate), and rail data (same as coming-up)
  vi.mocked(prisma.employee.findMany).mockImplementation(((args: WhereArgs) => {
    if (args?.select && "createdAt" in args.select) {
      return Promise.resolve([
        { createdAt: utc("2026-03-01T00:00:00.000Z") },
        { createdAt: utc("2026-05-10T00:00:00.000Z") },
        { createdAt: utc("2026-05-23T00:00:00.000Z") },
      ]);
    }
    return Promise.resolve([
      {
        id: "emp-lina",
        firstName: "Lina",
        lastName: "Okafor",
        dateOfBirth: utc("1992-06-01T00:00:00.000Z"),
        startDate: utc("2023-06-02T00:00:00.000Z"),
      },
    ]);
  }) as never);

  vi.mocked(prisma.employee.findFirst).mockResolvedValue({
    firstName: "Sofia",
  } as never);
  vi.mocked(prisma.employee.count).mockResolvedValue(8 as never);

  vi.mocked(prisma.employee.groupBy).mockResolvedValue([
    { employmentTypeId: "t-cy", _count: { _all: 5 } },
    { employmentTypeId: "t-intern", _count: { _all: 1 } },
    { employmentTypeId: "t-unknown", _count: { _all: 2 } },
  ] as never);
  vi.mocked(prisma.employmentType.findMany).mockResolvedValue([
    { id: "t-cy", name: "CY" },
    { id: "t-intern", name: "Intern" },
  ] as never);

  vi.mocked(prisma.jobRequisition.findMany).mockResolvedValue([
    { openedAt: utc("2026-05-20T00:00:00.000Z"), priority: true },
    { openedAt: utc("2026-05-21T00:00:00.000Z"), priority: false },
  ] as never);
  vi.mocked(prisma.jobRequisition.count).mockResolvedValue(1 as never);

  vi.mocked(prisma.leaveRequest.count).mockImplementation(((args: WhereArgs) => {
    const where = args?.where ?? {};
    if (where.status === "PENDING") return Promise.resolve(4);
    if (where.reviewedAt) return Promise.resolve(2);
    return Promise.resolve(9); // createdAt >= monthStart
  }) as never);

  vi.mocked(prisma.leaveRequest.findMany).mockImplementation(((args: WhereArgs & {
    orderBy?: Record<string, unknown>;
    take?: number;
  }) => {
    const where = args?.where ?? {};
    if (where.status === "APPROVED") {
      // On leave today
      return Promise.resolve([
        {
          user: { employee: { firstName: "Lina", lastName: "Okafor" } },
        },
        { user: { employee: null } },
      ]);
    }
    if (args?.take === 5) {
      // Time off this week
      return Promise.resolve([
        {
          id: "lr-1",
          startDate: utc("2026-05-27T00:00:00.000Z"),
          endDate: utc("2026-05-28T00:00:00.000Z"),
          status: "APPROVED",
          user: {
            employee: {
              firstName: "Lina",
              lastName: "Okafor",
              position: "Senior Designer",
              department: "Design",
            },
          },
        },
      ]);
    }
    if (args?.select && "startDate" in args.select) {
      // Month events: a 2-day leave inside May
      return Promise.resolve([
        {
          startDate: utc("2026-05-27T00:00:00.000Z"),
          endDate: utc("2026-05-28T00:00:00.000Z"),
        },
      ]);
    }
    // Pending-approvals history (7-day sparkline)
    return Promise.resolve([
      {
        createdAt: utc("2026-05-25T10:00:00.000Z"),
        status: "PENDING",
        reviewedAt: null,
      },
    ]);
  }) as never);

  vi.mocked(prisma.onboardingPlan.findFirst).mockResolvedValue({
    startDate: utc("2026-05-23T00:00:00.000Z"),
    status: "ON_TRACK",
    employee: { firstName: "Kai", lastName: "Nguyen", position: "Engineer" },
    steps: [
      {
        ord: 1,
        label: "Offer signed",
        status: "DONE",
        completedAt: utc("2026-05-16T00:00:00.000Z"),
      },
      { ord: 2, label: "Equipment", status: "CURRENT", completedAt: null },
      { ord: 3, label: "Review", status: "UPCOMING", completedAt: null },
    ],
  } as never);

  vi.mocked(prisma.announcement.findMany).mockResolvedValue([
    {
      id: "a-1",
      tag: "POLICY",
      createdAt: utc("2026-05-26T08:00:00.000Z"),
      title: "Remote work",
      body: "Tuesdays return",
      author: { employee: { firstName: "Sofia", lastName: "Admin" } },
    },
    {
      id: "a-2",
      tag: "TEAM",
      createdAt: utc("2026-05-25T08:00:00.000Z"),
      title: "Welcome Kai",
      body: "Say hi",
      author: { employee: null },
    },
  ] as never);

  vi.mocked(prisma.meeting.findMany).mockImplementation(((args: WhereArgs) => {
    if (args?.select && "scheduledAt" in args.select) {
      // Month events
      return Promise.resolve([
        { scheduledAt: utc("2026-05-26T13:00:00.000Z") },
      ]);
    }
    // Today's schedule
    return Promise.resolve([
      {
        id: "m-1",
        title: "Final interview",
        scheduledAt: utc("2026-05-26T13:00:00.000Z"),
        durationMinutes: 45,
        type: "INTERVIEW",
        notes: "Room 4B",
        participants: [
          { user: { employee: { firstName: "Sofia", lastName: "Admin" } } },
          { user: { employee: null } },
        ],
      },
      {
        id: "m-2",
        title: "Final round",
        scheduledAt: utc("2026-05-26T15:00:00.000Z"),
        durationMinutes: 30,
        type: "INTERVIEW",
        notes: "final decision",
        participants: [],
      },
      {
        id: "m-3",
        title: "Standup",
        scheduledAt: utc("2026-05-26T16:00:00.000Z"),
        durationMinutes: 15,
        type: "TEAM",
        notes: null,
        participants: [],
      },
    ]);
  }) as never);
}

describe("fetchAdminOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    primeAdminOverviewMocks();
  });

  it("aggregates headcount, open roles, and pending approvals", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);

    expect(data.firstName).toBe("Sofia");
    expect(data.headcount.total).toBe(3);
    expect(data.headcount.deltaThisMonth).toBe(2);
    expect(data.headcount.sparkline).toHaveLength(8);
    // Final bucket includes every employee
    expect(data.headcount.sparkline[7]).toBe(3);

    expect(data.openRoles.count).toBe(2);
    expect(data.openRoles.priority).toBe(true);
    expect(data.openRoles.deltaSinceLastWeek).toBe(1);

    expect(data.pendingApprovals.count).toBe(4);
    expect(data.pendingApprovals.total).toBe(9);
    expect(data.pendingApprovals.clearedToday).toBe(2);
    expect(data.pendingApprovals.sparkline).toHaveLength(7);
    // One request created on May 25 → 7th-day bucket (index 6)
    expect(data.pendingApprovals.sparkline[6]).toBe(1);
  });

  it("maps workforce groups to labels sorted by count with palette colors", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.workforce).toEqual([
      { label: "CY", count: 5, color: "#0B0F1A" },
      { label: "Unknown", count: 2, color: "#64748B" },
      { label: "Intern", count: 1, color: "#CBD5E1" },
    ]);
  });

  it("collects on-leave avatars, skipping employee-less users", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.onLeaveToday.count).toBe(2);
    expect(data.onLeaveToday.total).toBe(8);
    expect(data.onLeaveToday.avatars).toEqual([{ name: "Lina Okafor" }]);
  });

  it("builds time off rows with joined position labels", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.timeOffThisWeek).toHaveLength(1);
    expect(data.timeOffThisWeek[0].name).toBe("Lina Okafor");
    expect(data.timeOffThisWeek[0].position).toBe("Design · Senior Designer");
  });

  it("maps the active onboarding plan with step meta", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.onboarding?.employeeName).toBe("Kai Nguyen");
    expect(data.onboarding?.steps.map((s) => s.meta)).toEqual([
      "May 16",
      "In progress",
      undefined,
    ]);
  });

  it("maps notices with an Anonymous fallback author", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.notices.map((n) => n.author)).toEqual([
      "Sofia Admin",
      "Anonymous",
    ]);
  });

  it("derives schedule badges from meeting notes", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.todaySchedule.map((m) => m.badge.kind)).toEqual([
      "Room",
      "Final",
      "Meet",
    ]);
    expect(data.todaySchedule[0].badge.label).toBe("Room 4B");
    expect(data.todaySchedule[0].participants).toEqual([
      { name: "Sofia Admin" },
    ]);
  });

  it("merges meeting days and expanded leave spans into month events", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.monthEvents.map((d) => d.toISOString())).toEqual([
      "2026-05-26T00:00:00.000Z",
      "2026-05-27T00:00:00.000Z",
      "2026-05-28T00:00:00.000Z",
    ]);
  });

  it("returns coming-up birthdays and anniversaries in the 14-day window", async () => {
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.comingUp.birthdays.map((b) => b.name)).toEqual([
      "Lina Okafor",
    ]);
    expect(data.comingUp.anniversaries[0]).toMatchObject({
      name: "Lina Okafor",
      years: 3,
    });
  });

  it("handles a missing onboarding plan", async () => {
    vi.mocked(prisma.onboardingPlan.findFirst).mockResolvedValue(null as never);
    const data = await fetchAdminOverview(SESSION, TODAY);
    expect(data.onboarding).toBeNull();
  });
});

describe("fetchEmployeeOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    primeAdminOverviewMocks();
    vi.mocked(prisma.leaveRequest.findMany).mockImplementation(((args: {
      take?: number;
      select?: Record<string, unknown>;
    }) => {
      if (args?.take === 5) {
        return Promise.resolve([
          {
            id: "lr-9",
            type: "VACATION",
            status: "PENDING",
            startDate: utc("2026-06-01T00:00:00.000Z"),
            endDate: utc("2026-06-05T00:00:00.000Z"),
            reason: null,
          },
        ]);
      }
      return Promise.resolve([]);
    }) as never);
  });

  it("returns the employee's own leave and schedule", async () => {
    const data = await fetchEmployeeOverview(SESSION, TODAY);
    expect(data.firstName).toBe("Sofia");
    expect(data.myLeave).toHaveLength(1);
    expect(data.myLeave[0].type).toBe("VACATION");
    expect(data.myMeetings).toHaveLength(3);
    expect(data.myTodaySchedule).toHaveLength(3);
    expect(data.myMonthEvents.length).toBeGreaterThan(0);
  });
});

describe("rail data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    primeAdminOverviewMocks();
  });

  it("fetchAdminRailData returns month events, schedule, and employees", async () => {
    const data = await fetchAdminRailData(TODAY);
    expect(data.monthEvents.length).toBeGreaterThan(0);
    expect(data.todaySchedule).toHaveLength(3);
    expect(data.comingUpEmployees[0].firstName).toBe("Lina");
  });

  it("fetchEmployeeRailData scopes queries to the session user", async () => {
    const data = await fetchEmployeeRailData(SESSION, TODAY);
    expect(data.todaySchedule).toHaveLength(3);
    const call = vi.mocked(prisma.meeting.findMany).mock.calls.find(
      (c) => (c[0] as WhereArgs)?.where?.participants != null,
    );
    expect(call).toBeDefined();
  });
});
