import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvatarStack } from "./avatar-stack";

const names = ["Sofia Admin", "Lina Okafor", "Mei Tanaka", "Daniel Reyes"];

describe("AvatarStack", () => {
  it("renders all avatars when count is within max", () => {
    render(<AvatarStack names={names} max={4} />);
    for (const n of names) {
      expect(screen.getByRole("img", { name: n })).toBeInTheDocument();
    }
    expect(screen.queryByLabelText(/more/)).not.toBeInTheDocument();
  });

  it("renders +N chip when names exceed max", () => {
    render(
      <AvatarStack
        names={[...names, "Aoife Walsh", "Theo Bennett"]}
        max={3}
      />,
    );
    const chip = screen.getByLabelText("3 more");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent("+3");
  });

  it("omits chip when remaining is 0", () => {
    render(<AvatarStack names={names} max={names.length} />);
    expect(screen.queryByLabelText(/more/)).not.toBeInTheDocument();
  });

  it("handles an empty list without throwing", () => {
    const { container } = render(<AvatarStack names={[]} />);
    expect(container.querySelector('[data-curie="avatar-stack"]')).toBeInTheDocument();
  });
});
