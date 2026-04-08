import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { LeaveApprovalCard } from "./leave-approval-card";

const mockRefresh = vi.fn();
const fetchMock = vi.fn();
const onResolved = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

beforeEach(() => {
  fetchMock.mockReset();
  mockRefresh.mockReset();
  onResolved.mockReset();
  vi.mocked(toast.success).mockReset();
  vi.mocked(toast.error).mockReset();
  global.fetch = fetchMock;
});

const mockRequest = {
  id: "leave-1",
  type: "VACATION" as const,
  status: "PENDING" as const,
  startDate: "2026-03-16T00:00:00.000Z",
  endDate: "2026-03-20T00:00:00.000Z",
  reason: "Family trip to Paris",
  createdAt: "2026-03-01T10:00:00.000Z",
  user: {
    employee: {
      firstName: "John",
      lastName: "Doe",
      avatarUrl: null,
    },
  },
};

describe("LeaveApprovalCard", () => {
  it("renders employee name and initials", () => {
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders leave type", () => {
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );
    expect(screen.getByText("Vacation")).toBeInTheDocument();
  });

  it("renders date range and duration", () => {
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );
    expect(
      screen.getByText("March 16, 2026 — March 20, 2026"),
    ).toBeInTheDocument();
    expect(screen.getByText(/5 working days/)).toBeInTheDocument();
  });

  it("renders reason when present", () => {
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );
    expect(screen.getByText("Family trip to Paris")).toBeInTheDocument();
  });

  it("renders approve and reject buttons", () => {
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );
    expect(
      screen.getByRole("button", { name: "Approve" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reject" }),
    ).toBeInTheDocument();
  });

  it("opens confirm dialog when Approve clicked", async () => {
    const user = userEvent.setup();
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(
      await screen.findByText("Approve Leave Request"),
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/approve/i);
    expect(dialog).toHaveTextContent(/John Doe/);
    expect(dialog).toHaveTextContent(/vacation/i);
  });

  it("opens confirm dialog when Reject clicked", async () => {
    const user = userEvent.setup();
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );

    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(
      await screen.findByText("Reject Leave Request"),
    ).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent(/reject/i);
    expect(dialog).toHaveTextContent(/John Doe/);
    expect(dialog).toHaveTextContent(/vacation/i);
  });

  it("closes dialog on cancel", async () => {
    const user = userEvent.setup();
    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(
      await screen.findByText("Approve Leave Request"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(
        screen.queryByText("Approve Leave Request"),
      ).not.toBeInTheDocument();
    });
  });

  it("calls approve API and shows success toast", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));

    // Click the confirm button in the dialog (second "Approve" button)
    const dialogButtons = await screen.findAllByRole("button", {
      name: "Approve",
    });
    await user.click(dialogButtons[dialogButtons.length - 1]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/leave/leave-1/approve", {
        method: "POST",
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Leave request approved");
  });

  it("calls reject API and shows success toast", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );

    await user.click(screen.getByRole("button", { name: "Reject" }));

    const dialogButtons = await screen.findAllByRole("button", {
      name: "Reject",
    });
    await user.click(dialogButtons[dialogButtons.length - 1]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/leave/leave-1/reject", {
        method: "POST",
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Leave request rejected");
  });

  it("shows error toast on API failure", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));

    const dialogButtons = await screen.findAllByRole("button", {
      name: "Approve",
    });
    await user.click(dialogButtons[dialogButtons.length - 1]);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("calls onResolved after animation delay on success", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    render(
      <LeaveApprovalCard request={mockRequest} onResolved={onResolved} />,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));

    const dialogButtons = await screen.findAllByRole("button", {
      name: "Approve",
    });
    await user.click(dialogButtons[dialogButtons.length - 1]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    // onResolved should not be called immediately
    expect(onResolved).not.toHaveBeenCalled();

    // After animation completes
    vi.advanceTimersByTime(400);

    expect(onResolved).toHaveBeenCalledWith("leave-1");

    vi.useRealTimers();
  });

  it("handles unknown employee gracefully", () => {
    const requestNoEmployee = {
      ...mockRequest,
      user: { employee: null },
    };
    render(
      <LeaveApprovalCard
        request={requestNoEmployee}
        onResolved={onResolved}
      />,
    );
    expect(screen.getByText("Unknown Employee")).toBeInTheDocument();
    expect(screen.getByText("UE")).toBeInTheDocument();
  });
});
