import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { employeeDetailSelect, employeeListSelect, userSafeSelect } from "./employee-select";

describe("password hashing", () => {
  it("bcrypt hash matches the original password", async () => {
    const password = "qwerty123#";
    const hash = await bcrypt.hash(password, 12);

    const matches = await bcrypt.compare(password, hash);
    expect(matches).toBe(true);
  });

  it("bcrypt hash does NOT match a different password", async () => {
    const hash = await bcrypt.hash("correct-password", 12);

    const matches = await bcrypt.compare("wrong-password", hash);
    expect(matches).toBe(false);
  });

  it("different passwords produce different hashes", async () => {
    const hash1 = await bcrypt.hash("password1", 12);
    const hash2 = await bcrypt.hash("password2", 12);

    expect(hash1).not.toBe(hash2);
  });

  it("same password produces different hashes (salt)", async () => {
    const hash1 = await bcrypt.hash("same-password", 12);
    const hash2 = await bcrypt.hash("same-password", 12);

    expect(hash1).not.toBe(hash2);
    expect(await bcrypt.compare("same-password", hash1)).toBe(true);
    expect(await bcrypt.compare("same-password", hash2)).toBe(true);
  });
});

describe("passwordHash never leaks in selects", () => {
  it("userSafeSelect does not include passwordHash", () => {
    expect(userSafeSelect).not.toHaveProperty("passwordHash");
    expect(userSafeSelect).not.toHaveProperty("password_hash");
  });

  it("employeeListSelect user sub-select does not include passwordHash", () => {
    const userSelect = employeeListSelect.user.select;
    expect(userSelect).not.toHaveProperty("passwordHash");
    expect(userSelect).not.toHaveProperty("password_hash");
  });

  it("employeeDetailSelect user sub-select does not include passwordHash", () => {
    const userSelect = employeeDetailSelect.user.select;
    expect(userSelect).not.toHaveProperty("passwordHash");
    expect(userSelect).not.toHaveProperty("password_hash");
  });
});
