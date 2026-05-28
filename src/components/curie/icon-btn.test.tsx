import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconBtn } from "./icon-btn";
import { IBell } from "./icons";

describe("IconBtn", () => {
  it("sets aria-label from the label prop", () => {
    render(<IconBtn icon={IBell} label="Notifications" />);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("does not render the dot indicator by default", () => {
    const { container } = render(<IconBtn icon={IBell} label="Notifications" />);
    expect(container.querySelector('[data-curie="icon-btn-dot"]')).toBeNull();
  });

  it("renders the dot indicator when dot=true", () => {
    const { container } = render(<IconBtn icon={IBell} label="Notifications" dot />);
    expect(container.querySelector('[data-curie="icon-btn-dot"]')).not.toBeNull();
  });

  it("fires onClick when clicked", async () => {
    const handler = vi.fn();
    render(<IconBtn icon={IBell} label="Notifications" onClick={handler} />);
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders the provided icon component", () => {
    const { container } = render(<IconBtn icon={IBell} label="Notifications" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
