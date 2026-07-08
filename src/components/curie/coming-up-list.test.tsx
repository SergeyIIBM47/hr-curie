import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComingUpList } from "./coming-up-list";
import type { ComingUpEmployee } from "@/lib/coming-up";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { employee: { findMany: vi.fn() } },
}));

const TODAY = new Date("2026-05-26T00:00:00.000Z");

function employee(overrides: Partial<ComingUpEmployee>): ComingUpEmployee {
  return {
    id: "e-1",
    firstName: "Lina",
    lastName: "Okafor",
    dateOfBirth: new Date("1992-01-15T00:00:00.000Z"),
    startDate: new Date("2023-01-15T00:00:00.000Z"),
    ...overrides,
  };
}

describe("ComingUpList", () => {
  it("lists upcoming birthdays and anniversaries sorted by date", async () => {
    render(
      await ComingUpList({
        today: TODAY,
        employees: [
          employee({
            id: "bday",
            firstName: "Kai",
            lastName: "Nguyen",
            dateOfBirth: new Date("1996-06-04T00:00:00.000Z"),
            startDate: null,
          }),
          employee({
            id: "anniv",
            dateOfBirth: new Date("1992-01-15T00:00:00.000Z"),
            startDate: new Date("2023-05-30T00:00:00.000Z"),
          }),
        ],
      }),
    );
    expect(screen.getByText("Kai Nguyen · Birthday")).toBeInTheDocument();
    expect(screen.getByText("Lina Okafor · 3 years")).toBeInTheDocument();
    expect(screen.getByText("Thursday, June 4")).toBeInTheDocument();
    expect(screen.getByText("Saturday, May 30")).toBeInTheDocument();
  });

  it("uses the singular label for a first anniversary", async () => {
    render(
      await ComingUpList({
        today: TODAY,
        employees: [
          employee({
            startDate: new Date("2025-05-30T00:00:00.000Z"),
            dateOfBirth: new Date("1992-01-15T00:00:00.000Z"),
          }),
        ],
      }),
    );
    expect(screen.getByText("Lina Okafor · 1 year")).toBeInTheDocument();
  });

  it("shows the empty state when nothing falls in the window", async () => {
    render(await ComingUpList({ today: TODAY, employees: [] }));
    expect(
      screen.getByText("Nothing in the next 14 days."),
    ).toBeInTheDocument();
  });

  it("fetches employees via prisma when none are injected", async () => {
    vi.mocked(prisma.employee.findMany).mockResolvedValueOnce([
      {
        id: "db-1",
        firstName: "Emma",
        lastName: "Fischer",
        dateOfBirth: new Date("1994-06-01T00:00:00.000Z"),
        startDate: null,
      },
      // prisma types are irrelevant to the mapping under test
    ] as never);

    render(await ComingUpList({ today: TODAY }));
    expect(screen.getByText("Emma Fischer · Birthday")).toBeInTheDocument();
  });
});
