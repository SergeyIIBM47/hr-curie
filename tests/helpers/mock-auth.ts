import { vi } from "vitest";
import type { Session } from "next-auth";

export const adminSession: Session = {
  user: {
    id: "admin-001",
    email: "sofia@company.com",
    role: "ADMIN",
    name: "Sofia Admin",
    image: undefined,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const employeeSession: Session = {
  user: {
    id: "employee-001",
    email: "john@company.com",
    role: "EMPLOYEE",
    name: "John Employee",
    image: undefined,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const nullSession = null;

export function mockAuth(session: Session | null) {
  vi.mock("@/lib/auth", () => ({
    auth: vi.fn().mockResolvedValue(session),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
  }));
}

export function mockAuthOnce(session: Session | null) {
  const { auth } = vi.mocked(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/lib/auth") as { auth: ReturnType<typeof vi.fn> },
  );
  auth.mockResolvedValueOnce(session);
}
