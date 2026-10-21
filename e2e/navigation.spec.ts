import { test, expect, mockUser } from "./fixtures";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock /me endpoint for auth
    await page.route("**/**/api/v1/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    await page.route("**/**/api/v1/me/identities", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock spotlight and challenges for discover page
    await page.route("**/**/api/v1/spotlight", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      });
    });

    await page.route("**/**/api/v1/challenges*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
      });
    });
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
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock /me endpoint for auth
    await page.route("**/**/api/v1/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    await page.route("**/**/api/v1/me/identities", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    // Mock spotlight and challenges
    await page.route("**/**/api/v1/spotlight", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      });
    });

    await page.route("**/**/api/v1/challenges*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
      });
    });
  });

  test("shows navigation on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Mobile bottom navigation should be visible (the one with fixed bottom-0)
    await expect(page.locator("nav.md\\:hidden")).toBeVisible({ timeout: 10000 });
  });
});
