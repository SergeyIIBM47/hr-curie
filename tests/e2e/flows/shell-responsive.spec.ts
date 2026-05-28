import { test, expect } from "../fixtures/auth";

test.describe("Dashboard shell responsive behavior", () => {
  test("uses the expected desktop, tablet, and mobile shell columns", async ({
    adminPage: page,
  }) => {
    const cases = [
      { width: 1440, firstColumn: 240, columnCount: 3 },
      { width: 1024, firstColumn: 240, columnCount: 2 },
      { width: 768, firstColumn: 60, columnCount: 2 },
      { width: 767, firstColumn: 767, columnCount: 1 },
    ];

    for (const item of cases) {
      await page.setViewportSize({ width: item.width, height: 900 });
      await page.goto("/");

      const columns = await page
        .locator('[data-shell="app"] > div')
        .evaluate((element) =>
          getComputedStyle(element)
            .gridTemplateColumns.split(" ")
            .map((column) => Number.parseFloat(column)),
        );

      expect(columns).toHaveLength(item.columnCount);
      expect(columns[0]).toBeCloseTo(item.firstColumn, 0);
    }
  });

  test("hides the desktop sidebar below 768px and uses the mobile drawer", async ({
    adminPage: page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.locator('[data-sidebar="desktop"]')).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeVisible();
  });

  test("collapses search to an icon button below 768px", async ({
    adminPage: page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Search (coming soon)" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Search people, leave, meetings/),
    ).not.toBeVisible();
  });
});
