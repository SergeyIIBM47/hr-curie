import { test, expect } from "../fixtures/auth";

test.describe("Employee profile view", () => {
  test("admin sees employee profile with detail fields", async ({
    adminPage: page,
  }) => {
    // Navigate to employee list then click the seeded admin
    await page.goto("/employees");
    await page.getByRole("table").getByText("Sofia Admin").click();
    await expect(page).toHaveURL(/\/employees\/.+/);

    const main = page.getByRole("main");

    // Name heading
    await expect(
      main.getByRole("heading", { name: "Sofia Admin" }),
    ).toBeVisible();

    // Initials avatar
    const avatar = main.locator(".size-\\[96px\\]");
    await expect(avatar.getByText("SA")).toBeVisible();

    // Position
    await expect(main.getByText("HR Manager")).toBeVisible();

    // Personal Information section with detail fields
    await expect(
      main.getByRole("heading", { name: "Personal Information" }),
    ).toBeVisible();

    for (const label of [
      "First Name",
      "Last Name",
      "Work Email",
      "Employment Type",
      "Date of Birth",
      "Actual Residence",
      "Start Year",
    ]) {
      await expect(main.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("admin sees Edit and Back to List buttons", async ({
    adminPage: page,
  }) => {
    await page.goto("/employees");
    await page.getByRole("table").getByText("Sofia Admin").click();

    await expect(
      page.getByRole("link", { name: "Edit" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to List" }),
    ).toBeVisible();
  });

  test("Back to List navigates to /employees", async ({
    adminPage: page,
  }) => {
    await page.goto("/employees");
    await page.getByRole("table").getByText("Sofia Admin").click();
    await expect(page).toHaveURL(/\/employees\/.+/);

    await page.getByRole("link", { name: "Back to List" }).click();
    await expect(page).toHaveURL(/\/employees$/);
  });
});
