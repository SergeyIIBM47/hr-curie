import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const isLocalhost =
  process.env.DATABASE_URL?.includes("localhost") ||
  process.env.DATABASE_URL?.includes("127.0.0.1");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalhost ? undefined : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

async function main() {
  const defaultTypes = ["CY", "GIG", "Contractor", "Intern"];
  for (const name of defaultTypes) {
    await prisma.employmentType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const cyType = await prisma.employmentType.findUniqueOrThrow({
    where: { name: "CY" },
  });
  const gigType = await prisma.employmentType.findUniqueOrThrow({
    where: { name: "GIG" },
  });
  const contractorType = await prisma.employmentType.findUniqueOrThrow({
    where: { name: "Contractor" },
  });
  const internType = await prisma.employmentType.findUniqueOrThrow({
    where: { name: "Intern" },
  });

  let adminUser = await prisma.user.findUnique({
    where: { email: "sofia@company.com" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
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
            startDate: new Date("2024-01-15"),
            position: "HR Manager",
          },
        },
      },
    });
    console.log("Default admin seeded: sofia@company.com / qwerty123#");
  } else {
    console.log("Admin already exists, skipping admin seed.");
  }

  // --- Lina Okafor: anniversary in next 14 days (3 years ago today + 7) ---
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const anniversaryTarget = new Date(today);
  anniversaryTarget.setUTCDate(anniversaryTarget.getUTCDate() + 7);
  anniversaryTarget.setUTCFullYear(anniversaryTarget.getUTCFullYear() - 3);

  let linaUser = await prisma.user.findUnique({
    where: { email: "lina.okafor@company.com" },
  });
  if (!linaUser) {
    linaUser = await prisma.user.create({
      data: {
        email: "lina.okafor@company.com",
        passwordHash: await bcrypt.hash("qwerty123#", 12),
        role: Role.EMPLOYEE,
        employee: {
          create: {
            firstName: "Lina",
            lastName: "Okafor",
            employmentTypeId: contractorType.id,
            workEmail: "lina.okafor@company.com",
            dateOfBirth: new Date("1992-05-12"),
            actualResidence: "Lagos, NG",
            startYear: anniversaryTarget.getUTCFullYear(),
            startDate: anniversaryTarget,
            position: "Senior Designer",
            department: "Design",
          },
        },
      },
    });
  }

  // --- New hire for onboarding plan ---
  let newHireUser = await prisma.user.findUnique({
    where: { email: "kai.nguyen@company.com" },
  });
  if (!newHireUser) {
    newHireUser = await prisma.user.create({
      data: {
        email: "kai.nguyen@company.com",
        passwordHash: await bcrypt.hash("qwerty123#", 12),
        role: Role.EMPLOYEE,
        employee: {
          create: {
            firstName: "Kai",
            lastName: "Nguyen",
            employmentTypeId: cyType.id,
            workEmail: "kai.nguyen@company.com",
            dateOfBirth: new Date("1996-09-04"),
            actualResidence: "Berlin, DE",
            startYear: today.getUTCFullYear(),
            startDate: daysFromNow(-3),
            position: "Software Engineer",
            department: "Engineering",
          },
        },
      },
    });
  }

  // --- Emma (GIG) + Tomas (Intern): keep all 4 employment types populated
  // so the overview workforce donut renders 4 slices ---
  const emmaUser = await prisma.user.findUnique({
    where: { email: "emma.fischer@company.com" },
  });
  if (!emmaUser) {
    await prisma.user.create({
      data: {
        email: "emma.fischer@company.com",
        passwordHash: await bcrypt.hash("qwerty123#", 12),
        role: Role.EMPLOYEE,
        employee: {
          create: {
            firstName: "Emma",
            lastName: "Fischer",
            employmentTypeId: gigType.id,
            workEmail: "emma.fischer@company.com",
            dateOfBirth: new Date("1994-11-23"),
            actualResidence: "Vienna, AT",
            startYear: 2025,
            startDate: new Date("2025-03-03"),
            position: "Marketing Specialist",
            department: "Marketing",
          },
        },
      },
    });
  }

  const tomasUser = await prisma.user.findUnique({
    where: { email: "tomas.marek@company.com" },
  });
  if (!tomasUser) {
    await prisma.user.create({
      data: {
        email: "tomas.marek@company.com",
        passwordHash: await bcrypt.hash("qwerty123#", 12),
        role: Role.EMPLOYEE,
        employee: {
          create: {
            firstName: "Tomas",
            lastName: "Marek",
            employmentTypeId: internType.id,
            workEmail: "tomas.marek@company.com",
            dateOfBirth: new Date("2002-02-17"),
            actualResidence: "Prague, CZ",
            startYear: today.getUTCFullYear(),
            startDate: daysFromNow(-30),
            position: "Engineering Intern",
            department: "Engineering",
          },
        },
      },
    });
  }

  const kaiEmployee = await prisma.employee.findUniqueOrThrow({
    where: { userId: newHireUser.id },
    select: { id: true },
  });

  // --- Announcements (idempotent: only insert if none exist) ---
  const announcementCount = await prisma.announcement.count();
  if (announcementCount === 0) {
    await prisma.announcement.createMany({
      data: [
        {
          authorId: adminUser.id,
          title: "Updated remote work policy",
          body: "Effective next month, remote-first Tuesdays return. Office Mondays & Thursdays remain anchor days.",
          tag: "POLICY",
        },
        {
          authorId: adminUser.id,
          title: "Welcome Kai to Engineering",
          body: "Kai Nguyen joins the platform team this week. Say hi in #engineering and grab a coffee.",
          tag: "TEAM",
        },
        {
          authorId: adminUser.id,
          title: "Benefits enrollment closes Friday",
          body: "Final reminder to confirm health, dental, and 401(k) elections before the window closes.",
          tag: "HR",
        },
      ],
    });
  }

  // --- Onboarding plan for Kai ---
  const existingPlan = await prisma.onboardingPlan.findUnique({
    where: { employeeId: kaiEmployee.id },
  });
  if (!existingPlan) {
    await prisma.onboardingPlan.create({
      data: {
        employeeId: kaiEmployee.id,
        startDate: daysFromNow(-3),
        status: "ON_TRACK",
        steps: {
          create: [
            { ord: 1, label: "Offer signed", status: "DONE", completedAt: daysFromNow(-10) },
            { ord: 2, label: "Paperwork", status: "DONE", completedAt: daysFromNow(-4) },
            { ord: 3, label: "Equipment & access", status: "CURRENT" },
            { ord: 4, label: "Day-one welcome", status: "UPCOMING" },
            { ord: 5, label: "30-day review", status: "UPCOMING" },
          ],
        },
      },
    });
  }

  // --- Job requisitions ---
  const jobCount = await prisma.jobRequisition.count();
  if (jobCount === 0) {
    await prisma.jobRequisition.createMany({
      data: [
        { title: "Senior Product Designer", department: "Design", location: "Remote (EU)", priority: true },
        { title: "Staff Software Engineer", department: "Engineering", location: "Berlin / Remote", priority: true },
        { title: "People Operations Partner", department: "People", location: "Prague" },
        { title: "Sales Development Rep", department: "Sales", location: "London" },
        { title: "Data Analyst", department: "Analytics", location: "Remote (EU)" },
        { title: "Customer Success Manager", department: "CX", location: "Remote (EU)" },
        { title: "Engineering Manager", department: "Engineering", location: "Berlin" },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
