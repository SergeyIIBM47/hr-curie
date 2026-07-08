import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MiniCalendar } from "./mini-calendar";

const MAY_2026 = new Date(Date.UTC(2026, 4, 1));
const TODAY = new Date(Date.UTC(2026, 4, 26));

describe("MiniCalendar", () => {
  it("renders the month label with the mini-calendar data attribute", () => {
    const { container } = render(
      <MiniCalendar events={[]} initialMonth={MAY_2026} />,
    );
    expect(
      container.querySelector('[data-curie="mini-calendar"]'),
    ).not.toBeNull();
    expect(screen.getByText("May 2026")).toBeInTheDocument();
  });

  it("marks exactly one cell as today", () => {
    const { container } = render(
      <MiniCalendar events={[]} initialMonth={MAY_2026} today={TODAY} />,
    );
    const todayCells = container.querySelectorAll("[data-curie-today]");
    expect(todayCells.length).toBe(1);
    expect(todayCells[0].textContent).toContain("26");
  });

  it("marks event days with data-curie-has-event", () => {
    const { container } = render(
      <MiniCalendar
        events={[new Date(Date.UTC(2026, 4, 12)), new Date(Date.UTC(2026, 4, 20))]}
        initialMonth={MAY_2026}
      />,
    );
    const eventCells = container.querySelectorAll("[data-curie-has-event]");
    expect(eventCells.length).toBe(2);
  });

  it("renders in-month days as buttons with accessible labels", () => {
    render(<MiniCalendar events={[]} initialMonth={MAY_2026} />);
    expect(screen.getByRole("button", { name: "May 26" })).toBeInTheDocument();
  });

  it("hides out-of-month filler cells from the accessibility tree", () => {
    const { container } = render(
      <MiniCalendar events={[]} initialMonth={MAY_2026} />,
    );
    // May 2026 starts on a Friday: 4 leading + 42-cell grid → filler exists
    const fillers = container.querySelectorAll('[aria-hidden="true"].relative');
    expect(fillers.length).toBeGreaterThan(0);
    for (const filler of fillers) {
      expect(filler.tagName).toBe("DIV");
    }
  });

  it("marks the selected day with aria-pressed", () => {
    render(
      <MiniCalendar
        events={[]}
        initialMonth={MAY_2026}
        selected={new Date(Date.UTC(2026, 4, 12))}
      />,
    );
    const selected = screen.getByRole("button", { name: "May 12" });
    expect(selected).toHaveAttribute("aria-pressed", "true");
  });

  it("navigates to the next and previous month", async () => {
    render(<MiniCalendar events={[]} initialMonth={MAY_2026} />);
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("June 2026")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Previous month" }),
    );
    expect(screen.getByText("May 2026")).toBeInTheDocument();
  });
});
