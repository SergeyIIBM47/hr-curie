import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { Topbar } from "./topbar";
import type { Role } from "@prisma/client";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
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

describe("Topbar", () => {
  it("renders user initials as avatar fallback", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Topbar user={testUser} />);
    expect(screen.getByText("SA")).toBeInTheDocument();
  });

  it('shows "Overview" title for / path', () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Topbar user={testUser} />);
    expect(
      screen.getByRole("heading", { name: "Overview" }),
    ).toBeInTheDocument();
  });

  it('shows "My Profile" title for /profile path', () => {
    vi.mocked(usePathname).mockReturnValue("/profile");
    render(<Topbar user={testUser} />);
    expect(
      screen.getByRole("heading", { name: "My Profile" }),
    ).toBeInTheDocument();
  });

  it('shows "Employees" title for /employees path', () => {
    vi.mocked(usePathname).mockReturnValue("/employees");
    render(<Topbar user={testUser} />);
    expect(
      screen.getByRole("heading", { name: "Employees" }),
    ).toBeInTheDocument();
  });

  it('shows "Employees" title for nested /employees/123 path', () => {
    vi.mocked(usePathname).mockReturnValue("/employees/123");
    render(<Topbar user={testUser} />);
    expect(
      screen.getByRole("heading", { name: "Employees" }),
    ).toBeInTheDocument();
  });

  it('shows "Dashboard" as fallback title for unknown path', () => {
    vi.mocked(usePathname).mockReturnValue("/unknown");
    render(<Topbar user={testUser} />);
    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("renders with user who has an image", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const userWithImage = { ...testUser, image: "https://example.com/avatar.jpg" };
    render(<Topbar user={userWithImage} />);

    // Initials fallback still present (image may not load in jsdom)
    expect(screen.getByText("SA")).toBeInTheDocument();
  });
});
