import { describe, it, expect } from "vitest";
import { loginSchema } from "./auth";

describe("loginSchema", () => {
  it("passes with valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@test.com");
      expect(result.data.password).toBe("password123");
    }
  });

  it("fails when email is missing", () => {
    const result = loginSchema.safeParse({ password: "password123" });
    expect(result.success).toBe(false);
  });

  it("fails with invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("fails when password is missing", () => {
    const result = loginSchema.safeParse({ email: "test@test.com" });
    expect(result.success).toBe(false);
  });

  it("fails with empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("strips extra fields", () => {
    const result = loginSchema.safeParse({
      email: "test@test.com",
      password: "password123",
      extra: "should-be-stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("extra" in result.data).toBe(false);
    }
  });
});
