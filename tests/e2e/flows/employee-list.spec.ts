import { test, expect } from "../fixtures/auth";

test.describe("Employee list", () => {
  test("admin sees employee table with columns", async ({
    adminPage: page,
  }) => {
    await page.goto("/employees");

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    for (const col of ["Name", "Email", "Role", "Department", "Employment Type"]) {
      await expect(table.getByText(col)).toBeVisible();
    }

    await expect(table.getByText("Sofia Admin")).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Add Employee" }),
    ).toBeVisible();
  });

  test("search employees by first name", async ({ adminPage: page }) => {
    await page.goto("/employees");

    await page.getByPlaceholder("Search employees...").fill("Sofia");
    await page.waitForURL(/q=Sofia/);
    await expect(
      page.getByRole("table").getByText("Sofia Admin"),
    ).toBeVisible();
  });

  test("search employees by email", async ({ adminPage: page }) => {
    await page.goto("/employees");

    await page.getByPlaceholder("Search employees...").fill("sofia@company");
    await page.waitForURL(/q=sofia/);
    await expect(
      page.getByRole("table").getByText("Sofia Admin"),
    ).toBeVisible();
  });

  test("search with no results shows empty state", async ({
    adminPage: page,
  }) => {
    await page.goto("/employees");

    await page.getByPlaceholder("Search employees...").fill("zzzznotfound");
    await page.waitForURL(/q=zzzznotfound/);

    await expect(page.getByText("0 employees")).toBeVisible();
  });

  test("clear search shows all employees", async ({ adminPage: page }) => {
    await page.goto("/employees?q=Sofia");
    await page.getByPlaceholder("Search employees...").clear();

    await page.waitForURL(/\/employees(?:\?)?$/);
    await expect(
      page.getByRole("table").getByText("Sofia Admin"),
    ).toBeVisible();
  });

  test("click employee row navigates to profile", async ({
    adminPage: page,
  }) => {
    await page.goto("/employees");

    await page.getByRole("table").getByText("Sofia Admin").click();
    await expect(page).toHaveURL(/\/employees\/.+/);
  });
});

test.describe("Employee list — mobile", () => {
  test("shows employee cards instead of table", async ({
    adminPage: page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/employees");

    // Table hidden on mobile
    await expect(page.getByRole("table")).not.toBeVisible();

    // Cards visible — find the card link containing the admin email
    await expect(
      page.getByRole("link").filter({ hasText: "sofia@company.com" }),
    ).toBeVisible();
  });

  test("cards are clickable", async ({ adminPage: page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/employees");

    // Click on the card link containing the admin email
    await page
      .getByRole("link")
      .filter({ hasText: "sofia@company.com" })
      .click();
    await expect(page).toHaveURL(/\/employees\/.+/);
  });
});
