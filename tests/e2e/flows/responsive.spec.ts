import path from "path";
import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/auth";

const SCREENSHOT_DIR = path.resolve("test-results/responsive");

const VIEWPORTS = [1440, 1280, 1024, 768, 390] as const;

const ROUTES: { route: string; name: string }[] = [
  { route: "/", name: "overview" },
  { route: "/profile", name: "profile" },
  { route: "/employees", name: "employees" },
  { route: "/leave", name: "leave" },
  { route: "/calendar", name: "calendar" },
  { route: "/settings", name: "settings" },
];

// Firefox aborts a goto that interrupts in-flight requests (NS_BINDING_ABORTED)
// and its "load" event can starve on dev-server streaming, so navigate with
// domcontentloaded, retry aborted bindings, and give straggling requests a
// bounded grace period.
async function visit(page: Page, route: string): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      break;
    } catch (error) {
      if (attempt >= 3 || !String(error).includes("NS_BINDING_ABORTED")) {
        throw error;
      }
    }
  }
  await page
    .waitForLoadState("networkidle", { timeout: 3000 })
    .catch(() => undefined);
}

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  // Dev-server HMR can reload the page mid-measurement on Firefox,
  // destroying the execution context — retry on a fresh context.
  for (let attempt = 1; ; attempt++) {
    try {
      return await page.evaluate(
        () => document.body.scrollWidth > window.innerWidth,
      );
    } catch (error) {
      if (
        attempt >= 3 ||
        !String(error).includes("Execution context was destroyed")
      ) {
        throw error;
      }
      await page
        .waitForLoadState("domcontentloaded", { timeout: 5000 })
        .catch(() => undefined);
    }
  }
}

function gridColumnCount(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return -1;
    const style = getComputedStyle(el);
    if (style.display !== "grid") return 0; // stylesheet not applied yet
    return style.gridTemplateColumns.split(" ").length;
  }, selector);
}

test.describe("Responsive audit — no horizontal scroll", () => {
  for (const { route, name } of ROUTES) {
    test(`${route} fits every viewport`, async ({ adminPage: page }) => {
      test.setTimeout(120_000); // five navigations per test is slow on Firefox
      for (const width of VIEWPORTS) {
        await page.setViewportSize({ width, height: 900 });
        await visit(page, route);

        expect(
          await hasHorizontalScroll(page),
          `${route} at ${width}px must not scroll horizontally`,
        ).toBe(false);

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${name}-${width}.png`),
          fullPage: true,
        });
      }
    });
  }
});

test.describe("Responsive audit — overview grid collapse", () => {
  const KPI_ROW = 'section[aria-label="Key metrics"]';
  // First two-column section after the KPI row (donut + time-off)
  const GRID2 = 'section.lg\\:grid-cols-2';

  test("KPI row collapses 4 → 2 → 1 columns", async ({ adminPage: page }) => {
    test.setTimeout(120_000);
    const expected: Record<number, number> = {
      1440: 4,
      1280: 4,
      1024: 2,
      768: 2,
      390: 1,
    };
    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, "/");
      // Poll: Firefox can reach domcontentloaded before the stylesheet applies
      await expect
        .poll(() => gridColumnCount(page, KPI_ROW), {
          message: `KPI columns at ${width}px`,
          timeout: 10_000,
        })
        .toBe(expected[width]);
    }
  });

  test("Grid2 sections collapse to one column below 1024px", async ({
    adminPage: page,
  }) => {
    test.setTimeout(120_000);
    for (const width of [1024, 768, 390] as const) {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, "/");
      await expect
        .poll(() => gridColumnCount(page, GRID2), {
          message: `Grid2 columns at ${width}px`,
          timeout: 10_000,
        })
        .toBe(width >= 1024 ? 2 : 1);
    }
  });
});
