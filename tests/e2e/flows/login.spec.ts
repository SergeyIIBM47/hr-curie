import { test, expect } from "@playwright/test";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_STORAGE,
} from "../fixtures/auth";

test.describe("Login flow", () => {
  test("successful login redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should redirect away from login
    await page.waitForURL(/.*(?<!\/login)$/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("failed login — wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(ADMIN_EMAIL);
    await page.getByPlaceholder("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // The form redirect completes and the user ends up back on /login
    // (no session was created, so the dashboard redirects back).
    await page.waitForTimeout(5_000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("failed login — validation errors on empty fields", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Form should not navigate away (HTML5 validation or Zod)
    await expect(page).toHaveURL(/\/login/);
  });

  test("protected route redirects to login", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout clears session", async ({ browser, browserName }) => {
    const context = await browser.newContext({
      storageState: ADMIN_STORAGE,
    });
    const page = await context.newPage();

    await page.goto("/profile");
    await expect(page).not.toHaveURL(/\/login/);

    // On mobile the sign-out button is inside the mobile nav sheet
    const isMobile = (page.viewportSize()?.width ?? 1024) < 768;
    if (isMobile) {
      await page.getByLabel("Open navigation").click();
    }

    await page
      .getByLabel("Sign out")
      .and(page.locator(":visible"))
      .click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    // Visiting protected route should redirect back to login
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });
});
