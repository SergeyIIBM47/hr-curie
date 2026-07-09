import { expect } from "@playwright/test";
import { test, ADMIN_STORAGE } from "../fixtures/auth";

test.use({ viewport: { width: 1440, height: 900 } });

test.describe("Sidebar favorites", () => {
  test("shows the two data-backed favorites only", async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/);

    await expect(page.getByRole("link", { name: "Engineering team" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Onboarding pipeline" })).toBeVisible();
    await expect(page.getByText("Q2 hiring plan")).toHaveCount(0);

    await context.close();
  });

  test("Engineering team filters employees by department", async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE });
    const page = await context.newPage();

    await page.goto("/employees?team=engineering");
    await expect(page).not.toHaveURL(/\/login/);

    // Both a desktop table and a mobile card list are rendered; one is CSS-hidden
    await expect(page.getByText("Kai Nguyen").locator("visible=true")).toHaveCount(1);
    await expect(page.getByText("Emma Fischer")).toHaveCount(0);

    await context.close();
  });

  test("Onboarding pipeline shows employees with active onboarding plans", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE });
    const page = await context.newPage();

    await page.goto("/employees?view=onboarding");
    await expect(page).not.toHaveURL(/\/login/);

    await expect(page.getByText("Kai Nguyen").locator("visible=true")).toHaveCount(1);
    await expect(page.getByText("Emma Fischer")).toHaveCount(0);

    await context.close();
  });

  test("employees page does not re-request itself in a loop", async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_STORAGE });
    const page = await context.newPage();

    let employeesRequests = 0;
    page.on("request", (req) => {
      if (new URL(req.url()).pathname === "/employees") employeesRequests++;
    });

    await page.goto("/employees?view=onboarding");
    await expect(page).not.toHaveURL(/\/login/);
    await page.waitForTimeout(3000);

    expect(employeesRequests).toBeLessThanOrEqual(2);

    await context.close();
  });
});
