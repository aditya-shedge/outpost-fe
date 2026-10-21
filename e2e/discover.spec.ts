import { test, expect, mockUser } from "./fixtures";

test.describe("Discover Page", () => {
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

    // Mock spotlight
    await page.route("**/**/api/v1/spotlight", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      });
    });

    // Mock challenges since backend returns 500
    await page.route("**/**/api/v1/challenges*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
      });
    });
  });

  test("displays discover page", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("shows opportunities section", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Check that grants/opportunities are shown from real backend
    await expect(page.getByText(/grant|opportunit|funding/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Search", () => {
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

    // Mock spotlight and challenges for search page
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

  test("search page is accessible", async ({ page }) => {
    await page.goto("/search?q=test");
    await page.waitForLoadState("networkidle");

    // Search page should show results section or no results message
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
  });
});
