import { test, expect } from "../fixtures/auth";

test.describe("Role toggle", () => {
  test("admin toggles employee role", async ({ adminPage: page }) => {
    // Navigate to the Test Employee profile
    await page.goto("/employees");
    await page.getByRole("table").getByText("Test Employee").click();
    await expect(page).toHaveURL(/\/employees\/.+/);

    const main = page.getByRole("main");

    // Should see "Admin Access" toggle (role toggle component)
    await expect(main.getByText("Admin Access")).toBeVisible();

    // Current role is EMPLOYEE — toggle should be unchecked
    const toggle = main.getByRole("switch");
    await expect(toggle).not.toBeChecked();

    // Click toggle → opens confirmation dialog
    await toggle.click();
    await expect(page.getByText("Change Role")).toBeVisible();
    await expect(page.getByText(/grant.*admin access/i)).toBeVisible();

    // Confirm
    await page.getByRole("button", { name: "Confirm" }).click();

    // Role badge should update to Admin
    await expect(main.locator("span.uppercase").first()).toHaveText("Admin", {
      timeout: 10_000,
    });

    // Refresh to verify persistence
    await page.reload();
    await expect(main.getByRole("switch")).toBeChecked();

    // Revert: toggle back to Employee
    await main.getByRole("switch").click();
    await expect(page.getByText(/remove.*admin access/i)).toBeVisible();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(main.locator("span.uppercase").first()).toHaveText(
      "Employee",
      { timeout: 10_000 },
    );
  });

  test("cannot toggle own role — shows error toast", async ({
    adminPage: page,
  }) => {
    // Navigate to admin's own employee profile
    await page.goto("/employees");
    await page.getByRole("table").getByText("Sofia Admin").click();
    await expect(page).toHaveURL(/\/employees\/.+/);

    const main = page.getByRole("main");
    const toggle = main.getByRole("switch");

    // Toggle click should NOT open dialog, should show error toast
    await toggle.click();

    // Confirmation dialog should NOT appear
    await expect(page.getByText("Change Role")).not.toBeVisible();

    // Error toast
    await expect(page.getByText(/cannot change your own role/i)).toBeVisible();
  });
});
