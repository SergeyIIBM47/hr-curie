import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "./sparkline";

describe("Sparkline", () => {
  it("renders a polyline for two or more points", () => {
    const { container } = render(<Sparkline points={[1, 4, 2, 6, 3]} />);
    const polyline = container.querySelector("polyline");
    expect(polyline).not.toBeNull();
    expect(polyline?.getAttribute("points")?.split(" ").length).toBe(5);
  });

  it("renders no polyline when fewer than two points are provided", () => {
    const { container } = render(<Sparkline points={[]} />);
    expect(container.querySelector("polyline")).toBeNull();
    expect(container.querySelector("polygon")).toBeNull();
  });

  it("renders a brand-area gradient with a unique id per instance", () => {
    const { container } = render(
      <>
        <Sparkline points={[1, 2, 3]} tone="brand" area />
        <Sparkline points={[3, 2, 1]} tone="brand" area />
      </>,
    );
    const gradients = container.querySelectorAll("linearGradient");
    expect(gradients.length).toBe(2);
    const ids = Array.from(gradients).map((g) => g.getAttribute("id"));
    expect(new Set(ids).size).toBe(2);
  });

  it("does not render area when tone is neutral", () => {
    const { container } = render(
      <Sparkline points={[1, 2, 3]} tone="neutral" area />,
    );
    expect(container.querySelector("linearGradient")).toBeNull();
    expect(container.querySelector("polygon")).toBeNull();
  });

  it("uses brand color for brand tone polyline stroke", () => {
    const { container } = render(<Sparkline points={[1, 2, 3]} tone="brand" />);
    const stroke = container.querySelector("polyline")?.getAttribute("stroke");
    expect(stroke).toBe("var(--color-curie-brand)");
  });

  it("uses muted color for neutral tone polyline stroke", () => {
    const { container } = render(<Sparkline points={[1, 2, 3]} />);
    const stroke = container.querySelector("polyline")?.getAttribute("stroke");
    expect(stroke).toBe("var(--color-curie-fg-muted)");
  });
});
