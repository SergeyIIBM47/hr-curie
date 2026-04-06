import { test, expect } from "../fixtures/auth";

test.describe("Employee blocked from admin routes", () => {
  test("employee redirected from /employees", async ({
    employeePage: page,
  }) => {
    await page.goto("/employees");
    await expect(page).toHaveURL(/\/profile/);
  });

  test("employee redirected from /employees/new", async ({
    employeePage: page,
  }) => {
    await page.goto("/employees/new");
    await expect(page).toHaveURL(/\/profile/);
  });

  test("employee redirected from /settings", async ({
    employeePage: page,
  }) => {
    // Settings page doesn't exist yet — should redirect to /profile
    // because requireAuth("ADMIN") or a 404 redirect
    await page.goto("/settings");
    // Either redirects to /profile or shows 404 — should not stay on /settings
    const url = page.url();
    expect(url).not.toContain("/settings");
  });
});

test.describe("Admin can access all routes", () => {
  test("admin can access /employees", async ({ adminPage: page }) => {
    await page.goto("/employees");
    await expect(page).toHaveURL(/\/employees/);
    await expect(page.getByRole("link", { name: "Add Employee" })).toBeVisible();
  });

  test("admin can access /employees/new", async ({ adminPage: page }) => {
    await page.goto("/employees/new");
    await expect(page).toHaveURL(/\/employees\/new/);
    // Form should be visible
    await expect(page.getByText("First Name")).toBeVisible();
  });

  test("admin can access /profile", async ({ adminPage: page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile/);
    await expect(
      page.getByRole("heading", { name: "Sofia Admin" }),
    ).toBeVisible();
  });
});
