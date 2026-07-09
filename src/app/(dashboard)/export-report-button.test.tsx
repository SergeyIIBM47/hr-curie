import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportReportButton } from "./export-report-button";

describe("ExportReportButton", () => {
  let capturedBlob: Blob | null;
  let capturedAnchor: { href: string; download: string } | null;

  beforeEach(() => {
    capturedBlob = null;
    capturedAnchor = null;
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn((blob: Blob) => {
        capturedBlob = blob;
        return "blob:mock-url";
      }),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      capturedAnchor = { href: this.href, download: this.download };
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders a secondary Export report button", () => {
    render(<ExportReportButton csv="Metric,Value" filename="overview-report-2026-07-09.csv" />);
    const btn = screen.getByRole("button", { name: "Export report" });
    expect(btn).toHaveAttribute("data-variant", "secondary");
  });

  it("downloads the CSV with the given filename on click", async () => {
    render(
      <ExportReportButton
        csv={"Metric,Value\nHeadcount,8"}
        filename="overview-report-2026-07-09.csv"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Export report" }));

    expect(capturedBlob).not.toBeNull();
    expect(capturedBlob!.type).toContain("text/csv");
    await expect(capturedBlob!.text()).resolves.toBe("Metric,Value\nHeadcount,8");

    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.href).toBe("blob:mock-url");
    expect(capturedAnchor!.download).toBe("overview-report-2026-07-09.csv");

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
