import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sidebar } from "./sidebar";
import type { Role } from "@prisma/client";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
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

const counts = { employees: 128, pendingLeave: 7 };

beforeEach(() => {
  vi.mocked(usePathname).mockReturnValue("/");
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams() as ReturnType<typeof useSearchParams>,
  );
});

describe("Sidebar", () => {
  describe("render", () => {
    it('shows "HR Curie" branding', () => {
      render(<Sidebar user={adminUser} counts={counts} />);
      expect(screen.getByText(/HR\s+Curie/)).toBeInTheDocument();
    });

    it("shows common navigation items", () => {
      render(<Sidebar user={employeeUser} counts={counts} />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("My Profile")).toBeInTheDocument();
      expect(screen.getByText("Leave")).toBeInTheDocument();
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    it("shows the section overlines", () => {
      render(<Sidebar user={adminUser} counts={counts} />);
      expect(screen.getByText("Main menu")).toBeInTheDocument();
      expect(screen.getByText("Favorites")).toBeInTheDocument();
    });

    it("shows user name in the account block", () => {
      render(<Sidebar user={adminUser} counts={counts} />);
      expect(screen.getByText("Sofia Admin")).toBeInTheDocument();
    });

    it('shows role label ("Administrator" for admin)', () => {
      render(<Sidebar user={adminUser} counts={counts} />);
      expect(screen.getByText("Administrator")).toBeInTheDocument();
    });

    it('shows role label ("Employee" for employee role)', () => {
      render(<Sidebar user={employeeUser} counts={counts} />);
      expect(screen.getByText("Employee")).toBeInTheDocument();
    });

    it("shows user initials in the account block", () => {
      render(<Sidebar user={adminUser} counts={counts} />);
      expect(screen.getByText("SA")).toBeInTheDocument();
    });
  });

  describe("admin role", () => {
    it("shows Employees and Settings nav items", () => {
      render(<Sidebar user={adminUser} counts={counts} />);
      expect(screen.getByText("Employees")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders the employees mono count", () => {
      render(<Sidebar user={adminUser} counts={counts} />);
      expect(screen.getByText("128")).toBeInTheDocument();
    });
  });

  describe("employee role", () => {
    it("hides Employees and Settings nav items", () => {
      render(<Sidebar user={employeeUser} counts={counts} />);
      expect(screen.queryByText("Employees")).not.toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("hides admin-only favorites", () => {
      render(<Sidebar user={employeeUser} counts={counts} />);
      expect(screen.queryByText("Engineering team")).not.toBeInTheDocument();
      expect(screen.queryByText("Onboarding pipeline")).not.toBeInTheDocument();
      expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
    });
  });

  describe("leave pill", () => {
    it("renders pending leave pill when count > 0", () => {
      render(<Sidebar user={employeeUser} counts={counts} />);
      expect(screen.getByLabelText("7 pending")).toBeInTheDocument();
    });

    it("hides pending leave pill when count is 0", () => {
      render(
        <Sidebar
          user={employeeUser}
          counts={{ employees: 0, pendingLeave: 0 }}
        />,
      );
      expect(screen.queryByLabelText(/pending/)).not.toBeInTheDocument();
    });
  });

  describe("active state", () => {
    it("sets aria-current=page on the matching nav item", () => {
      vi.mocked(usePathname).mockReturnValue("/employees");
      render(<Sidebar user={adminUser} counts={counts} />);

      const employeesLink = screen.getByText("Employees").closest("a")!;
      expect(employeesLink).toHaveAttribute("aria-current", "page");
    });

    it("does not set aria-current on non-active items", () => {
      vi.mocked(usePathname).mockReturnValue("/employees");
      render(<Sidebar user={adminUser} counts={counts} />);

      const overviewLink = screen.getByText("Overview").closest("a")!;
      expect(overviewLink).not.toHaveAttribute("aria-current");
    });

    it("marks Overview active only for exact / path", () => {
      vi.mocked(usePathname).mockReturnValue("/");
      render(<Sidebar user={adminUser} counts={counts} />);

      const overviewLink = screen.getByText("Overview").closest("a")!;
      expect(overviewLink).toHaveAttribute("aria-current", "page");
    });

    it("does not mark query favorites active on the plain employees path", () => {
      vi.mocked(usePathname).mockReturnValue("/employees");
      render(<Sidebar user={adminUser} counts={counts} />);

      const employeesLink = screen.getByText("Employees").closest("a")!;
      const favoriteLink = screen.getByText("Engineering team").closest("a")!;

      expect(employeesLink).toHaveAttribute("aria-current", "page");
      expect(favoriteLink).not.toHaveAttribute("aria-current");
    });

    it("marks only the matching query favorite active", () => {
      vi.mocked(usePathname).mockReturnValue("/employees");
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams("team=engineering") as ReturnType<
          typeof useSearchParams
        >,
      );
      render(<Sidebar user={adminUser} counts={counts} />);

      const employeesLink = screen.getByText("Employees").closest("a")!;
      const engineeringLink = screen.getByText("Engineering team").closest("a")!;
      const onboardingLink = screen
        .getByText("Onboarding pipeline")
        .closest("a")!;

      expect(employeesLink).not.toHaveAttribute("aria-current");
      expect(engineeringLink).toHaveAttribute("aria-current", "page");
      expect(onboardingLink).not.toHaveAttribute("aria-current");
    });
  });
});
