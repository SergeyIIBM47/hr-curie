import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TodayScheduleList, type ScheduleItem } from "./today-schedule-list";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { meeting: { findMany: vi.fn() } },
}));

const DATE = new Date("2026-05-26T00:00:00.000Z");
const NOW = new Date("2026-05-26T09:35:00.000Z");

function item(overrides: Partial<ScheduleItem>): ScheduleItem {
  return {
    id: "m-1",
    title: "Design sync",
    scheduledAt: new Date("2026-05-26T11:00:00.000Z"),
    durationMinutes: 30,
    participants: [{ name: "Sofia Admin" }],
    badge: { kind: "Meet", label: "Meet" },
    ...overrides,
  };
}

describe("TodayScheduleList", () => {
  it("marks the in-progress meeting with Now and a marker", async () => {
    const { container } = render(
      await TodayScheduleList({
        date: DATE,
        now: NOW,
        items: [
          item({
            id: "current",
            scheduledAt: new Date("2026-05-26T09:30:00.000Z"),
            durationMinutes: 60,
          }),
          item({ id: "later", title: "Retro" }),
        ],
      }),
    );
    expect(screen.getByText("09:30 — 10:30 · Now")).toBeInTheDocument();
    expect(screen.getByText("11:00 — 11:30")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-curie-now]")).toHaveLength(1);
  });

  it("renders Room badges with their label", async () => {
    render(
      await TodayScheduleList({
        date: DATE,
        now: NOW,
        items: [item({ badge: { kind: "Room", label: "Room 4B" } })],
      }),
    );
    expect(screen.getByText("Room 4B")).toBeInTheDocument();
  });

  it("shows the empty state without meetings", async () => {
    render(await TodayScheduleList({ date: DATE, now: NOW, items: [] }));
    expect(screen.getByText("Nothing scheduled today.")).toBeInTheDocument();
  });

  it("fetches meetings, derives badges, and drops null participants", async () => {
    vi.mocked(prisma.meeting.findMany).mockResolvedValueOnce([
      {
        id: "db-1",
        title: "Final interview",
        scheduledAt: new Date("2026-05-26T13:00:00.000Z"),
        durationMinutes: 45,
        type: "INTERVIEW",
        notes: "Final round",
        participants: [
          { user: { employee: { firstName: "Sofia", lastName: "Admin" } } },
          { user: { employee: null } },
        ],
      },
      {
        id: "db-2",
        title: "Standup",
        scheduledAt: new Date("2026-05-26T15:00:00.000Z"),
        durationMinutes: 15,
        type: "TEAM",
        notes: null,
        participants: [],
      },
      // prisma types are irrelevant to the mapping under test
    ] as never);

    render(await TodayScheduleList({ date: DATE, now: NOW }));
    expect(screen.getByText("Final interview")).toBeInTheDocument();
    expect(screen.getByText("Final")).toBeInTheDocument();
    expect(screen.getByText("Meet")).toBeInTheDocument();
    expect(screen.getByText("13:00 — 13:45")).toBeInTheDocument();
  });
});
