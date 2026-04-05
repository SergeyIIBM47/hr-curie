import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { EmployeeSearch } from "./employee-search";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  mockReplace.mockReset();
  vi.mocked(useRouter).mockReturnValue({
    replace: mockReplace,
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams() as unknown as ReturnType<typeof useSearchParams>,
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe("EmployeeSearch", () => {
  it("renders search input with placeholder", () => {
    render(<EmployeeSearch />);
    expect(
      screen.getByPlaceholderText("Search employees..."),
    ).toBeInTheDocument();
  });

  it("updates URL after debounce delay when typing", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EmployeeSearch />);
    // Clear the initial mount effect call
    mockReplace.mockClear();

    await user.type(
      screen.getByPlaceholderText("Search employees..."),
      "Sofia",
    );

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("q=Sofia"),
    );
  });

  it("debounces rapid typing — only last value reaches router", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EmployeeSearch />);
    mockReplace.mockClear();

    const input = screen.getByPlaceholderText("Search employees...");
    await user.type(input, "abc");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
    expect(lastCall[0]).toContain("q=abc");
  });

  it("removes q param when input is cleared", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EmployeeSearch />);
    mockReplace.mockClear();

    const input = screen.getByPlaceholderText("Search employees...");
    await user.type(input, "test");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await user.clear(input);

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
    expect(lastCall[0]).not.toContain("q=");
  });

  it("initialises from existing search param", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("q=existing") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );
    render(<EmployeeSearch />);

    expect(screen.getByPlaceholderText("Search employees...")).toHaveValue(
      "existing",
    );
  });
});
