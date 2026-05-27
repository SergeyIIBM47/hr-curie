import { expect, type Page } from "@playwright/test";
import path from "path";
import { test, ADMIN_STORAGE, EMPLOYEE_STORAGE } from "../fixtures/auth";

const SCREENSHOT_DIR = path.resolve("test-results/phase-0");

test.use({ viewport: { width: 1440, height: 900 } });

interface ConsoleAudit {
  cspViolations: string[];
  errors: string[];
}

function attachConsoleAudit(page: Page): ConsoleAudit {
  const audit: ConsoleAudit = { cspViolations: [], errors: [] };

  page.on("console", (msg) => {
    const text = msg.text();
    if (/content security policy|refused to load|refused to apply/i.test(text)) {
      audit.cspViolations.push(text);
    }
    if (msg.type() === "error") {
      audit.errors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    audit.errors.push(err.message);
  });

  return audit;
}

async function verifyPhase0Tokens(page: Page): Promise<void> {
  // 1. Token contract: --font-sans must include General Sans, --font-display must include Fraunces.
  const tokens = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      fontSans: root.getPropertyValue("--font-sans").trim(),
      fontDisplay: root.getPropertyValue("--font-display").trim(),
      background: root.getPropertyValue("--background").trim(),
      curieBg: root.getPropertyValue("--color-curie-bg").trim(),
      curieBrand: root.getPropertyValue("--color-curie-brand").trim(),
    };
  });

  expect(tokens.fontSans, `--font-sans should lead with General Sans (got "${tokens.fontSans}")`)
    .toMatch(/"?General Sans"?/i);
  expect(tokens.fontDisplay, `--font-display should include Fraunces (got "${tokens.fontDisplay}")`)
    .toMatch(/Fraunces/i);
  expect(tokens.background, `--background should be Frost #F5F7FA`).toMatch(/#F5F7FA/i);
  expect(tokens.curieBg, `--color-curie-bg should be #F5F7FA`).toMatch(/#F5F7FA/i);
  expect(tokens.curieBrand, `--color-curie-brand should be Cobalt #2563EB`).toMatch(/#2563EB/i);

  // 2. Fontshare General Sans should be loaded (used by body since --font-sans leads with it).
  const fontStatus = await page.evaluate(async () => {
    await document.fonts.ready;
    // Trigger Fraunces load explicitly since no Phase 0 element references it yet.
    try {
      await document.fonts.load('1em "Fraunces"');
    } catch {
      // ignore — assertion below covers the result
    }
    return {
      generalSans: document.fonts.check('1em "General Sans"'),
      fraunces: document.fonts.check('1em "Fraunces"'),
    };
  });

  expect(fontStatus.generalSans, "General Sans must be loaded from Fontshare").toBe(true);
  expect(fontStatus.fraunces, "Fraunces must be loadable on demand (next/font)").toBe(true);
}

test.describe("Phase 0 — fonts + CSP + screenshots", () => {
  test("/login: tokens + fonts + CSP", async ({ page }) => {
    const audit = attachConsoleAudit(page);

    const response = await page.goto("/login", { waitUntil: "networkidle" });
    expect(response?.status(), "/login should respond 200").toBe(200);

    // Capture screenshot before assertions so it's saved regardless of pass/fail.
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "login.png"),
      fullPage: true,
    });

    await verifyPhase0Tokens(page);

    expect(audit.cspViolations, `CSP violations on /login: ${audit.cspViolations.join("\n")}`).toEqual([]);
  });

  test("/ (admin overview): tokens + fonts + CSP", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: ADMIN_STORAGE,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    const audit = attachConsoleAudit(page);

    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).not.toHaveURL(/\/login/);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "overview-admin.png"),
      fullPage: true,
    });

    await verifyPhase0Tokens(page);

    expect(audit.cspViolations, `CSP violations on /: ${audit.cspViolations.join("\n")}`).toEqual([]);

    await context.close();
  });

  test("/profile (employee): tokens + fonts + CSP", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: EMPLOYEE_STORAGE,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    const audit = attachConsoleAudit(page);

    await page.goto("/profile", { waitUntil: "networkidle" });
    await expect(page).not.toHaveURL(/\/login/);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "profile-employee.png"),
      fullPage: true,
    });

    await verifyPhase0Tokens(page);

    expect(audit.cspViolations, `CSP violations on /profile: ${audit.cspViolations.join("\n")}`).toEqual([]);

    await context.close();
  });
});
