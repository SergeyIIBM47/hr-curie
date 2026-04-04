import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { setupTestDb, teardownTestDb } from "../../helpers/setup-db";
import { userSafeSelect } from "@/lib/employee-select";

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

describe("password security in database", () => {
  it("seeded user has a valid bcrypt hash in the database", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "sofia@company.com" },
    });

    expect(user).not.toBeNull();
    expect(user!.passwordHash).toBeDefined();
    expect(user!.passwordHash).toMatch(/^\$2[aby]?\$.+/);

    const matches = await bcrypt.compare("qwerty123#", user!.passwordHash);
    expect(matches).toBe(true);
  });

  it("querying with userSafeSelect returns no passwordHash", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "sofia@company.com" },
      select: userSafeSelect,
    });

    expect(user).not.toBeNull();
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("role");
    expect(user).not.toHaveProperty("passwordHash");
  });
});
