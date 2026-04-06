import { test as base, type Page } from "@playwright/test";
import path from "path";

export const ADMIN_STORAGE = path.resolve(
  "tests/e2e/.auth/admin-storage.json",
);
export const EMPLOYEE_STORAGE = path.resolve(
  "tests/e2e/.auth/employee-storage.json",
);

export const ADMIN_EMAIL = "sofia@company.com";
export const ADMIN_PASSWORD = "qwerty123#";
export const EMPLOYEE_EMAIL = "e2e-employee@company.com";
export const EMPLOYEE_PASSWORD = "employee123#";

/**
 * Log in via the UI (for login-flow tests that exercise the actual form).
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

/**
 * Log in via the NextAuth credentials API (for reliable auth setup).
 * Uses page.request so cookies are shared with the browser context.
 */
export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const csrfResponse = await page.request.get("/api/auth/csrf");
  const { csrfToken } = await csrfResponse.json();

  await page.request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email,
      password,
      callbackUrl: "/",
    },
  });

  // Verify auth works by navigating to a protected page
  await page.goto("/profile");
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  });
}

type AuthFixtures = {
  adminPage: Page;
  employeePage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: ADMIN_STORAGE,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  employeePage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: EMPLOYEE_STORAGE,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
