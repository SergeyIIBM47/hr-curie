import { expect } from "@playwright/test";
import { test, ADMIN_STORAGE } from "../fixtures/auth";

const NAV_LINK = 'nav[aria-label="Main navigation"] a';

async function navTransitionDuration(
  browser: import("@playwright/test").Browser,
  reducedMotion: "reduce" | "no-preference",
): Promise<number> {
  const context = await browser.newContext({
    storageState: ADMIN_STORAGE,
    reducedMotion,
  });
  const page = await context.newPage();
  await page.goto("/");
  const seconds = await page
    .locator(NAV_LINK)
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
  await context.close();
  return seconds;
}

test.describe("Reduced motion", () => {
  test("globals.css disables transitions under prefers-reduced-motion", async ({
    browser,
  }) => {
    // Control: nav links animate color changes by default
    const normal = await navTransitionDuration(browser, "no-preference");
    expect(normal, "transition should be active without the preference").toBeGreaterThan(0.05);

    // With the preference, the @media block caps every duration at 0.01ms
    const reduced = await navTransitionDuration(browser, "reduce");
    expect(reduced, "transition should be disabled under reduce").toBeLessThan(0.001);
  });
});
