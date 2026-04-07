import { test, expect } from "../fixtures/auth";

test.describe("Mobile navigation", () => {
  test("mobile hamburger opens navigation sheet", async ({
    adminPage: page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Sidebar should be hidden on mobile
    const sidebar = page.locator("aside");
    await expect(sidebar).not.toBeVisible();

    // Click hamburger menu
    await page.getByLabel("Open navigation").click();

    // Navigation sheet should be open with nav links
    await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();

    // Click a nav item → navigates and sheet closes
    await page.getByRole("link", { name: "My Profile" }).click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByLabel("Open navigation")).toBeVisible();
  });
});
