import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Navigation", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("navigation links are visible on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Check for navigation links in the header nav
    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "Discover" })).toBeVisible({ timeout: 10000 });
    await expect(nav.getByRole("link", { name: "Opportunities" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Mentors" })).toBeVisible();
  });

  test("can navigate to grants/opportunities page", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Click the nav link specifically
    await page.locator("header nav").getByRole("link", { name: "Opportunities" }).click();

    await expect(page).toHaveURL(/\/grants/);
  });

  test("can navigate to mentors page", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    await page.locator("header nav").getByRole("link", { name: "Mentors" }).click();

    await expect(page).toHaveURL(/\/mentors/);
  });

  test("header shows search button", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: /search/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Mobile Navigation", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("shows navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Mobile bottom navigation should be visible
    await expect(page.locator("nav.md\\:hidden")).toBeVisible({ timeout: 10000 });
  });
});
