import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Topbar } from "./topbar";
import type { Role } from "@prisma/client";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

interface TestUser {
  name: string;
  email: string;
  role: Role;
  image?: string;
}

const testUser: TestUser = {
  name: "Sofia Admin",
  email: "sofia@company.com",
  role: "ADMIN",
};

const counts = { employees: 128, pendingLeave: 7 };

describe("Topbar", () => {
  it("renders the breadcrumb root crumb", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Topbar user={testUser} counts={counts} />);
    expect(screen.getByText("workspace")).toBeInTheDocument();
  });

  it('shows "overview" crumb for the / path', () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Topbar user={testUser} counts={counts} />);
    expect(screen.getByText("overview")).toBeInTheDocument();
  });

  it("shows the route segment in the breadcrumb for /profile", () => {
    vi.mocked(usePathname).mockReturnValue("/profile");
    render(<Topbar user={testUser} counts={counts} />);
    expect(screen.getByText("profile")).toBeInTheDocument();
  });

  it("shows the route segment in the breadcrumb for /employees", () => {
    vi.mocked(usePathname).mockReturnValue("/employees");
    render(<Topbar user={testUser} counts={counts} />);
    expect(screen.getByText("employees")).toBeInTheDocument();
  });

  it("renders the disabled search pill with placeholder copy", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Topbar user={testUser} counts={counts} />);
    expect(screen.getByText(/Search people, leave, meetings/)).toBeInTheDocument();
  });

  it("renders the notifications bell button", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Topbar user={testUser} counts={counts} />);
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("marks the last crumb with aria-current=page", () => {
    vi.mocked(usePathname).mockReturnValue("/employees");
    render(<Topbar user={testUser} counts={counts} />);
    const current = screen.getByText("employees");
    expect(current).toHaveAttribute("aria-current", "page");
  });
});
