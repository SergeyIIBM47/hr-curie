import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimeOffThisWeekCard } from "./time-off-this-week-card";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { leaveRequest: { findMany: vi.fn() } },
}));

const WEEK_START = new Date("2026-05-25T00:00:00.000Z");
const WEEK_END = new Date("2026-06-01T00:00:00.000Z");

describe("TimeOffThisWeekCard", () => {
  it("renders rows with status pills and totals requested days", async () => {
    render(
      await TimeOffThisWeekCard({
        weekStart: WEEK_START,
        weekEnd: WEEK_END,
        rows: [
          {
            id: "r-1",
            name: "Lina Okafor",
            position: "Design · Senior Designer",
            startDate: new Date("2026-05-26T00:00:00.000Z"),
            endDate: new Date("2026-05-28T00:00:00.000Z"),
            status: "APPROVED",
          },
          {
            id: "r-2",
            name: "Kai Nguyen",
            position: "—",
            startDate: new Date("2026-05-29T00:00:00.000Z"),
            endDate: new Date("2026-05-29T00:00:00.000Z"),
            status: "PENDING",
          },
        ],
      }),
    );
    // 3 days + 1 day requested
    expect(
      screen.getByText("May 25 — Jun 1 · 4 days requested"),
    ).toBeInTheDocument();
    expect(screen.getByText("Lina Okafor")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Awaiting approval")).toBeInTheDocument();
    expect(screen.getByText("May 26 → May 28")).toBeInTheDocument();
  });

  it("shows the empty state without requests", async () => {
    render(
      await TimeOffThisWeekCard({
        weekStart: WEEK_START,
        weekEnd: WEEK_END,
        rows: [],
      }),
    );
    expect(
      screen.getByText("No leave requests this week."),
    ).toBeInTheDocument();
  });

  it("fetches rows, joins position parts, and skips userless employees", async () => {
    vi.mocked(prisma.leaveRequest.findMany).mockResolvedValueOnce([
      {
        id: "db-1",
        startDate: new Date("2026-05-26T00:00:00.000Z"),
        endDate: new Date("2026-05-27T00:00:00.000Z"),
        status: "REJECTED",
        user: {
          employee: {
            firstName: "Lina",
            lastName: "Okafor",
            position: "Senior Designer",
            department: "Design",
          },
        },
      },
      {
        id: "db-2",
        startDate: new Date("2026-05-26T00:00:00.000Z"),
        endDate: new Date("2026-05-27T00:00:00.000Z"),
        status: "PENDING",
        user: { employee: null },
      },
      {
        id: "db-3",
        startDate: new Date("2026-05-28T00:00:00.000Z"),
        endDate: new Date("2026-05-28T00:00:00.000Z"),
        status: "PENDING",
        user: {
          employee: {
            firstName: "Kai",
            lastName: "Nguyen",
            position: null,
            department: null,
          },
        },
      },
      // prisma types are irrelevant to the mapping under test
    ] as never);

    render(
      await TimeOffThisWeekCard({ weekStart: WEEK_START, weekEnd: WEEK_END }),
    );
    expect(screen.getByText("Design · Senior Designer")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryAllByText("Lina Okafor")).toHaveLength(1);
  });
});
