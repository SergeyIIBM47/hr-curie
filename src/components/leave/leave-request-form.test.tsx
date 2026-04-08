import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { LeaveRequestForm, countWorkingDays } from "./leave-request-form";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
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
  vi.restoreAllMocks();
  mockPush.mockReset();
  mockRefresh.mockReset();
  fetchMock.mockReset();
  global.fetch = fetchMock;

  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
});

describe("countWorkingDays", () => {
  it("returns 5 for a Mon–Fri week", () => {
    // 2026-04-06 is Monday, 2026-04-10 is Friday
    expect(countWorkingDays(new Date("2026-04-06"), new Date("2026-04-10"))).toBe(5);
  });

  it("returns 1 for a single weekday", () => {
    expect(countWorkingDays(new Date("2026-04-06"), new Date("2026-04-06"))).toBe(1);
  });

  it("returns 0 for a weekend-only range", () => {
    // 2026-04-11 is Saturday, 2026-04-12 is Sunday
    expect(countWorkingDays(new Date("2026-04-11"), new Date("2026-04-12"))).toBe(0);
  });

  it("returns 0 when end is before start", () => {
    expect(countWorkingDays(new Date("2026-04-10"), new Date("2026-04-06"))).toBe(0);
  });

  it("excludes weekends in a two-week span", () => {
    // 2026-04-06 Mon to 2026-04-17 Fri = 10 working days
    expect(countWorkingDays(new Date("2026-04-06"), new Date("2026-04-17"))).toBe(10);
  });
});

describe("LeaveRequestForm", () => {
  it("renders all form fields", () => {
    render(<LeaveRequestForm />);

    expect(screen.getByLabelText("Leave Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit request/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("renders leave type options", () => {
    render(<LeaveRequestForm />);

    const select = screen.getByLabelText("Leave Type");
    const options = select.querySelectorAll("option");
    // placeholder + 3 types
    expect(options).toHaveLength(4);
    expect(options[1]).toHaveTextContent("Sick Leave");
    expect(options[2]).toHaveTextContent("Day Off");
    expect(options[3]).toHaveTextContent("Vacation");
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm />);

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      // Both date fields show errors; type field shows its own error
      const dateErrors = screen.getAllByText(/expected date, received Date/i);
      expect(dateErrors).toHaveLength(2);
    });
    expect(screen.getByText(/invalid option/i)).toBeInTheDocument();
  });

  it("shows working days when both dates are set", async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm />);

    // 2026-04-06 Mon to 2026-04-10 Fri = 5 working days
    await user.type(screen.getByLabelText("Start Date"), "2026-04-06");
    await user.type(screen.getByLabelText("End Date"), "2026-04-10");

    await waitFor(() => {
      expect(screen.getByTestId("working-days")).toHaveTextContent("5 working days");
    });
  });

  it("does not show working days when only start date is set", async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm />);

    await user.type(screen.getByLabelText("Start Date"), "2026-04-06");

    expect(screen.queryByTestId("working-days")).not.toBeInTheDocument();
  });

  it("calls POST /api/leave with correct body on valid submit", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: "lr-1" } }),
    });

    render(<LeaveRequestForm />);

    await user.selectOptions(screen.getByLabelText("Leave Type"), "VACATION");
    await user.type(screen.getByLabelText("Start Date"), "2026-04-06");
    await user.type(screen.getByLabelText("End Date"), "2026-04-10");
    await user.type(screen.getByLabelText("Reason (optional)"), "Family trip");

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.type).toBe("VACATION");
    expect(body.reason).toBe("Family trip");
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();

    let resolveSubmit!: (value: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<LeaveRequestForm />);

    await user.selectOptions(screen.getByLabelText("Leave Type"), "DAY_OFF");
    await user.type(screen.getByLabelText("Start Date"), "2026-04-06");
    await user.type(screen.getByLabelText("End Date"), "2026-04-06");

    const submitButton = screen.getByRole("button", { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    expect(screen.queryByText("Submit Request")).not.toBeInTheDocument();

    resolveSubmit({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
  });

  it("redirects to /leave on successful submission", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: "lr-1" } }),
    });

    render(<LeaveRequestForm />);

    await user.selectOptions(screen.getByLabelText("Leave Type"), "SICK_LEAVE");
    await user.type(screen.getByLabelText("Start Date"), "2026-04-06");
    await user.type(screen.getByLabelText("End Date"), "2026-04-06");

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/leave");
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows toast error on API failure", async () => {
    const { toast } = await import("sonner");
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Overlapping leave" }),
    });

    render(<LeaveRequestForm />);

    await user.selectOptions(screen.getByLabelText("Leave Type"), "VACATION");
    await user.type(screen.getByLabelText("Start Date"), "2026-04-06");
    await user.type(screen.getByLabelText("End Date"), "2026-04-10");

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Overlapping leave");
    });
  });

  it("cancel button navigates to /leave", async () => {
    const user = userEvent.setup();
    render(<LeaveRequestForm />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith("/leave");
  });

  it("omits empty reason from submission body", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    render(<LeaveRequestForm />);

    await user.selectOptions(screen.getByLabelText("Leave Type"), "SICK_LEAVE");
    await user.type(screen.getByLabelText("Start Date"), "2026-04-06");
    await user.type(screen.getByLabelText("End Date"), "2026-04-06");

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.reason).toBeUndefined();
  });
});
