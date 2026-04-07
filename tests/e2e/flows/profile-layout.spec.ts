import { test, expect } from "../fixtures/auth";

test.describe("Responsive layout", () => {
  test("desktop: detail fields in 2-column grid", async ({
    adminPage: page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/profile");

    // First Name and Last Name fields should be side by side
    const firstName = page.getByText("First Name", { exact: true });
    const lastName = page.getByText("Last Name", { exact: true });
    const fnBox = await firstName.boundingBox();
    const lnBox = await lastName.boundingBox();

    expect(fnBox).toBeTruthy();
    expect(lnBox).toBeTruthy();
    // Same row means similar Y position
    expect(Math.abs(fnBox!.y - lnBox!.y)).toBeLessThan(10);
    // Different columns means different X positions
    expect(Math.abs(fnBox!.x - lnBox!.x)).toBeGreaterThan(100);
  });

  test("mobile: detail fields stack vertically", async ({
    adminPage: page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/profile");

    const firstName = page.getByText("First Name", { exact: true });
    const lastName = page.getByText("Last Name", { exact: true });
    const fnBox = await firstName.boundingBox();
    const lnBox = await lastName.boundingBox();

    expect(fnBox).toBeTruthy();
    expect(lnBox).toBeTruthy();
    // Stacked means different Y positions
    expect(Math.abs(fnBox!.y - lnBox!.y)).toBeGreaterThan(20);
  });
});

test.describe("Avatar display", () => {
  test("shows initials when employee has no avatar URL", async ({
    adminPage: page,
  }) => {
    await page.goto("/profile");

    // Seeded admin has no avatar — should show initials "SA" in the large circle
    const main = page.getByRole("main");
    const avatarCircle = main.locator(".size-\\[96px\\]");
    await expect(avatarCircle.getByText("SA")).toBeVisible();

    // No <img> inside the avatar circle
    await expect(avatarCircle.locator("img")).not.toBeVisible();
  });
});
