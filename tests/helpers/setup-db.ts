import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

export async function setupTestDb() {
  container = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("hrcrm_test")
    .withUsername("hrcrm_test")
    .withPassword("test123")
    .start();

  const databaseUrl = container.getConnectionUri();

  // Run migrations
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });

  // Run seed if available
  try {
    execSync("npx prisma db seed", {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "inherit",
    });
  } catch {
    // Seed may not exist yet
  }

  prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
  });

  return { container, prisma, databaseUrl };
}

export async function teardownTestDb() {
  if (prisma) {
    await prisma.$disconnect();
  }
  if (container) {
    await container.stop();
  }
}
