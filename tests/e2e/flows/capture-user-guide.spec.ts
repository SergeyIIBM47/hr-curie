/**
 * User-guide screenshot capture.
 *
 * Visits every screen (admin + employee perspectives) and writes full-page
 * PNGs into `docs/user-guide/screenshots/`. Intended to be invoked manually
 * whenever the documentation needs to be refreshed:
 *
 *   npx playwright test tests/e2e/flows/capture-user-guide.spec.ts \
 *     --project=chromium
 *
 * Not meant for CI — this is a documentation tool, not an assertion suite.
 */
import path from "path";
import fs from "fs";
import { test, expect } from "../fixtures/auth";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  EMPLOYEE_EMAIL,
  EMPLOYEE_PASSWORD,
} from "../fixtures/auth";
import type { Page } from "@playwright/test";

const SCREENSHOTS_DIR = path.resolve("docs/user-guide/screenshots");

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function shot(page: Page, name: string): Promise<void> {
  // Give the dashboard layout / client components a moment to paint.
  // `networkidle` can hang on pages with SWR polling, so only wait briefly.
  await page
    .waitForLoadState("networkidle", { timeout: 3000 })
    .catch(() => undefined);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${name}.png`),
    fullPage: true,
  });
}

/** Locator scoped to the page body (avoids topbar heading collisions). */
function mainHeading(page: Page, name: string | RegExp) {
  return page.locator("#main-content").getByRole("heading", { name });
}

test.use({ viewport: { width: 1440, height: 900 } });

/* ─────────────────────────── Public / login ────────────────────────── */

test.describe("Public screens", () => {
  test("login page", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: undefined });
    const page = await ctx.newPage();
    await page.goto("/login");
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await shot(page, "01-login");

    // Login with credentials filled in (still-unsubmitted state)
    await page.getByPlaceholder("Email").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Password").fill(ADMIN_PASSWORD);
    await shot(page, "02-login-filled");
    await ctx.close();
  });
});

/* ─────────────────────────── Admin screens ─────────────────────────── */

test.describe("Admin screens", () => {
  test("dashboard (admin)", async ({ adminPage }) => {
    await adminPage.goto("/");
    await expect(
      adminPage.locator('[data-curie="page-greeting"]'),
    ).toBeVisible();
    await shot(adminPage, "10-admin-dashboard");
  });

  test("employees list", async ({ adminPage }) => {
    await adminPage.goto("/employees", { waitUntil: "domcontentloaded" });
    await expect(
      adminPage.getByRole("link", { name: "Add Employee" }).first(),
    ).toBeVisible({ timeout: 10_000 });
    await shot(adminPage, "11-admin-employees-list");
  });

  test("employees search", async ({ adminPage }) => {
    await adminPage.goto("/employees", { waitUntil: "domcontentloaded" });
    const search = adminPage.getByPlaceholder(/search/i).first();
    if (await search.isVisible({ timeout: 5000 }).catch(() => false)) {
      await search.fill("Test");
      await adminPage.waitForTimeout(800);
      await shot(adminPage, "12-admin-employees-search");
    }
  });

  test("add employee form", async ({ adminPage }) => {
    await adminPage.goto("/employees/new");
    await expect(adminPage.getByText("First Name")).toBeVisible();
    await shot(adminPage, "13-admin-employee-create");
  });

  test("employee profile (detail)", async ({ adminPage }) => {
    await adminPage.goto("/employees");
    const firstRow = adminPage.locator("table tbody tr a").first();
    const detailLink = (await firstRow.count())
      ? firstRow
      : adminPage.locator('a[href^="/employees/"]').first();
    if (await detailLink.count()) {
      await detailLink.click();
      await adminPage.waitForURL(/\/employees\/[^/]+$/);
      await shot(adminPage, "14-admin-employee-detail");

      // Edit screen (derived from the detail URL)
      const url = new URL(adminPage.url());
      await adminPage.goto(`${url.pathname}/edit`);
      await shot(adminPage, "15-admin-employee-edit");
    }
  });

  test("leave history (admin view)", async ({ adminPage }) => {
    await adminPage.goto("/leave");
    await expect(mainHeading(adminPage, "Leave")).toBeVisible();
    await shot(adminPage, "16-admin-leave-history");
  });

  test("leave manage queue", async ({ adminPage }) => {
    await adminPage.goto("/leave/manage");
    await shot(adminPage, "17-admin-leave-manage");
  });

  test("calendar (admin)", async ({ adminPage }) => {
    await adminPage.goto("/calendar");
    await expect(mainHeading(adminPage, "Calendar")).toBeVisible();
    await shot(adminPage, "18-admin-calendar");

    // Open the schedule-meeting dialog if available
    const scheduleBtn = adminPage.getByRole("button", {
      name: /Schedule Meeting/i,
    });
    if (await scheduleBtn.isVisible().catch(() => false)) {
      await scheduleBtn.click();
      await adminPage.waitForTimeout(400);
      await shot(adminPage, "19-admin-calendar-schedule-dialog");
    }
  });

  test("settings (employment types)", async ({ adminPage }) => {
    await adminPage.goto("/settings");
    await expect(mainHeading(adminPage, "Settings")).toBeVisible();
    await shot(adminPage, "20-admin-settings");
  });

  test("own profile (admin)", async ({ adminPage }) => {
    await adminPage.goto("/profile");
    await shot(adminPage, "21-admin-profile");
  });
});

/* ───────────────────────── Employee screens ────────────────────────── */

test.describe("Employee screens", () => {
  test("dashboard (employee)", async ({ employeePage }) => {
    await employeePage.goto("/");
    await shot(employeePage, "30-employee-dashboard");
  });

  test("my leave history", async ({ employeePage }) => {
    await employeePage.goto("/leave");
    await shot(employeePage, "31-employee-leave-history");
  });

  test("request leave form", async ({ employeePage }) => {
    await employeePage.goto("/leave/request");
    await expect(mainHeading(employeePage, "Request Leave")).toBeVisible();
    await shot(employeePage, "32-employee-leave-request");
  });

  test("calendar (employee)", async ({ employeePage }) => {
    await employeePage.goto("/calendar");
    await shot(employeePage, "33-employee-calendar");
  });

  test("my profile", async ({ employeePage }) => {
    await employeePage.goto("/profile");
    await shot(employeePage, "34-employee-profile");
  });
});

/* ──────────────────────────── Mobile view ──────────────────────────── */

test.describe("Mobile views", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("login (mobile)", async ({ browser }) => {
    const ctx = await browser.newContext({
      storageState: undefined,
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();
    await page.goto("/login");
    await shot(page, "40-mobile-login");
    await ctx.close();
  });

  test("dashboard (mobile, admin)", async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await adminPage.goto("/");
    await shot(adminPage, "41-mobile-admin-dashboard");
  });

  test("employees list (mobile, admin)", async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await adminPage.goto("/employees", { waitUntil: "domcontentloaded" });
    await mainHeading(adminPage, "Employees")
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => undefined);
    await shot(adminPage, "42-mobile-admin-employees");
  });
});
