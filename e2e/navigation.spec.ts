import { test, expect, setupAuthenticatedMocks } from "./fixtures";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await setupAuthenticatedMocks(page);
  });

  test("navigation links are visible on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Check for navigation links - actual labels from the app
    await expect(page.getByRole("link", { name: /discover/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("link", { name: /opportunities/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /mentors/i })).toBeVisible();
  });

  test("can navigate to grants/opportunities page", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Nav link might be "Opportunities" not "Grants"
    await page.getByRole("link", { name: /opportunities/i }).click();

    await expect(page).toHaveURL(/\/grants/);
  });

  test("can navigate to mentors page", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: /mentors/i }).click();

    await expect(page).toHaveURL(/\/mentors/);
  });

  test("header shows search button", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: /search/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Mobile Navigation", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await setupAuthenticatedMocks(page);
  });

  test("shows navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Mobile should have some form of navigation
    await expect(page.locator("nav")).toBeVisible({ timeout: 10000 });
  });
});
