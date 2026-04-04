import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

// Mock auth before importing auth-guard
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock next/navigation redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { requireAuth, requireApiAuth } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";

const mockedAuth = vi.mocked(auth);

const adminSession: Session = {
  user: {
    id: "admin-001",
    email: "sofia@company.com",
    role: "ADMIN",
    name: "Sofia Admin",
  },
  expires: new Date(Date.now() + 86400_000).toISOString(),
};

const employeeSession: Session = {
  user: {
    id: "emp-001",
    email: "john@company.com",
    role: "EMPLOYEE",
    name: "John Employee",
  },
  expires: new Date(Date.now() + 86400_000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireApiAuth()", () => {
  it("returns 401 when no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await requireApiAuth();

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(401);
    const body = await result.error!.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns session for authenticated user", async () => {
    mockedAuth.mockResolvedValue(adminSession);

    const result = await requireApiAuth();

    expect(result.error).toBeUndefined();
    expect(result.session).toBeDefined();
    expect(result.session!.user.email).toBe("sofia@company.com");
    expect(result.session!.user.role).toBe("ADMIN");
  });

  it("returns 403 when role does not match", async () => {
    mockedAuth.mockResolvedValue(employeeSession);

    const result = await requireApiAuth("ADMIN");

    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(403);
    const body = await result.error!.json();
    expect(body.error).toBe("Forbidden");
  });

  it("returns session when role matches", async () => {
    mockedAuth.mockResolvedValue(adminSession);

    const result = await requireApiAuth("ADMIN");

    expect(result.error).toBeUndefined();
    expect(result.session!.user.role).toBe("ADMIN");
  });

  it("allows any role when no role is required", async () => {
    mockedAuth.mockResolvedValue(employeeSession);

    const result = await requireApiAuth();

    expect(result.error).toBeUndefined();
    expect(result.session!.user.role).toBe("EMPLOYEE");
  });
});

describe("requireAuth()", () => {
  it("redirects to /login when no session", async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });

  it("returns session for authenticated user", async () => {
    mockedAuth.mockResolvedValue(adminSession);

    const session = await requireAuth();

    expect(session.user.email).toBe("sofia@company.com");
  });

  it("redirects to /profile when role does not match", async () => {
    mockedAuth.mockResolvedValue(employeeSession);

    await expect(requireAuth("ADMIN")).rejects.toThrow("REDIRECT:/profile");
  });

  it("returns session when role matches", async () => {
    mockedAuth.mockResolvedValue(adminSession);

    const session = await requireAuth("ADMIN");

    expect(session.user.role).toBe("ADMIN");
  });
});
