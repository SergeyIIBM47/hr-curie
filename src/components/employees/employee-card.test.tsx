import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmployeeCard } from "./employee-card";
import type { EmployeeListItem } from "@/types/employee";

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

const employee: EmployeeListItem = {
  id: "emp-1",
  firstName: "John",
  lastName: "Doe",
  workEmail: "john@company.com",
  position: "Senior Developer",
  department: "Engineering",
  avatarUrl: null,
  employmentType: { name: "CY" },
  user: { id: "u1", role: "EMPLOYEE" },
};

describe("EmployeeCard", () => {
  it("renders initials as avatar fallback", () => {
    render(<EmployeeCard employee={employee} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders employee name", () => {
    render(<EmployeeCard employee={employee} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders employee email", () => {
    render(<EmployeeCard employee={employee} />);
    expect(screen.getByText("john@company.com")).toBeInTheDocument();
  });

  it("renders department", () => {
    render(<EmployeeCard employee={employee} />);
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("renders role badge", () => {
    render(<EmployeeCard employee={employee} />);
    expect(screen.getByText("Employee")).toBeInTheDocument();
  });

  it("links to the employee profile page", () => {
    render(<EmployeeCard employee={employee} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/employees/emp-1");
  });

  it("renders admin badge for admin user", () => {
    const adminEmployee = {
      ...employee,
      user: { ...employee.user, role: "ADMIN" as const },
    };
    render(<EmployeeCard employee={adminEmployee} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("hides department when null", () => {
    const noDept = { ...employee, department: null };
    render(<EmployeeCard employee={noDept} />);
    expect(screen.queryByText("Engineering")).not.toBeInTheDocument();
  });
});
