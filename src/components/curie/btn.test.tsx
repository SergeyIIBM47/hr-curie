import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Btn } from "./btn";
import { IPlus } from "./icons";

describe("Btn", () => {
  it("defaults to primary md", () => {
    render(<Btn>Save</Btn>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveAttribute("data-size", "md");
    expect(btn).toHaveAttribute("type", "button");
  });

  it("applies the secondary variant", () => {
    render(<Btn variant="secondary">Cancel</Btn>);
    const btn = screen.getByRole("button", { name: "Cancel" });
    expect(btn).toHaveAttribute("data-variant", "secondary");
    expect(btn.className).toMatch(/border/);
  });

  it("applies sm size styles", () => {
    render(<Btn size="sm">Small</Btn>);
    const btn = screen.getByRole("button", { name: "Small" });
    expect(btn).toHaveAttribute("data-size", "sm");
    expect(btn.className).toMatch(/h-8/);
  });

  it("renders the optional leading icon", () => {
    const { container } = render(<Btn icon={IPlus}>New</Btn>);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("fires onClick when clicked", async () => {
    const handler = vi.fn();
    render(<Btn onClick={handler}>Go</Btn>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Btn disabled>Off</Btn>);
    expect(screen.getByRole("button", { name: "Off" })).toBeDisabled();
  });
});
