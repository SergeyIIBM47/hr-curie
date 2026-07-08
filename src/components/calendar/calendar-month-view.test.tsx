import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarMonthView } from "./calendar-month-view";
import type { Meeting } from "./meeting-card";

function meetingAt(date: Date, id = "m-1"): Meeting {
  return {
    id,
    title: "Design sync",
    type: "ONE_ON_ONE",
    scheduledAt: date.toISOString(),
    durationMinutes: 30,
    notes: null,
    createdBy: "u-1",
    participants: [],
  };
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockResolvedValue({
    json: () => Promise.resolve({ data: null }),
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CalendarMonthView", () => {
  const today = new Date();

  it("renders the current month with today marked and selected", () => {
    const { container } = render(
      <CalendarMonthView
        initialMeetings={[meetingAt(today)]}
        isAdmin={false}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: monthLabel(today.getFullYear(), today.getMonth()),
      }),
    ).toBeInTheDocument();

    const todayCell = container.querySelector("[data-curie-today]");
    expect(todayCell).not.toBeNull();
    expect(todayCell).toHaveAttribute("data-curie-selected");
    expect(todayCell).toHaveAttribute("data-curie-has-event");

    // Today's meeting appears in the detail panel
    expect(screen.getByText("Design sync")).toBeInTheDocument();
  });

  it("selects another day and shows its empty detail panel", async () => {
    const { container } = render(
      <CalendarMonthView initialMeetings={[meetingAt(today)]} isAdmin />,
    );
    // Pick a day that is not today: first day cell that isn't marked today
    const cells = Array.from(
      container.querySelectorAll("button[aria-pressed], button[data-curie-today], .grid button"),
    );
    const other = cells.find(
      (c) => !c.hasAttribute("data-curie-today") && c.getAttribute("aria-label"),
    )!;
    await userEvent.click(other);

    expect(other).toHaveAttribute("data-curie-selected");
    expect(screen.getByText("Nothing scheduled.")).toBeInTheDocument();
  });

  it("navigates months, rolls over years, and returns via Today", async () => {
    render(<CalendarMonthView initialMeetings={[]} isAdmin={false} />);
    const year = today.getFullYear();
    const month = today.getMonth();

    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    const nextLabel =
      month === 11 ? monthLabel(year + 1, 0) : monthLabel(year, month + 1);
    expect(screen.getByRole("heading", { name: nextLabel })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(
      screen.getByRole("heading", { name: monthLabel(year, month) }),
    ).toBeInTheDocument();

    // Walk backwards past January to cover the year rollover branch
    const prev = screen.getByRole("button", { name: "Previous month" });
    for (let i = 0; i <= month; i++) {
      await userEvent.click(prev);
    }
    expect(
      screen.getByRole("heading", { name: monthLabel(year - 1, 11) }),
    ).toBeInTheDocument();

    // Forward across December to cover the other rollover branch
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(
      screen.getByRole("heading", { name: monthLabel(year, 0) }),
    ).toBeInTheDocument();
  });

  it("replaces meetings from the events API when data arrives", async () => {
    const apiMeeting = meetingAt(today, "api-1");
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ data: [apiMeeting] }),
    });
    const { container } = render(
      <CalendarMonthView initialMeetings={[]} isAdmin={false} />,
    );
    await waitFor(() => {
      expect(
        container.querySelector("[data-curie-has-event]"),
      ).not.toBeNull();
    });
  });

  it("keeps existing meetings when the events API fails", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    render(
      <CalendarMonthView initialMeetings={[meetingAt(today)]} isAdmin={false} />,
    );
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    expect(screen.getByText("Design sync")).toBeInTheDocument();
  });
});
