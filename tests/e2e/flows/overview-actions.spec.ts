import { expect } from "@playwright/test";
import { test, ADMIN_STORAGE } from "../fixtures/auth";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("Overview header actions", () => {
  test("New request navigates to the leave request form", async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/);

    await page.getByRole("button", { name: "New request" }).click();
    await expect(page).toHaveURL(/\/leave\/request/);

    await context.close();
  });

  test("Export report downloads a CSV of the overview data", async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export report" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(
      /^overview-report-\d{4}-\d{2}-\d{2}\.csv$/,
    );

    await context.close();
  });
});
