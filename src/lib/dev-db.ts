import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const ENV_FILE = resolve(process.cwd(), ".env.local");

async function main() {
  console.log("Starting PostgreSQL container...");

  const container = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("hrcrm")
    .withUsername("hrcrm")
    .withPassword("localdev123")
    .withReuse()
    .start();

  const connectionUri = container.getConnectionUri();
  const databaseUrl = `${connectionUri}?connection_limit=5`;
  const port = container.getPort();

  // Update .env.local with the actual DATABASE_URL
  let envContent = "";
  if (existsSync(ENV_FILE)) {
    envContent = readFileSync(ENV_FILE, "utf-8");
  }

  if (envContent.includes("DATABASE_URL=")) {
    envContent = envContent.replace(
      /^DATABASE_URL=.*$/m,
      `DATABASE_URL="${databaseUrl}"`
    );
  } else {
    envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
  }

  writeFileSync(ENV_FILE, envContent, "utf-8");

  console.log(`PostgreSQL running on port ${port}`);
  console.log(`DATABASE_URL written to .env.local`);

  // Run migrations if they exist
  try {
    const migrationsDir = resolve(process.cwd(), "prisma/migrations");
    if (existsSync(migrationsDir)) {
      console.log("Running migrations...");
      execSync("npx prisma migrate dev --skip-generate", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    }
  } catch {
    console.log("No migrations to run yet.");
  }
}

main().catch((err) => {
  console.error("Failed to start dev database:", err);
  process.exit(1);
});
