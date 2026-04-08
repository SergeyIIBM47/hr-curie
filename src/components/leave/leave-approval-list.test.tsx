import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaveApprovalList } from "./leave-approval-list";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockRequests = [
  {
    id: "1",
    type: "VACATION" as const,
    status: "PENDING" as const,
    startDate: "2026-03-16T00:00:00.000Z",
    endDate: "2026-03-20T00:00:00.000Z",
    reason: null,
    createdAt: "2026-03-01T10:00:00.000Z",
    user: {
      employee: {
        firstName: "Alice",
        lastName: "Smith",
        avatarUrl: null,
      },
    },
  },
  {
    id: "2",
    type: "SICK_LEAVE" as const,
    status: "PENDING" as const,
    startDate: "2026-04-01T00:00:00.000Z",
    endDate: "2026-04-02T00:00:00.000Z",
    reason: "Flu",
    createdAt: "2026-03-31T08:00:00.000Z",
    user: {
      employee: {
        firstName: "Bob",
        lastName: "Jones",
        avatarUrl: null,
      },
    },
  },
];

describe("LeaveApprovalList", () => {
  it("renders empty state when no requests", () => {
    render(<LeaveApprovalList initialRequests={[]} />);
    expect(screen.getByText("All caught up!")).toBeInTheDocument();
    expect(
      screen.getByText("No pending leave requests to review."),
    ).toBeInTheDocument();
  });

  it("renders a card for each pending request", () => {
    render(<LeaveApprovalList initialRequests={mockRequests} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("renders approve and reject buttons for each card", () => {
    render(<LeaveApprovalList initialRequests={mockRequests} />);
    expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Reject" })).toHaveLength(2);
  });
});
