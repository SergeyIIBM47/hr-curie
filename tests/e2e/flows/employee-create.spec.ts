import { test, expect } from "../fixtures/auth";

// Use a unique suffix per test to avoid collisions
function uniqueEmail(): string {
  return `create-${Date.now()}@company.com`;
}

test.describe("Create employee", () => {
  test("successful creation with required fields", async ({
    adminPage: page,
  }) => {
    const email = uniqueEmail();
    await page.goto("/employees/new");

    await page.getByLabel("First Name").fill("Jane");
    await page.getByLabel("Last Name").fill("Doe");
    await page.getByLabel("Work Email").fill(email);
    await page.getByLabel("Password").fill("testpass123");
    await page.getByLabel("Employment Type").selectOption({ label: "CY" });
    await page.getByLabel("Date of Birth").fill("1995-06-15");
    await page.getByLabel("Actual Residence").fill("Berlin, DE");
    await page.getByLabel("Start Year").fill("2025");

    await page.getByRole("button", { name: "Create Employee" }).click();

    // Should redirect to employee list
    await expect(page).toHaveURL(/\/employees(?:\?|$)/, { timeout: 10_000 });

    // New employee should appear in the table
    await expect(
      page.getByRole("table").getByText("Jane Doe").first(),
    ).toBeVisible();
  });

  test("validation errors on empty form submit", async ({
    adminPage: page,
  }) => {
    await page.goto("/employees/new");
    await page.getByRole("button", { name: "Create Employee" }).click();

    // Should see validation errors for required fields
    await expect(page.getByText(/first name is required/i)).toBeVisible();
    await expect(page.getByText(/last name is required/i)).toBeVisible();

    // Should remain on the create page
    await expect(page).toHaveURL(/\/employees\/new/);
  });

  test("duplicate email shows error", async ({ adminPage: page }) => {
    await page.goto("/employees/new");

    await page.getByLabel("First Name").fill("Dup");
    await page.getByLabel("Last Name").fill("Test");
    await page.getByLabel("Work Email").fill("sofia@company.com");
    await page.getByLabel("Password").fill("testpass123");
    await page.getByLabel("Employment Type").selectOption({ label: "CY" });
    await page.getByLabel("Date of Birth").fill("1990-01-01");
    await page.getByLabel("Actual Residence").fill("Prague, CZ");
    await page.getByLabel("Start Year").fill("2024");

    await page.getByRole("button", { name: "Create Employee" }).click();

    // Should see duplicate email error (toast or inline)
    await expect(page.getByText(/already in use/i)).toBeVisible({
      timeout: 10_000,
    });

    // Should remain on create page
    await expect(page).toHaveURL(/\/employees\/new/);
  });

  test("create with optional fields", async ({ adminPage: page }) => {
    const email = uniqueEmail();
    await page.goto("/employees/new");

    // Required fields
    await page.getByLabel("First Name").fill("Optional");
    await page.getByLabel("Last Name").fill("Fields");
    await page.getByLabel("Work Email").fill(email);
    await page.getByLabel("Password").fill("testpass123");
    await page.getByLabel("Employment Type").selectOption({ label: "CY" });
    await page.getByLabel("Date of Birth").fill("2000-03-20");
    await page.getByLabel("Actual Residence").fill("Vienna, AT");
    await page.getByLabel("Start Year").fill("2025");

    // Optional fields
    await page.getByLabel("Phone").fill("+43 1234567");
    await page.getByLabel("Position").fill("QA Engineer");
    await page.getByLabel("Department").fill("Quality");

    await page.getByRole("button", { name: "Create Employee" }).click();

    // Should redirect to employee list
    await expect(page).toHaveURL(/\/employees(?:\?|$)/, { timeout: 10_000 });

    // Search for the unique email to find the correct employee
    await page.getByPlaceholder("Search employees...").fill(email);
    await page.waitForURL(/q=/);
    await page.getByRole("table").getByText("Optional Fields").click();
    await expect(page).toHaveURL(/\/employees\/.+/);

    const main = page.getByRole("main");
    await expect(main.getByText("+43 1234567")).toBeVisible();
    await expect(main.getByText("QA Engineer")).toBeVisible();
    await expect(main.getByText("Quality")).toBeVisible();
  });
});
