import { test as setup, expect } from "@playwright/test";
import {
  ADMIN_STORAGE,
  EMPLOYEE_STORAGE,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  EMPLOYEE_EMAIL,
  EMPLOYEE_PASSWORD,
  login,
} from "./fixtures/auth";

setup("authenticate as admin", async ({ page }) => {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).not.toHaveURL(/\/login/);
  await page.context().storageState({ path: ADMIN_STORAGE });
});

setup("create employee user and authenticate", async ({ page, browser }) => {
  // First authenticate as admin using this page to create the employee
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

  // Get an employment type ID from the create-employee form's <select>
  await page.goto("/employees/new");
  const typeOption = page.locator("select option:not([value=''])").first();
  const employmentTypeId = await typeOption.getAttribute("value");
  expect(employmentTypeId).toBeTruthy();

  // Create the employee user via API (ignore 409 if already exists)
  const res = await page.request.post("/api/employees", {
    data: {
      firstName: "Test",
      lastName: "Employee",
      workEmail: EMPLOYEE_EMAIL,
      password: EMPLOYEE_PASSWORD,
      employmentTypeId,
      dateOfBirth: "1995-06-15",
      actualResidence: "Berlin, DE",
      startYear: 2024,
      position: "Developer",
    },
  });
  expect([201, 409]).toContain(res.status());

  // Log in as the employee in a fresh context and save storage state
  const employeeCtx = await browser.newContext();
  const employeePage = await employeeCtx.newPage();
  await login(employeePage, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
  await expect(employeePage).not.toHaveURL(/\/login/);
  await employeeCtx.storageState({ path: EMPLOYEE_STORAGE });
  await employeeCtx.close();
});
