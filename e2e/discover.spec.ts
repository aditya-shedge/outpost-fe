import { test, expect, setupAuthenticatedMocks } from "./fixtures";

test.describe("Discover Page", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await setupAuthenticatedMocks(page);
  });

  test("displays discover page", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("shows opportunities section", async ({ page }) => {
    await page.goto("/discover");
    await page.waitForLoadState("networkidle");

    // Check that grants/opportunities are shown
    await expect(page.getByText(/grant|opportunit|funding/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Search", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await setupAuthenticatedMocks(page);
  });

  test("search page is accessible", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    // Should have search input
    await expect(
      page.getByRole("searchbox").or(page.getByPlaceholder(/search/i)).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
