import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingCard, type Meeting } from "./meeting-card";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function localTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

// A meeting far in the past so isNow is always false.
const START = new Date(2026, 0, 5, 9, 0);
const END = new Date(START.getTime() + 30 * 60_000);

function participant(id: string, first: string | null): Meeting["participants"][number] {
  return {
    user: {
      id,
      email: `${id}@company.com`,
      employee: first
        ? { firstName: first, lastName: "Person", avatarUrl: null }
        : null,
    },
  };
}

function meeting(overrides: Partial<Meeting>): Meeting {
  return {
    id: "m-1",
    title: "Design sync",
    type: "ONE_ON_ONE",
    scheduledAt: START.toISOString(),
    durationMinutes: 30,
    notes: null,
    createdBy: "u-1",
    participants: [],
    ...overrides,
  };
}

describe("MeetingCard", () => {
  it("renders the time range, title, and mapped type label", () => {
    render(<MeetingCard meeting={meeting({})} />);
    expect(
      screen.getByText(`${localTime(START)} — ${localTime(END)}`),
    ).toBeInTheDocument();
    expect(screen.getByText("Design sync")).toBeInTheDocument();
    expect(screen.getByText("One-on-One")).toBeInTheDocument();
  });

  it("falls back to the raw type when unmapped and is not collapsible", () => {
    render(<MeetingCard meeting={meeting({ type: "TEAM_SYNC" })} />);
    expect(screen.getByText("TEAM_SYNC")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-expanded");
  });

  it("expands to show notes and the participant list", async () => {
    render(
      <MeetingCard
        meeting={meeting({
          notes: "Bring the roadmap",
          participants: [participant("u-2", "Lina"), participant("u-3", null)],
        })}
      />,
    );
    const toggle = screen.getByRole("button", { name: /Design sync/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Bring the roadmap")).toBeInTheDocument();
    expect(screen.getByText("Lina Person")).toBeInTheDocument();
    // Employee-less participants fall back to their email
    expect(screen.getByText("u-3@company.com")).toBeInTheDocument();
  });

  it("collapses avatars past three into a +N badge", () => {
    render(
      <MeetingCard
        meeting={meeting({
          participants: [
            participant("u-1", "A"),
            participant("u-2", "B"),
            participant("u-3", "C"),
            participant("u-4", "D"),
            participant("u-5", "E"),
          ],
        })}
      />,
    );
    expect(screen.getByLabelText("2 more")).toHaveTextContent("+2");
  });
});
