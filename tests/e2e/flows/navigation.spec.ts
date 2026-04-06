import { test, expect } from "../fixtures/auth";

test.describe("Admin sidebar navigation (desktop)", () => {
  test.beforeEach(async ({ adminPage: page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 1024) < 768,
      "desktop sidebar not visible on mobile",
    );
  });

  test("navigates between pages via sidebar", async ({ adminPage: page }) => {
    await page.goto("/");

    // Click "My Profile" → URL is /profile
    await page.getByRole("link", { name: "My Profile" }).click();
    await expect(page).toHaveURL(/\/profile/);

    // Active item should be highlighted
    const profileLink = page.getByRole("link", { name: "My Profile" });
    await expect(profileLink).toHaveClass(/border-\[#007AFF\]/);

    // Click "Employees" → URL is /employees
    await page.getByRole("link", { name: "Employees" }).click();
    await expect(page).toHaveURL(/\/employees/);
  });

  test("admin sees all nav items", async ({ adminPage: page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Employees" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Leave" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Calendar" })).toBeVisible();
  });
});

test.describe("Employee sidebar navigation (desktop)", () => {
  test.beforeEach(async ({ employeePage: page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 1024) < 768,
      "desktop sidebar not visible on mobile",
    );
  });

  test("employee cannot see admin-only nav items", async ({
    employeePage: page,
  }) => {
    await page.goto("/profile");

    // "My Profile" should be visible
    await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();

    // Admin-only items should NOT be visible
    await expect(
      page.getByRole("link", { name: "Employees" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "Settings" }),
    ).not.toBeVisible();
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile hamburger opens navigation sheet", async ({
    adminPage: page,
  }) => {
    await page.goto("/");

    // Sidebar should be hidden on mobile (it uses md:flex, hidden by default)
    const sidebar = page.locator("aside");
    await expect(sidebar).not.toBeVisible();

    // Click hamburger menu
    await page.getByLabel("Open navigation").click();

    // Navigation sheet should be open with nav links
    await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();

    // Click a nav item
    await page.getByRole("link", { name: "My Profile" }).click();

    // Should navigate and sheet should close
    await expect(page).toHaveURL(/\/profile/);
    // After clicking a link the sheet closes (setOpen(false))
    await expect(page.getByLabel("Open navigation")).toBeVisible();
  });
});
