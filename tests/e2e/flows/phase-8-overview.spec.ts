import { expect, type Page } from "@playwright/test";
import path from "path";
import { test, ADMIN_STORAGE, EMPLOYEE_STORAGE } from "../fixtures/auth";

const SCREENSHOT_DIR = path.resolve("test-results/phase-8.5");
const FROZEN_NOW = "2026-05-26T09:35:00.000Z";

test.use({ viewport: { width: 1440, height: 900 } });

async function freezeClock(page: Page): Promise<void> {
  await page.addInitScript((frozenIso: string) => {
    const frozen = new Date(frozenIso).getTime();
    const OriginalDate = Date;
    class FrozenDate extends OriginalDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length === 0) {
          super(frozen);
        } else {
          // @ts-expect-error spread to base
          super(...args);
        }
      }
      static now() {
        return frozen;
      }
    }
    // @ts-expect-error override Date in browser scope
    globalThis.Date = FrozenDate;
  }, FROZEN_NOW);
}

test.describe("Phase 8.5 — overview rebuild", () => {
  test("/ admin overview: KPI labels, donut, today highlight", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE });
    const page = await context.newPage();
    await freezeClock(page);

    const response = await page.goto("/", { waitUntil: "networkidle" });
    expect(response?.status(), "/ should respond 200").toBe(200);
    await expect(page).not.toHaveURL(/\/login/);

    // 1. KPI labels render
    const kpiLabels = ["Headcount", "Open roles", "On leave today", "Pending approvals"];
    for (const label of kpiLabels) {
      await expect(
        page.locator('[data-curie="kpi-card"]', { hasText: label }).first(),
      ).toBeVisible();
    }

    // 2. Workforce composition donut: 4 slices, dasharray fragments combined ≈ 100
    const donut = page.locator('[data-curie="workforce-donut"]').first();
    await expect(donut).toBeVisible();
    const sliceDasharrays = await donut.locator("svg circle[stroke-dasharray]").evaluateAll(
      (els) => els.map((el) => el.getAttribute("stroke-dasharray") ?? ""),
    );
    expect(sliceDasharrays.length, "donut should have 4 weighted slices").toBe(4);
    const totalPercent = sliceDasharrays
      .map((da) => {
        const [head] = da.split(" ");
        return Number(head);
      })
      .reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
    expect(totalPercent, "slice percents should sum to ~100").toBeGreaterThan(95);
    expect(totalPercent).toBeLessThan(105);

    // 3. Mini calendar highlights today
    const cal = page.locator('[data-curie="mini-calendar"]').first();
    await expect(cal).toBeVisible();
    const todayCell = cal.locator("[data-curie-today]").first();
    await expect(todayCell, "mini-calendar should mark today").toBeVisible();

    // 4. Screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "overview-admin-1440.png"),
      fullPage: true,
    });

    await context.close();
  });

  test("/ employee overview: greeting + quick actions", async ({ browser }) => {
    const context = await browser.newContext({ storageState: EMPLOYEE_STORAGE });
    const page = await context.newPage();
    await freezeClock(page);

    const response = await page.goto("/", { waitUntil: "networkidle" });
    expect(response?.status(), "/ should respond 200").toBe(200);
    await expect(page).not.toHaveURL(/\/login/);

    await expect(
      page.locator('[data-curie="page-greeting"]'),
      "employee greeting should render",
    ).toBeVisible();

    for (const label of ["Request leave", "Calendar", "My profile"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }

    // Mini calendar still renders for employee via rail slot
    const cal = page.locator('[data-curie="mini-calendar"]').first();
    await expect(cal).toBeVisible();
    const todayCell = cal.locator("[data-curie-today]").first();
    await expect(todayCell, "mini-calendar should mark today").toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "overview-employee-1440.png"),
      fullPage: true,
    });

    await context.close();
  });
});
