import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { execSync } from "node:child_process";

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let pool: Pool;

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

  pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  return { container, prisma, databaseUrl };
}

export async function teardownTestDb() {
  if (prisma) {
    await prisma.$disconnect();
  }
  if (pool) {
    await pool.end();
  }
  if (container) {
    await container.stop();
  }
}
