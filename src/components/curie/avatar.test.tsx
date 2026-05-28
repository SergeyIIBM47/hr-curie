import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";
import { getTintLetter } from "@/lib/name-hash";

describe("Avatar", () => {
  it("renders initials from name", () => {
    render(<Avatar name="Sofia Admin" />);
    expect(screen.getByText("SA")).toBeInTheDocument();
  });

  it("uses provided size", () => {
    render(<Avatar name="Lina Okafor" size="lg" />);
    const node = screen.getByRole("img", { name: "Lina Okafor" });
    expect(node).toHaveAttribute("data-size", "lg");
    expect(node).toHaveStyle({ width: "44px", height: "44px" });
  });

  it("hashes tint deterministically from the name", () => {
    const { rerender } = render(<Avatar name="Mei Tanaka" />);
    const first = screen.getByRole("img", { name: "Mei Tanaka" })
      .getAttribute("data-tint");
    rerender(<Avatar name="Mei Tanaka" />);
    const second = screen.getByRole("img", { name: "Mei Tanaka" })
      .getAttribute("data-tint");
    expect(first).toBe(second);
    expect(first).toBe(getTintLetter("Mei Tanaka"));
  });

  it("honors an explicit tint override", () => {
    render(<Avatar name="Sofia Admin" tint="f" />);
    expect(screen.getByRole("img", { name: "Sofia Admin" })).toHaveAttribute(
      "data-tint",
      "f",
    );
  });

  it("renders an image when imageSrc is provided", () => {
    const { container } = render(
      <Avatar name="Sofia Admin" imageSrc="/avatar.png" />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/avatar.png");
  });

  it("adds border classes when bordered=true", () => {
    render(<Avatar name="Sofia Admin" bordered />);
    const node = screen.getByRole("img", { name: "Sofia Admin" });
    expect(node.className).toMatch(/border-2/);
  });
});
