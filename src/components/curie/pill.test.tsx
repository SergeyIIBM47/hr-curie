import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pill, type PillVariant } from "./pill";

const VARIANTS: PillVariant[] = [
  "role",
  "tag",
  "count",
  "status-pending",
  "status-approved",
  "status-rejected",
  "status-info",
];

describe("Pill", () => {
  it.each(VARIANTS)("renders variant %s with matching data attribute", (variant) => {
    render(<Pill variant={variant}>{variant}</Pill>);
    const node = screen.getByText(variant);
    expect(node).toHaveAttribute("data-variant", variant);
  });

  it("renders count variant with mono font class", () => {
    render(<Pill variant="count">7</Pill>);
    const node = screen.getByText("7");
    expect(node.className).toMatch(/font-\[family-name:var\(--font-curie-mono\)\]/);
  });

  it("renders role variant with border class", () => {
    render(<Pill variant="role">Admin</Pill>);
    expect(screen.getByText("Admin").className).toMatch(/border/);
  });

  it("merges extra className", () => {
    render(
      <Pill variant="tag" className="custom-tag">
        ux
      </Pill>,
    );
    expect(screen.getByText("ux").className).toMatch(/custom-tag/);
  });
});
