import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "./kpi-card";
import { Pill } from "./pill";

describe("KpiCard", () => {
  it("renders label and value with the kpi-card data attribute", () => {
    const { container } = render(
      <KpiCard
        label="Headcount"
        value={128}
        footer={{ kind: "text", text: "steady" }}
      />,
    );
    expect(container.querySelector('[data-curie="kpi-card"]')).not.toBeNull();
    expect(screen.getByText("Headcount")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
  });

  it("renders the unit next to the value when provided", () => {
    render(
      <KpiCard
        label="Pending approvals"
        value={4}
        unit="/12"
        footer={{ kind: "text", text: "queue steady" }}
      />,
    );
    expect(screen.getByText("/12")).toBeInTheDocument();
  });

  it("renders a pill beside the label", () => {
    render(
      <KpiCard
        label="Open roles"
        value={7}
        pill={<Pill variant="count">priority</Pill>}
        footer={{ kind: "text", text: "stable" }}
      />,
    );
    expect(screen.getByText("priority")).toBeInTheDocument();
  });

  it("renders an up delta with success tone and an arrow icon", () => {
    render(
      <KpiCard
        label="Headcount"
        value={128}
        delta={{ dir: "up", label: "+3 this month" }}
        footer={{ kind: "text", text: "steady" }}
      />,
    );
    const delta = screen.getByText("+3 this month");
    expect(delta.className).toContain("text-[var(--color-curie-success)]");
    expect(delta.querySelector("svg")).not.toBeNull();
  });

  it("renders a flat delta with muted tone and no icon", () => {
    render(
      <KpiCard
        label="Headcount"
        value={128}
        delta={{ dir: "flat", label: "no change" }}
        footer={{ kind: "text", text: "steady" }}
      />,
    );
    const delta = screen.getByText("no change");
    expect(delta.className).toContain("text-[var(--color-curie-fg-muted)]");
    expect(delta.querySelector("svg")).toBeNull();
  });

  it("renders a sparkline footer", () => {
    const { container } = render(
      <KpiCard
        label="Headcount"
        value={128}
        footer={{ kind: "sparkline", points: [1, 2, 3, 4], tone: "neutral" }}
      />,
    );
    expect(container.querySelector("polyline")).not.toBeNull();
  });

  it("renders an avatar-stack footer with trailing text", () => {
    const { container } = render(
      <KpiCard
        label="On leave today"
        value={2}
        footer={{
          kind: "stack",
          avatars: [{ name: "Sofia Admin" }, { name: "Lina Okafor" }],
          trailing: "of 8",
        }}
      />,
    );
    const avatars = container.querySelectorAll('[data-curie="avatar"]');
    expect(avatars.length).toBe(2);
    expect(screen.getByText("of 8")).toBeInTheDocument();
  });
});
