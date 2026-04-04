import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { setupTestDb, teardownTestDb } from "../../helpers/setup-db";
import { loginSchema } from "@/lib/validations/auth";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  const db = await setupTestDb();
  prisma = db.prisma;
  container = db.container;
}, 120_000);

afterAll(async () => {
  await teardownTestDb();
});

/**
 * These tests replicate the authorize() logic from src/lib/auth.ts
 * against a real database, since the authorize function is embedded
 * in the NextAuth config and can't be imported directly.
 */

async function authorize(credentials: {
  email?: string;
  password?: string;
}) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: {
      employee: {
        select: { firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  if (!user) return null;

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.employee
      ? `${user.employee.firstName} ${user.employee.lastName}`
      : user.email,
    image: user.employee?.avatarUrl ?? undefined,
  };
}

describe("authorize()", () => {
  it("returns user object for valid credentials", async () => {
    const result = await authorize({
      email: "sofia@company.com",
      password: "qwerty123#",
    });

    expect(result).not.toBeNull();
    expect(result!.email).toBe("sofia@company.com");
    expect(result!.role).toBe(Role.ADMIN);
    expect(result!.name).toBe("Sofia Admin");
    expect(result!.id).toBeDefined();
  });

  it("returns null for wrong password", async () => {
    const result = await authorize({
      email: "sofia@company.com",
      password: "wrongpassword",
    });

    expect(result).toBeNull();
  });

  it("returns null for non-existent email", async () => {
    const result = await authorize({
      email: "nobody@company.com",
      password: "qwerty123#",
    });

    expect(result).toBeNull();
  });

  it("returns null for invalid email format", async () => {
    const result = await authorize({
      email: "not-an-email",
      password: "qwerty123#",
    });

    expect(result).toBeNull();
  });

  it("returns null for missing password", async () => {
    const result = await authorize({
      email: "sofia@company.com",
      password: "",
    });

    expect(result).toBeNull();
  });

  it("returns null for missing email", async () => {
    const result = await authorize({
      email: "",
      password: "qwerty123#",
    });

    expect(result).toBeNull();
  });

  it("never includes passwordHash in the returned object", async () => {
    const result = await authorize({
      email: "sofia@company.com",
      password: "qwerty123#",
    });

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("password_hash");
  });

  it("returns correct name from employee relation", async () => {
    const result = await authorize({
      email: "sofia@company.com",
      password: "qwerty123#",
    });

    expect(result!.name).toBe("Sofia Admin");
  });

  it("works with a newly created employee user", async () => {
    const hash = await bcrypt.hash("newpass123", 12);
    const empType = await prisma.employmentType.findFirstOrThrow();

    const user = await prisma.user.create({
      data: {
        email: "newuser@company.com",
        passwordHash: hash,
        role: Role.EMPLOYEE,
        employee: {
          create: {
            firstName: "New",
            lastName: "User",
            workEmail: "newuser@company.com",
            employmentTypeId: empType.id,
            dateOfBirth: new Date("1995-01-01"),
            actualResidence: "Berlin, DE",
            startYear: 2025,
          },
        },
      },
    });

    const result = await authorize({
      email: "newuser@company.com",
      password: "newpass123",
    });

    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);
    expect(result!.role).toBe(Role.EMPLOYEE);
    expect(result!.name).toBe("New User");
  });
});
