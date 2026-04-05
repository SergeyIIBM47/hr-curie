import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { EmployeeForm } from "./employee-form";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const employmentTypes = [
  { id: "et-1", name: "CY" },
  { id: "et-2", name: "GIG" },
  { id: "et-3", name: "Contractor" },
];

beforeEach(() => {
  vi.restoreAllMocks();
  mockPush.mockReset();
  mockRefresh.mockReset();
  fetchMock.mockReset();
  global.fetch = fetchMock;

  // Re-establish router mock after restoreAllMocks
  vi.mocked(useRouter).mockReturnValue({
    push: mockPush,
    replace: vi.fn(),
    refresh: mockRefresh,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as ReturnType<typeof useRouter>);
});

describe("EmployeeForm — Create mode", () => {
  it("renders all required field inputs", () => {
    render(<EmployeeForm employmentTypes={employmentTypes} />);

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Employment Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of Birth")).toBeInTheDocument();
    expect(screen.getByLabelText("Actual Residence")).toBeInTheDocument();
    expect(screen.getByLabelText("Start Year")).toBeInTheDocument();
  });

  it("renders optional field inputs", () => {
    render(<EmployeeForm employmentTypes={employmentTypes} />);

    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Position")).toBeInTheDocument();
    expect(screen.getByLabelText("Department")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Health Insurance")).toBeInTheDocument();
    expect(screen.getByLabelText("Education")).toBeInTheDocument();
    expect(screen.getByLabelText("Certifications")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("T-Shirt Size")).toBeInTheDocument();
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<EmployeeForm employmentTypes={employmentTypes} />);

    await user.click(
      screen.getByRole("button", { name: /create employee/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
  });

  it("calls fetch with POST and correct body on valid submit", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { id: "new-1" } }),
    });

    render(<EmployeeForm employmentTypes={employmentTypes} />);

    await user.type(screen.getByLabelText("First Name"), "Test");
    await user.type(screen.getByLabelText("Last Name"), "User");
    await user.type(screen.getByLabelText("Work Email"), "test@company.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.selectOptions(screen.getByLabelText("Employment Type"), "et-1");
    await user.type(screen.getByLabelText("Date of Birth"), "1995-06-15");
    await user.type(screen.getByLabelText("Actual Residence"), "Prague, CZ");
    await user.clear(screen.getByLabelText("Start Year"));
    await user.type(screen.getByLabelText("Start Year"), "2024");

    await user.click(
      screen.getByRole("button", { name: /create employee/i }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.firstName).toBe("Test");
    expect(body.lastName).toBe("User");
    expect(body.workEmail).toBe("test@company.com");
    expect(body.password).toBe("password123");
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();

    let resolveSubmit!: (value: unknown) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<EmployeeForm employmentTypes={employmentTypes} />);

    await user.type(screen.getByLabelText("First Name"), "Test");
    await user.type(screen.getByLabelText("Last Name"), "User");
    await user.type(screen.getByLabelText("Work Email"), "t@c.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.selectOptions(screen.getByLabelText("Employment Type"), "et-1");
    await user.type(screen.getByLabelText("Date of Birth"), "1995-06-15");
    await user.type(screen.getByLabelText("Actual Residence"), "Prague");
    await user.clear(screen.getByLabelText("Start Year"));
    await user.type(screen.getByLabelText("Start Year"), "2024");

    const submitButton = screen.getByRole("button", {
      name: /create employee/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    expect(screen.queryByText("Create Employee")).not.toBeInTheDocument();

    resolveSubmit({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
  });

  it("populates employment type dropdown from props", () => {
    render(<EmployeeForm employmentTypes={employmentTypes} />);

    const select = screen.getByLabelText("Employment Type");
    expect(select).toBeInTheDocument();

    const options = select.querySelectorAll("option");
    // "Select type..." placeholder + 3 types
    expect(options).toHaveLength(4);
    expect(options[1]).toHaveTextContent("CY");
    expect(options[2]).toHaveTextContent("GIG");
    expect(options[3]).toHaveTextContent("Contractor");
  });
});

describe("EmployeeForm — Edit mode", () => {
  const defaultValues = {
    firstName: "John",
    lastName: "Doe",
    workEmail: "john@company.com",
    employmentTypeId: "et-1",
    dateOfBirth: "1992-05-15",
    actualResidence: "Berlin, DE",
    startYear: 2023,
    position: "Developer",
    department: "Engineering",
  };

  it("pre-fills fields with existing employee data", () => {
    render(
      <EmployeeForm
        mode="edit"
        employmentTypes={employmentTypes}
        defaultValues={defaultValues}
        employeeId="emp-1"
      />,
    );

    expect(screen.getByLabelText("First Name")).toHaveValue("John");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Position")).toHaveValue("Developer");
    expect(screen.getByLabelText("Department")).toHaveValue("Engineering");
  });

  it("does not show password field in edit mode", () => {
    render(
      <EmployeeForm
        mode="edit"
        employmentTypes={employmentTypes}
        defaultValues={defaultValues}
        employeeId="emp-1"
      />,
    );

    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("shows work email as read-only in edit mode", () => {
    render(
      <EmployeeForm
        mode="edit"
        employmentTypes={employmentTypes}
        defaultValues={defaultValues}
        employeeId="emp-1"
      />,
    );

    const emailInput = screen.getByLabelText("Work Email");
    expect(emailInput).toHaveValue("john@company.com");
    expect(emailInput).toHaveAttribute("readOnly");
  });

  it("calls PUT on submit in edit mode", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });

    render(
      <EmployeeForm
        mode="edit"
        employmentTypes={employmentTypes}
        defaultValues={defaultValues}
        employeeId="emp-1"
      />,
    );

    await user.clear(screen.getByLabelText("First Name"));
    await user.type(screen.getByLabelText("First Name"), "Updated");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/employees/emp-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });
  });

  it("cancel button navigates back to employee detail", async () => {
    const user = userEvent.setup();
    render(
      <EmployeeForm
        mode="edit"
        employmentTypes={employmentTypes}
        defaultValues={defaultValues}
        employeeId="emp-1"
      />,
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith("/employees/emp-1");
  });

  it("shows 'Save Changes' as submit button text", () => {
    render(
      <EmployeeForm
        mode="edit"
        employmentTypes={employmentTypes}
        defaultValues={defaultValues}
        employeeId="emp-1"
      />,
    );

    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });
});
