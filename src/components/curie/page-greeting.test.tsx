import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageGreeting } from "./page-greeting";

describe("PageGreeting", () => {
  it("renders the weekday overline and the greeting with the name", () => {
    const { container } = render(
      <PageGreeting
        name="Sofia"
        date={new Date("2026-05-26T09:35:00.000Z")}
      />,
    );
    expect(
      container.querySelector('[data-curie="page-greeting"]'),
    ).not.toBeNull();
    expect(screen.getByText("Tue · May 26")).toBeInTheDocument();
    expect(screen.getByText(/Good morning,/)).toBeInTheDocument();
    expect(screen.getByText("Sofia")).toBeInTheDocument();
  });
});
