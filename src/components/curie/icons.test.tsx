import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import * as Icons from "./icons";

const ICON_NAMES = [
  "IHome",
  "IUser",
  "IUsers",
  "ILeave",
  "ICal",
  "ISettings",
  "IStar",
  "IBell",
  "ISearch",
  "IPlus",
  "IArrowUp",
  "IArrowDown",
  "IArrowRight",
  "IChevronLeft",
  "IChevronRight",
  "IClock",
  "IPin",
  "IMeeting",
  "IDoc",
  "ICake",
] as const;

describe("icons", () => {
  it("exports 20 named icons", () => {
    for (const name of ICON_NAMES) {
      expect(typeof (Icons as Record<string, unknown>)[name]).toBe("function");
    }
  });

  it.each(ICON_NAMES)("%s renders an svg with default attributes", (name) => {
    const Icon = (Icons as Record<string, React.ComponentType>)[name];
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg?.getAttribute("stroke")).toBe("currentColor");
    expect(svg?.getAttribute("fill")).toBe("none");
    expect(svg?.getAttribute("stroke-width")).toBe("1.5");
    expect(svg?.getAttribute("stroke-linecap")).toBe("round");
    expect(svg?.getAttribute("stroke-linejoin")).toBe("round");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("allows overriding size via props", () => {
    const { container } = render(<Icons.IHome width={24} height={24} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });
});
