import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MobileNav } from "./mobile-nav";
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
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} {...props}>
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

const adminUser: TestUser = {
  name: "Sofia Admin",
  email: "sofia@company.com",
  role: "ADMIN",
};

const employeeUser: TestUser = {
  name: "John Employee",
  email: "john@company.com",
  role: "EMPLOYEE",
};

beforeEach(() => {
  vi.mocked(usePathname).mockReturnValue("/");
});

describe("MobileNav", () => {
  it("renders the menu button", () => {
    render(<MobileNav user={adminUser} />);
    expect(screen.getByLabelText("Open navigation")).toBeInTheDocument();
  });

  it("opens sheet with navigation when menu button is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileNav user={adminUser} />);

    await user.click(screen.getByLabelText("Open navigation"));

    expect(await screen.findByText("HR Curie")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("My Profile")).toBeInTheDocument();
  });

  it("shows all nav items including admin items for admin role", async () => {
    const user = userEvent.setup();
    render(<MobileNav user={adminUser} />);

    await user.click(screen.getByLabelText("Open navigation"));

    expect(await screen.findByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByText("Leave")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("hides admin items for employee role", async () => {
    const user = userEvent.setup();
    render(<MobileNav user={employeeUser} />);

    await user.click(screen.getByLabelText("Open navigation"));

    expect(await screen.findByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getByText("Leave")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.queryByText("Employees")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("renders navigation items as links with correct hrefs", async () => {
    const user = userEvent.setup();
    render(<MobileNav user={adminUser} />);

    await user.click(screen.getByLabelText("Open navigation"));

    const overviewLink = (await screen.findByText("Overview")).closest("a");
    expect(overviewLink).toHaveAttribute("href", "/");

    const employeesLink = screen.getByText("Employees").closest("a");
    expect(employeesLink).toHaveAttribute("href", "/employees");
  });

  it("shows user name and sign out button in the sheet", async () => {
    const user = userEvent.setup();
    render(<MobileNav user={adminUser} />);

    await user.click(screen.getByLabelText("Open navigation"));

    expect(await screen.findByText("Sofia Admin")).toBeInTheDocument();
    expect(screen.getByLabelText("Sign out")).toBeInTheDocument();
  });

  it("calls signOut when sign out button is clicked", async () => {
    const user = userEvent.setup();
    render(<MobileNav user={adminUser} />);

    await user.click(screen.getByLabelText("Open navigation"));

    const signOutButton = await screen.findByLabelText("Sign out");
    await user.click(signOutButton);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });
});
