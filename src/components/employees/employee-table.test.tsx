import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { EmployeeTable } from "./employee-table";
import type { EmployeeListItem } from "@/types/employee";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

const mockEmployees: EmployeeListItem[] = [
  {
    id: "emp-1",
    firstName: "Sofia",
    lastName: "Admin",
    workEmail: "sofia@company.com",
    position: "HR Manager",
    department: "HR",
    avatarUrl: null,
    employmentType: { name: "CY" },
    user: { id: "u1", role: "ADMIN" },
  },
  {
    id: "emp-2",
    firstName: "John",
    lastName: "Doe",
    workEmail: "john@company.com",
    position: "Developer",
    department: "Engineering",
    avatarUrl: null,
    employmentType: { name: "GIG" },
    user: { id: "u2", role: "EMPLOYEE" },
  },
  {
    id: "emp-3",
    firstName: "Jane",
    lastName: "Smith",
    workEmail: "jane@company.com",
    position: null,
    department: null,
    avatarUrl: null,
    employmentType: { name: "Contractor" },
    user: { id: "u3", role: "EMPLOYEE" },
  },
];

describe("EmployeeTable", () => {
  it("renders table headers", () => {
    render(<EmployeeTable employees={mockEmployees} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("Employment Type")).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    render(<EmployeeTable employees={mockEmployees} />);

    const rows = screen.getAllByRole("row");
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it("shows employee name with initials avatar", () => {
    render(<EmployeeTable employees={mockEmployees} />);

    expect(screen.getByText("Sofia Admin")).toBeInTheDocument();
    expect(screen.getByText("SA")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("shows employee email", () => {
    render(<EmployeeTable employees={mockEmployees} />);

    expect(screen.getByText("sofia@company.com")).toBeInTheDocument();
    expect(screen.getByText("john@company.com")).toBeInTheDocument();
  });

  it("renders role as badge", () => {
    render(<EmployeeTable employees={mockEmployees} />);

    const adminBadge = screen.getByText("Admin");
    expect(adminBadge.className).toContain("text-[#5856D6]");

    const employeeBadges = screen.getAllByText("Employee");
    expect(employeeBadges[0].className).toContain("text-[#007AFF]");
  });

  it("shows department or dash when null", () => {
    render(<EmployeeTable employees={mockEmployees} />);

    expect(screen.getByText("HR")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    // Jane has null department → shows "—"
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows employment type name", () => {
    render(<EmployeeTable employees={mockEmployees} />);

    expect(screen.getByText("CY")).toBeInTheDocument();
    expect(screen.getByText("GIG")).toBeInTheDocument();
    expect(screen.getByText("Contractor")).toBeInTheDocument();
  });

  it("navigates to employee detail on row click", async () => {
    const user = userEvent.setup();
    render(<EmployeeTable employees={mockEmployees} />);

    const row = screen.getByText("Sofia Admin").closest("tr")!;
    await user.click(row);

    expect(mockPush).toHaveBeenCalledWith("/employees/emp-1");
  });

  it("renders empty table body when no employees", () => {
    render(<EmployeeTable employees={[]} />);

    const rows = screen.getAllByRole("row");
    // Only the header row
    expect(rows).toHaveLength(1);
  });
});
