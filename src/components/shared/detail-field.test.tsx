import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DetailField } from "./detail-field";

describe("DetailField", () => {
  it("renders label and value", () => {
    render(<DetailField label="Department" value="Engineering" />);

    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("shows dash for undefined value", () => {
    render(<DetailField label="Phone" value={undefined} />);

    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows dash for null value", () => {
    render(<DetailField label="Phone" value={null} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows dash for empty string value", () => {
    render(<DetailField label="Phone" value="" />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders value as a link when href is provided", () => {
    render(
      <DetailField
        label="LinkedIn"
        value="View Profile"
        href="https://linkedin.com/in/test"
      />,
    );

    const link = screen.getByRole("link", { name: "View Profile" });
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/test");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("handles long text without breaking", () => {
    const longValue =
      "This is a very long value that should still render correctly without breaking the layout";
    render(<DetailField label="Notes" value={longValue} />);

    expect(screen.getByText(longValue)).toBeInTheDocument();
  });
});
