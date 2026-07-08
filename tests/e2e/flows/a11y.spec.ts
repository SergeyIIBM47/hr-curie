import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/auth";

const ROUTES = [
  "/",
  "/profile",
  "/employees",
  "/leave",
  "/calendar",
  "/settings",
] as const;

async function settle(page: Page, route: string): Promise<void> {
  await page.goto(route);
  // `networkidle` can hang on pages with SWR polling, so only wait briefly.
  await page
    .waitForLoadState("networkidle", { timeout: 3000 })
    .catch(() => undefined);
}

test.describe("Accessibility — axe scans", () => {
  for (const route of ROUTES) {
    test(`${route} has no serious or critical violations`, async ({
      adminPage: page,
    }) => {
      await settle(page, route);

      const results = await new AxeBuilder({ page })
        // Out-of-month filler day numbers in the mini calendar are ghosted,
        // aria-hidden, non-interactive decoration — WCAG 1.4.3 exempts pure
        // decoration from contrast requirements, but axe still flags them.
        .exclude('[data-curie="mini-calendar"] div[aria-hidden="true"]')
        .analyze();
      const severe = results.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          targets: v.nodes.map((n) => n.target.join(" ")),
        }));

      expect(severe, `axe violations on ${route}`).toEqual([]);
    });
  }
});

test.describe("Accessibility — redesign semantics", () => {
  test.describe("desktop shell controls", () => {
    // The mobile drawer's equivalents are covered by the mobile-nav
    // component tests.
    test.skip(({ isMobile }) => isMobile, "desktop shell controls");

    test("sidebar marks the active route with aria-current", async ({
      adminPage: page,
    }) => {
      await settle(page, "/employees");
      const nav = page.getByRole("navigation", { name: "Main navigation" });
      const active = nav.locator('a[aria-current="page"]');
      await expect(active).toHaveCount(1);
      await expect(active).toHaveAttribute("href", "/employees");
    });

    test("topbar icon buttons have accessible names", async ({
      adminPage: page,
    }) => {
      await settle(page, "/");
      await expect(page.getByRole("button", { name: "Notifications" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    });

    test("keyboard focus draws the brand ring on redesign controls", async ({
      adminPage: page,
    }) => {
      await settle(page, "/");

      // :focus-visible only matches script focus when the last input
      // modality was the keyboard — establish it with a real Tab press.
      await page.keyboard.press("Tab");

      const targets = [
        page.getByRole("navigation", { name: "Main navigation" }).getByRole("link").first(),
        page.getByRole("button", { name: "Notifications" }),
        page.getByRole("button", { name: "Sign out" }),
        page
          .locator('[data-curie="mini-calendar"]:visible')
          .first()
          .locator("[data-curie-today]"),
      ];

      for (const target of targets) {
        await target.focus();
        const outline = await target.evaluate((el) => {
          const style = getComputedStyle(el);
          return { width: style.outlineWidth, style: style.outlineStyle };
        });
        expect(outline.style, "focused control must have an outline").not.toBe("none");
        expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
      }
    });
  });

  test("mini-calendar selectable days are buttons", async ({
    adminPage: page,
  }) => {
    await settle(page, "/");
    const cal = page.locator('[data-curie="mini-calendar"]:visible').first();
    await expect(cal).toBeVisible();

    const dayButtons = cal.getByRole("button");
    // 2 month-nav buttons + at least 28 in-month day buttons
    expect(await dayButtons.count()).toBeGreaterThan(29);

    const todayCell = cal.locator("[data-curie-today]").first();
    await expect(todayCell).toBeVisible();
    expect(
      await todayCell.evaluate((el) => el.tagName),
      "today cell should be a button",
    ).toBe("BUTTON");
  });

  test("disabled search is aria-disabled and not focusable", async ({
    adminPage: page,
  }) => {
    await settle(page, "/");
    const search = page.getByRole("button", {
      name: "Search (coming soon)",
      includeHidden: true,
    });
    const visibleSearch = search.and(page.locator(":visible")).first();
    await expect(visibleSearch).toHaveAttribute("aria-disabled", "true");
    await expect(visibleSearch).toBeDisabled();
    expect(
      await visibleSearch.evaluate((el) => el.getAttribute("tabindex")),
    ).toBe("-1");
  });
});
