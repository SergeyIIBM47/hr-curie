import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does NOT update value before delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("initial");
  });

  it("updates value after delay expires", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("resets timer when value changes rapidly (only last value used)", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "first" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "third" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Not enough time for any value to settle
    expect(result.current).toBe("initial");

    // Now wait for full delay after last change
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("third");
  });

  it("works with different delay values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "start" } },
    );

    rerender({ value: "end" });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("start");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("end");
  });

  it("uses default delay of 300ms", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "start" } },
    );

    rerender({ value: "end" });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("start");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("end");
  });
});
