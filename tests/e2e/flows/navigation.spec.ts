import { test, expect } from "../fixtures/auth";

test.describe("Admin sidebar navigation", () => {
  test("navigates between pages via sidebar", async ({ adminPage: page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "My Profile" }).click();
    await expect(page).toHaveURL(/\/profile/);

    const profileLink = page.getByRole("link", { name: "My Profile" });
    await expect(profileLink).toHaveClass(/border-\[#007AFF\]/);

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

test.describe("Employee sidebar navigation", () => {
  test("employee cannot see admin-only nav items", async ({
    employeePage: page,
  }) => {
    await page.goto("/profile");

    await expect(page.getByRole("link", { name: "My Profile" })).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Employees" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "Settings" }),
    ).not.toBeVisible();
  });
});
