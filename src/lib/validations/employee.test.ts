import { describe, it, expect } from "vitest";
import { createEmployeeSchema, updateEmployeeSchema } from "./employee";

const validCreateInput = {
  firstName: "Test",
  lastName: "User",
  workEmail: "test@company.com",
  password: "testpass123",
  employmentTypeId: "type-001",
  dateOfBirth: "1995-06-15",
  actualResidence: "Prague, CZ",
  startYear: 2024,
};

describe("createEmployeeSchema", () => {
  it("passes with all required fields", () => {
    const result = createEmployeeSchema.safeParse(validCreateInput);
    expect(result.success).toBe(true);
  });

  it("fails when firstName is missing", () => {
    const { firstName, ...rest } = validCreateInput;
    const result = createEmployeeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when firstName is empty", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      firstName: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email format", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      workEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("fails with short password (< 8 chars)", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid date of birth format", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      dateOfBirth: "15-06-1995",
    });
    expect(result.success).toBe(false);
  });

  it("fails with invalid date of birth value", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      dateOfBirth: "1995-13-40",
    });
    expect(result.success).toBe(false);
  });

  it("passes when optional fields are omitted", () => {
    const result = createEmployeeSchema.safeParse(validCreateInput);
    expect(result.success).toBe(true);
  });

  it("passes when optional fields are included", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      phone: "+420123456789",
      position: "Developer",
      department: "Engineering",
      location: "Prague",
      tshirtSize: "M",
    });
    expect(result.success).toBe(true);
  });

  it("transforms empty optional strings to undefined", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      phone: "",
      position: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeUndefined();
      expect(result.data.position).toBeUndefined();
    }
  });

  it("fails with invalid startYear (too low)", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      startYear: 1800,
    });
    expect(result.success).toBe(false);
  });

  it("fails with non-integer startYear", () => {
    const result = createEmployeeSchema.safeParse({
      ...validCreateInput,
      startYear: 2024.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateEmployeeSchema", () => {
  it("passes with partial update (only firstName)", () => {
    const result = updateEmployeeSchema.safeParse({ firstName: "Updated" });
    expect(result.success).toBe(true);
  });

  it("passes with empty object (all fields optional)", () => {
    const result = updateEmployeeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("fails with empty firstName (min 1 required)", () => {
    const result = updateEmployeeSchema.safeParse({ firstName: "" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid startYear type", () => {
    const result = updateEmployeeSchema.safeParse({ startYear: "not-a-number" });
    expect(result.success).toBe(false);
  });

  it("transforms empty nullable strings to null", () => {
    const result = updateEmployeeSchema.safeParse({
      phone: "",
      position: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.position).toBeNull();
    }
  });

  it("passes with valid partial fields", () => {
    const result = updateEmployeeSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      startYear: 2025,
    });
    expect(result.success).toBe(true);
  });
});
