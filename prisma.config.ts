import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env.local for local development
import { config } from "dotenv";
config({ path: ".env.local" });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
