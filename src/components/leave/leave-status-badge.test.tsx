import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaveStatusBadge } from "./leave-status-badge";

describe("LeaveStatusBadge", () => {
  it("renders PENDING badge as status-pending pill", () => {
    render(<LeaveStatusBadge status="PENDING" />);
    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge.getAttribute("data-curie")).toBe("pill");
    expect(badge.getAttribute("data-variant")).toBe("status-pending");
  });

  it("renders APPROVED badge as status-approved pill", () => {
    render(<LeaveStatusBadge status="APPROVED" />);
    const badge = screen.getByText("Approved");
    expect(badge).toBeInTheDocument();
    expect(badge.getAttribute("data-curie")).toBe("pill");
    expect(badge.getAttribute("data-variant")).toBe("status-approved");
  });

  it("renders REJECTED badge as status-rejected pill", () => {
    render(<LeaveStatusBadge status="REJECTED" />);
    const badge = screen.getByText("Rejected");
    expect(badge).toBeInTheDocument();
    expect(badge.getAttribute("data-curie")).toBe("pill");
    expect(badge.getAttribute("data-variant")).toBe("status-rejected");
  });

  it("uppercases the label", () => {
    render(<LeaveStatusBadge status="PENDING" />);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("uppercase");
  });
});
