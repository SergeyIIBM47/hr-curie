import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Sidebar } from "./sidebar";
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
    className?: string;
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

describe("Sidebar", () => {
  describe("render", () => {
    it('shows "HR Curie" branding', () => {
      render(<Sidebar user={adminUser} />);
      expect(screen.getByText("HR Curie")).toBeInTheDocument();
    });

    it("shows common navigation items", () => {
      render(<Sidebar user={employeeUser} />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("My Profile")).toBeInTheDocument();
      expect(screen.getByText("Leave")).toBeInTheDocument();
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    it("shows user name in the user card", () => {
      render(<Sidebar user={adminUser} />);
      expect(screen.getByText("Sofia Admin")).toBeInTheDocument();
    });

    it('shows role label ("Administrator" for admin)', () => {
      render(<Sidebar user={adminUser} />);
      expect(screen.getByText("Administrator")).toBeInTheDocument();
    });

    it('shows role label ("Employee" for employee role)', () => {
      render(<Sidebar user={employeeUser} />);
      expect(screen.getByText("Employee")).toBeInTheDocument();
    });

    it("shows user initials as avatar fallback", () => {
      render(<Sidebar user={adminUser} />);
      expect(screen.getByText("SA")).toBeInTheDocument();
    });
  });

  describe("admin role", () => {
    it("shows Employees and Settings nav items", () => {
      render(<Sidebar user={adminUser} />);
      expect(screen.getByText("Employees")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("shows admin badge on admin-only items", () => {
      render(<Sidebar user={adminUser} />);
      const badges = screen.getAllByText("Admin");
      expect(badges.length).toBe(2); // Employees and Settings
    });
  });

  describe("employee role", () => {
    it("hides Employees and Settings nav items", () => {
      render(<Sidebar user={employeeUser} />);
      expect(screen.queryByText("Employees")).not.toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("shows only non-admin nav items", () => {
      render(<Sidebar user={employeeUser} />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("My Profile")).toBeInTheDocument();
      expect(screen.getByText("Leave")).toBeInTheDocument();
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });
  });

  describe("active state", () => {
    it("highlights the matching nav item for current route", () => {
      vi.mocked(usePathname).mockReturnValue("/employees");
      render(<Sidebar user={adminUser} />);

      const employeesLink = screen.getByText("Employees").closest("a")!;
      expect(employeesLink.className).toContain("border-[#007AFF]");
      expect(employeesLink.className).toContain("text-[#007AFF]");
    });

    it("does not highlight non-active items", () => {
      vi.mocked(usePathname).mockReturnValue("/employees");
      render(<Sidebar user={adminUser} />);

      const overviewLink = screen.getByText("Overview").closest("a")!;
      expect(overviewLink.className).not.toContain("border-[#007AFF]");
    });

    it("highlights Overview only for exact / path", () => {
      vi.mocked(usePathname).mockReturnValue("/");
      render(<Sidebar user={adminUser} />);

      const overviewLink = screen.getByText("Overview").closest("a")!;
      expect(overviewLink.className).toContain("text-[#007AFF]");
    });
  });

  describe("sign out", () => {
    it("renders sign out button", () => {
      render(<Sidebar user={adminUser} />);
      expect(screen.getByLabelText("Sign out")).toBeInTheDocument();
    });

    it("calls signOut when clicked", async () => {
      const user = userEvent.setup();
      render(<Sidebar user={adminUser} />);

      await user.click(screen.getByLabelText("Sign out"));

      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
    });
  });
});
