import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isLoginRateLimited,
  recordLoginFailure,
  clearLoginFailures,
} from "./rate-limit";

const EMAIL = "user@test.com";

describe("login rate limiter", () => {
  beforeEach(() => {
    clearLoginFailures(EMAIL);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not limited without prior failures", () => {
    expect(isLoginRateLimited(EMAIL)).toBe(false);
  });

  it("is not limited below the attempt threshold", () => {
    for (let i = 0; i < 4; i++) recordLoginFailure(EMAIL);
    expect(isLoginRateLimited(EMAIL)).toBe(false);
  });

  it("is limited after 5 failures", () => {
    for (let i = 0; i < 5; i++) recordLoginFailure(EMAIL);
    expect(isLoginRateLimited(EMAIL)).toBe(true);
  });

  it("treats email case-insensitively", () => {
    for (let i = 0; i < 5; i++) recordLoginFailure("User@Test.com");
    expect(isLoginRateLimited(EMAIL)).toBe(true);
  });

  it("clears on successful login", () => {
    for (let i = 0; i < 5; i++) recordLoginFailure(EMAIL);
    clearLoginFailures(EMAIL);
    expect(isLoginRateLimited(EMAIL)).toBe(false);
  });

  it("expires after the 15 minute window", () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) recordLoginFailure(EMAIL);
    expect(isLoginRateLimited(EMAIL)).toBe(true);
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(isLoginRateLimited(EMAIL)).toBe(false);
  });

  it("caps the store so attacker-chosen emails cannot grow memory unbounded", () => {
    for (let i = 0; i < 10_100; i++) {
      recordLoginFailure(`bulk-${i}@test.com`);
    }
    const store = (
      globalThis as unknown as { loginAttemptStore: Map<string, unknown> }
    ).loginAttemptStore;
    expect(store.size).toBeLessThanOrEqual(10_000);
    // the most recent entry must survive eviction
    expect(store.has("bulk-10099@test.com")).toBe(true);
  });

  it("shares state across module instances (separate route chunks)", async () => {
    // Next.js dev bundles each route handler into its own chunk graph, so
    // this module can be instantiated more than once. The store must live
    // on globalThis for /api/auth/rate-limit and authorize() to agree.
    vi.resetModules();
    const first = await import("./rate-limit");
    for (let i = 0; i < 5; i++) first.recordLoginFailure("chunk@test.com");

    vi.resetModules();
    const second = await import("./rate-limit");
    expect(second.isLoginRateLimited("chunk@test.com")).toBe(true);

    second.clearLoginFailures("chunk@test.com");
  });
});
