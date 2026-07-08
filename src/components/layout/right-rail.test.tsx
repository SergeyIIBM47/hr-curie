import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { RightRail } from "./right-rail";
import { AppShell } from "./app-shell";

describe("RightRail", () => {
  it("renders the sticky variant as a complementary landmark", () => {
    const { container } = render(
      <RightRail variant="sticky">rail content</RightRail>,
    );
    const aside = container.querySelector('aside[data-rail="sticky"]');
    expect(aside).not.toBeNull();
    expect(aside).toHaveTextContent("rail content");
  });

  it("renders the stacked variant", () => {
    const { container } = render(
      <RightRail variant="stacked">rail content</RightRail>,
    );
    expect(container.querySelector('aside[data-rail="stacked"]')).not.toBeNull();
  });

  it("renders nothing without children", () => {
    const { container } = render(<RightRail variant="sticky" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("AppShell", () => {
  it("composes sidebar, topbar, main content, and both rail variants", () => {
    const { container } = render(
      <AppShell
        sidebar={<div data-testid="sidebar" />}
        topbar={<div data-testid="topbar" />}
        rail={<div>rail</div>}
      >
        <div>content</div>
      </AppShell>,
    );
    expect(container.querySelector('[data-shell="app"]')).not.toBeNull();
    expect(container.querySelector("#main-content")).toHaveTextContent(
      "content",
    );
    expect(container.querySelector('aside[data-rail="stacked"]')).not.toBeNull();
    expect(container.querySelector('aside[data-rail="sticky"]')).not.toBeNull();
  });
});
