import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkforceCompositionDonut } from "./workforce-composition-donut";

const COUNTS = [
  { label: "CY", count: 5, color: "#0B0F1A" },
  { label: "Contractor", count: 1, color: "#64748B" },
  { label: "GIG", count: 1, color: "#CBD5E1" },
  { label: "Intern", count: 1, color: "#2563EB" },
];

describe("WorkforceCompositionDonut", () => {
  it("renders one weighted slice per populated type plus the track", () => {
    const { container } = render(
      <WorkforceCompositionDonut counts={COUNTS} />,
    );
    const slices = container.querySelectorAll(
      "svg circle[stroke-dasharray]",
    );
    expect(slices).toHaveLength(4);
  });

  it("shows the total in the center and a legend row per type", () => {
    render(<WorkforceCompositionDonut counts={COUNTS} />);
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Total people")).toBeInTheDocument();
    for (const c of COUNTS) {
      expect(screen.getByText(c.label)).toBeInTheDocument();
    }
    expect(screen.getByRole("img", { name: /8 people total/ })).toBeInTheDocument();
  });

  it("skips slices for zero-count types but keeps their legend rows", () => {
    const { container } = render(
      <WorkforceCompositionDonut
        counts={[
          { label: "CY", count: 3, color: "#0B0F1A" },
          { label: "Intern", count: 0, color: "#2563EB" },
        ]}
      />,
    );
    expect(
      container.querySelectorAll("svg circle[stroke-dasharray]"),
    ).toHaveLength(1);
    expect(screen.getByText("Intern")).toBeInTheDocument();
  });
});
