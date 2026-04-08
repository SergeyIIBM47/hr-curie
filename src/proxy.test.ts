import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { proxy } from "./proxy";
import { auth } from "@/lib/auth";

const mockedAuth = vi.mocked(auth);

const adminSession = {
  user: { id: "admin-001", email: "sofia@company.com", role: "ADMIN", name: "Sofia Admin" },
  expires: new Date(Date.now() + 86400_000).toISOString(),
};

const employeeSession = {
  user: { id: "emp-001", email: "john@company.com", role: "EMPLOYEE", name: "John Employee" },
  expires: new Date(Date.now() + 86400_000).toISOString(),
};

function createRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost:3000"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("proxy middleware", () => {
  it("redirects authenticated user away from /login to /profile", async () => {
    mockedAuth.mockResolvedValue(adminSession);

    const response = await proxy(createRequest("/login"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/profile");
  });

  it("allows unauthenticated user to access /login", async () => {
    mockedAuth.mockResolvedValue(null);

    const response = await proxy(createRequest("/login"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects unauthenticated user to /login on protected path", async () => {
    mockedAuth.mockResolvedValue(null);

    const response = await proxy(createRequest("/profile"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });

  it("redirects non-admin from admin path to /profile", async () => {
    mockedAuth.mockResolvedValue(employeeSession);

    const response = await proxy(createRequest("/employees"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/profile");
  });

  it("allows admin to access admin paths", async () => {
    mockedAuth.mockResolvedValue(adminSession);

    const response = await proxy(createRequest("/employees"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("allows authenticated user to access normal paths", async () => {
    mockedAuth.mockResolvedValue(employeeSession);

    const response = await proxy(createRequest("/profile"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects non-admin from /settings to /profile", async () => {
    mockedAuth.mockResolvedValue(employeeSession);

    const response = await proxy(createRequest("/settings"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/profile");
  });

  it("redirects non-admin from /leave/manage to /profile", async () => {
    mockedAuth.mockResolvedValue(employeeSession);

    const response = await proxy(createRequest("/leave/manage"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/profile");
  });
});
