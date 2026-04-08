import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaveStatusBadge } from "./leave-status-badge";

describe("LeaveStatusBadge", () => {
  it("renders PENDING badge with orange styling", () => {
    render(<LeaveStatusBadge status="PENDING" />);
    const badge = screen.getByText("Pending");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-[#FF9500]");
    expect(badge.className).toContain("bg-[#FF9500]/15");
  });

  it("renders APPROVED badge with green styling", () => {
    render(<LeaveStatusBadge status="APPROVED" />);
    const badge = screen.getByText("Approved");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-[#34C759]");
    expect(badge.className).toContain("bg-[#34C759]/15");
  });

  it("renders REJECTED badge with red styling", () => {
    render(<LeaveStatusBadge status="REJECTED" />);
    const badge = screen.getByText("Rejected");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-[#FF3B30]");
    expect(badge.className).toContain("bg-[#FF3B30]/15");
  });

  it("applies common badge styles", () => {
    render(<LeaveStatusBadge status="PENDING" />);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("rounded-[6px]");
    expect(badge.className).toContain("px-2.5");
    expect(badge.className).toContain("py-0.5");
    expect(badge.className).toContain("text-[12px]");
    expect(badge.className).toContain("font-semibold");
    expect(badge.className).toContain("uppercase");
  });
});
