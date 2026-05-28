-- CreateEnum
CREATE TYPE "AnnouncementTag" AS ENUM ('POLICY', 'TEAM', 'HR', 'EVENT');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'BLOCKED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('DONE', 'CURRENT', 'UPCOMING');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'PAUSED', 'FILLED');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "start_date" DATE;

-- Backfill start_date from existing start_year so historical rows have anniversary data
UPDATE "employees" SET "start_date" = MAKE_DATE("start_year", 1, 1) WHERE "start_date" IS NULL;

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tag" "AnnouncementTag" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_plans" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'ON_TRACK',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_steps" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "ord" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'UPCOMING',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "onboarding_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requisitions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filled_at" TIMESTAMP(3),
    "filled_by_id" TEXT,

    CONSTRAINT "job_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_created_at_idx" ON "announcements"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_plans_employee_id_key" ON "onboarding_plans"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_steps_plan_id_ord_key" ON "onboarding_steps"("plan_id", "ord");

-- CreateIndex
CREATE UNIQUE INDEX "job_requisitions_filled_by_id_key" ON "job_requisitions"("filled_by_id");

-- CreateIndex
CREATE INDEX "job_requisitions_status_idx" ON "job_requisitions"("status");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_plans" ADD CONSTRAINT "onboarding_plans_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_steps" ADD CONSTRAINT "onboarding_steps_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "onboarding_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
