import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { RoleToggle } from "./role-toggle";

const mockRefresh = vi.fn();
const fetchMock = vi.fn();

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
  vi.mocked(toast.success).mockReset();
  vi.mocked(toast.error).mockReset();
  global.fetch = fetchMock;
});

describe("RoleToggle", () => {
  it("renders switch in checked state for ADMIN", () => {
    render(
      <RoleToggle employeeId="emp-1" currentRole="ADMIN" isSelf={false} />,
    );

    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("renders switch in unchecked state for EMPLOYEE", () => {
    render(
      <RoleToggle employeeId="emp-1" currentRole="EMPLOYEE" isSelf={false} />,
    );

    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
  });

  it("shows 'Admin Access' label", () => {
    render(
      <RoleToggle employeeId="emp-1" currentRole="EMPLOYEE" isSelf={false} />,
    );
    expect(screen.getByText("Admin Access")).toBeInTheDocument();
  });

  it("opens confirmation dialog on toggle click", async () => {
    const user = userEvent.setup();
    render(
      <RoleToggle employeeId="emp-1" currentRole="EMPLOYEE" isSelf={false} />,
    );

    await user.click(screen.getByRole("switch"));

    expect(await screen.findByText("Change Role")).toBeInTheDocument();
    expect(screen.getByText(/grant admin access/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i }),
    ).toBeInTheDocument();
  });

  it("calls API and updates role on confirm", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: "u1", role: "ADMIN" } }),
    });

    render(
      <RoleToggle employeeId="emp-1" currentRole="EMPLOYEE" isSelf={false} />,
    );

    await user.click(screen.getByRole("switch"));
    await user.click(await screen.findByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/employees/emp-1/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Role updated to admin");
  });

  it("shows loading text during API call", async () => {
    const user = userEvent.setup();

    let resolveApi!: (value: unknown) => void;
    fetchMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveApi = resolve; }),
    );

    render(
      <RoleToggle employeeId="emp-1" currentRole="EMPLOYEE" isSelf={false} />,
    );

    await user.click(screen.getByRole("switch"));
    await user.click(await screen.findByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText("Updating...")).toBeInTheDocument();
    });

    resolveApi({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
  });

  it("shows error toast on API failure", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    render(
      <RoleToggle employeeId="emp-1" currentRole="EMPLOYEE" isSelf={false} />,
    );

    await user.click(screen.getByRole("switch"));
    await user.click(await screen.findByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("shows error toast when toggling own role", async () => {
    const user = userEvent.setup();
    render(
      <RoleToggle employeeId="emp-1" currentRole="ADMIN" isSelf={true} />,
    );

    await user.click(screen.getByRole("switch"));

    expect(toast.error).toHaveBeenCalledWith("Cannot change your own role");
    // Dialog should NOT open
    expect(screen.queryByText("Change Role")).not.toBeInTheDocument();
  });

  it("closes dialog on cancel", async () => {
    const user = userEvent.setup();
    render(
      <RoleToggle employeeId="emp-1" currentRole="EMPLOYEE" isSelf={false} />,
    );

    await user.click(screen.getByRole("switch"));
    expect(await screen.findByText("Change Role")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText("Change Role")).not.toBeInTheDocument();
    });
  });
});
