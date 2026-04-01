import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed employment types
  const defaultTypes = ["CY", "GIG", "Contractor"];
  for (const name of defaultTypes) {
    await prisma.employmentType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed default admin (only if no admin exists)
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!adminExists) {
    const cyType = await prisma.employmentType.findUniqueOrThrow({
      where: { name: "CY" },
    });

    await prisma.user.create({
      data: {
        email: "sofia@company.com",
        passwordHash: await bcrypt.hash("qwerty123#", 12),
        role: Role.ADMIN,
        employee: {
          create: {
            firstName: "Sofia",
            lastName: "Admin",
            employmentTypeId: cyType.id,
            workEmail: "sofia@company.com",
            dateOfBirth: new Date("1990-01-01"),
            actualResidence: "Prague, CZ",
            startYear: 2024,
            position: "HR Manager",
          },
        },
      },
    });

    console.log("Default admin seeded: sofia@company.com / qwerty123#");
  } else {
    console.log("Admin already exists, skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
