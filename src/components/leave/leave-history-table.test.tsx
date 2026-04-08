import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaveHistoryTable } from "./leave-history-table";

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

const mockRequests = [
  {
    id: "1",
    type: "VACATION" as const,
    status: "APPROVED" as const,
    startDate: "2026-03-16T00:00:00.000Z",
    endDate: "2026-03-20T00:00:00.000Z",
    reason: "Family trip",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "2",
    type: "SICK_LEAVE" as const,
    status: "PENDING" as const,
    startDate: "2026-04-07T00:00:00.000Z",
    endDate: "2026-04-08T00:00:00.000Z",
    reason: null,
    createdAt: "2026-04-06T08:00:00.000Z",
  },
  {
    id: "3",
    type: "DAY_OFF" as const,
    status: "REJECTED" as const,
    startDate: "2026-02-10T00:00:00.000Z",
    endDate: "2026-02-10T00:00:00.000Z",
    reason: "Personal errand",
    createdAt: "2026-02-05T12:00:00.000Z",
  },
];

describe("LeaveHistoryTable", () => {
  describe("empty state", () => {
    it("shows empty state message with CTA", () => {
      render(<LeaveHistoryTable requests={[]} />);
      expect(screen.getByText("No leave requests yet")).toBeInTheDocument();
      expect(
        screen.getByText("Submit your first leave request to get started."),
      ).toBeInTheDocument();
      const cta = screen.getByRole("link", { name: "Request Leave" });
      expect(cta).toHaveAttribute("href", "/leave/request");
    });
  });

  describe("desktop table", () => {
    it("renders table headers", () => {
      render(<LeaveHistoryTable requests={mockRequests} />);
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Dates")).toBeInTheDocument();
      expect(screen.getByText("Duration")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Reason")).toBeInTheDocument();
      expect(screen.getByText("Submitted")).toBeInTheDocument();
    });

    it("renders leave type labels", () => {
      render(<LeaveHistoryTable requests={mockRequests} />);
      expect(screen.getAllByText("Vacation")).toHaveLength(2); // table + mobile card
      expect(screen.getAllByText("Sick Leave")).toHaveLength(2);
      expect(screen.getAllByText("Day Off")).toHaveLength(2);
    });

    it("renders status badges", () => {
      render(<LeaveHistoryTable requests={mockRequests} />);
      // Each badge appears twice (desktop + mobile)
      expect(screen.getAllByText("Approved")).toHaveLength(2);
      expect(screen.getAllByText("Pending")).toHaveLength(2);
      expect(screen.getAllByText("Rejected")).toHaveLength(2);
    });

    it("renders reason or dash when null", () => {
      render(<LeaveHistoryTable requests={mockRequests} />);
      expect(screen.getAllByText("Family trip").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });

    it("renders working days duration", () => {
      render(<LeaveHistoryTable requests={mockRequests} />);
      // Vacation: March 16-20, 2026 = 5 working days
      expect(screen.getAllByText("5 days").length).toBeGreaterThanOrEqual(1);
      // Sick leave: April 7-8, 2026 = 2 working days
      expect(screen.getAllByText("2 days").length).toBeGreaterThanOrEqual(1);
      // Day off: Feb 10, 2026 = 1 working day
      expect(screen.getAllByText("1 day").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("mobile cards", () => {
    it("renders card for each request", () => {
      render(<LeaveHistoryTable requests={mockRequests} />);
      // Mobile cards container has md:hidden class
      const mobileContainer = document.querySelector(".md\\:hidden");
      expect(mobileContainer).toBeInTheDocument();
      // Each request has a mobile card
      const cards = mobileContainer?.querySelectorAll(".rounded-\\[10px\\]");
      expect(cards).toHaveLength(3);
    });

    it("shows reason in mobile card when present", () => {
      render(<LeaveHistoryTable requests={[mockRequests[0]]} />);
      // Appears in both desktop table and mobile card
      expect(screen.getAllByText("Family trip")).toHaveLength(2);
    });
  });
});
