import { test, expect } from "../fixtures/auth";

test.describe("Admin sees own profile", () => {
  test("displays profile header with name, initials, and role badge", async ({
    adminPage: page,
  }) => {
    await page.goto("/profile");

    const main = page.getByRole("main");

    // Name heading
    await expect(
      main.getByRole("heading", { name: "Sofia Admin" }),
    ).toBeVisible();

    // Initials fallback (no avatar URL set for seeded admin)
    // Scope to the large avatar circle (size-[96px])
    const avatarCircle = main.locator(".size-\\[96px\\]");
    await expect(avatarCircle.getByText("SA")).toBeVisible();

    // Role badge — the badge has uppercase CSS, DOM text is "Admin"
    // Scope to the badge element (the span after the heading)
    const badge = main.locator("span.uppercase");
    await expect(badge).toHaveText("Admin");
  });

  test("displays Personal Information section with correct fields", async ({
    adminPage: page,
  }) => {
    await page.goto("/profile");

    await expect(
      page.getByRole("heading", { name: "Personal Information" }),
    ).toBeVisible();

    // Check all required field labels are present
    const labels = [
      "First Name",
      "Last Name",
      "Work Email",
      "Employment Type",
      "Date of Birth",
      "Actual Residence",
      "Start Year",
    ];
    for (const label of labels) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("field values match seeded admin data", async ({
    adminPage: page,
  }) => {
    await page.goto("/profile");

    const main = page.getByRole("main");
    await expect(main.getByText("sofia@company.com")).toBeVisible();
    await expect(main.getByText("CY")).toBeVisible();
    await expect(main.getByText("Prague, CZ")).toBeVisible();
    await expect(main.getByText("2024")).toBeVisible();
    await expect(main.getByText("January 1, 1990")).toBeVisible();
  });
});

test.describe("Employee sees own profile", () => {
  test("displays employee profile data", async ({ employeePage: page }) => {
    await page.goto("/profile");

    const main = page.getByRole("main");

    await expect(
      main.getByRole("heading", { name: "Test Employee" }),
    ).toBeVisible();

    // Role badge should say Employee (uppercase CSS)
    const badge = main.locator("span.uppercase");
    await expect(badge).toHaveText("Employee");

    // Personal information section present
    await expect(
      page.getByRole("heading", { name: "Personal Information" }),
    ).toBeVisible();

    // Verify employee-specific data
    await expect(main.getByText("e2e-employee@company.com")).toBeVisible();
    await expect(main.getByText("Berlin, DE")).toBeVisible();
  });

  test("employee does NOT see an Edit button", async ({
    employeePage: page,
  }) => {
    await page.goto("/profile");
    await expect(page.getByRole("button", { name: /edit/i })).not.toBeVisible();
    await expect(page.getByRole("link", { name: /edit/i })).not.toBeVisible();
  });
});
