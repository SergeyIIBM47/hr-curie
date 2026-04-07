import { test, expect } from "../fixtures/auth";

test.describe("Edit employee", () => {
  test("admin edits employee — form pre-filled and saves", async ({
    adminPage: page,
  }) => {
    // Navigate to the test employee profile
    await page.goto("/employees");
    await page.getByRole("table").getByText("Test Employee").click();
    await expect(page).toHaveURL(/\/employees\/.+/);

    // Click Edit
    await page.getByRole("link", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/edit$/);

    // Form should be pre-filled
    await expect(page.getByLabel("First Name")).toHaveValue("Test");
    await expect(page.getByLabel("Last Name")).toHaveValue("Employee");
    // Work email should be read-only
    const emailInput = page.locator("input[id*='workEmail']");
    await expect(emailInput).toHaveAttribute("readonly", "");

    // Change first name and position
    await page.getByLabel("First Name").clear();
    await page.getByLabel("First Name").fill("Updated");
    await page.getByLabel("Position").clear();
    await page.getByLabel("Position").fill("Lead Developer");

    await page.getByRole("button", { name: "Save Changes" }).click();

    // Should redirect back to employee profile
    await expect(page).toHaveURL(/\/employees\/[^/]+$/, { timeout: 10_000 });

    // Profile shows updated data
    const main = page.getByRole("main");
    await expect(
      main.getByRole("heading", { name: "Updated Employee" }),
    ).toBeVisible();
    await expect(main.getByText("Lead Developer")).toBeVisible();

    // Restore original values
    await page.getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("First Name").clear();
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Position").clear();
    await page.getByLabel("Position").fill("Developer");
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(page).toHaveURL(/\/employees\/[^/]+$/, { timeout: 10_000 });
  });

  test("edit validation — clear required field shows error", async ({
    adminPage: page,
  }) => {
    await page.goto("/employees");
    await page.getByRole("table").getByText("Test Employee").click();
    await page.getByRole("link", { name: "Edit" }).click();

    // Clear a required field
    await page.getByLabel("First Name").clear();
    await page.getByRole("button", { name: "Save Changes" }).click();

    // Should see validation error
    await expect(page.getByText(/first name is required/i)).toBeVisible();
    // Should remain on edit page
    await expect(page).toHaveURL(/\/edit$/);
  });
});
