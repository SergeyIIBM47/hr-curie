import { describe, it, expect } from "vitest";
import { cn, getInitials, formatDateUTC, isHttpUrl } from "./utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles undefined, null, and false values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("handles empty arguments", () => {
    expect(cn()).toBe("");
  });
});

describe("getInitials", () => {
  it("returns two initials for two-word name", () => {
    expect(getInitials("Sofia Admin")).toBe("SA");
  });

  it("returns one initial for single-word name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });

  it("returns max 2 characters for many words", () => {
    expect(getInitials("A B C D")).toBe("AB");
  });

  it("uppercases lowercase names", () => {
    expect(getInitials("jane doe")).toBe("JD");
  });

  it("handles extra whitespace", () => {
    expect(getInitials("  Sofia   Admin  ")).toBe("SA");
  });
});

describe("formatDateUTC", () => {
  it("formats a Date object to 'MMMM d, yyyy'", () => {
    const date = new Date(Date.UTC(1990, 0, 1)); // Jan 1, 1990
    expect(formatDateUTC(date)).toBe("January 1, 1990");
  });

  it("handles mid-year dates", () => {
    const date = new Date(Date.UTC(2024, 5, 15)); // June 15, 2024
    expect(formatDateUTC(date)).toBe("June 15, 2024");
  });

  it("handles end-of-year dates", () => {
    const date = new Date(Date.UTC(2023, 11, 31)); // Dec 31, 2023
    expect(formatDateUTC(date)).toBe("December 31, 2023");
  });
});

describe("isHttpUrl", () => {
  it("returns true for https URL", () => {
    expect(isHttpUrl("https://example.com")).toBe(true);
  });

  it("returns true for http URL", () => {
    expect(isHttpUrl("http://example.com")).toBe(true);
  });

  it("returns false for ftp URL", () => {
    expect(isHttpUrl("ftp://example.com")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isHttpUrl("")).toBe(false);
  });

  it("returns false for non-URL string", () => {
    expect(isHttpUrl("not-a-url")).toBe(false);
  });

  it("returns false for relative path", () => {
    expect(isHttpUrl("/path/to/resource")).toBe(false);
  });
});
