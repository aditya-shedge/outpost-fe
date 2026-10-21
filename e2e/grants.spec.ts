import { test, expect, setupAuthenticatedMocks } from "./fixtures";

test.describe("Grants Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth token
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Use the helper that mocks ALL required endpoints
    await setupAuthenticatedMocks(page);
  });

  test("displays grants list page", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Check page loaded (heading might be "Opportunities" or "Grants")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    
    // Check our mock data is displayed
    await expect(page.getByText("Startup India Seed Fund")).toBeVisible();
  });

  test("shows grant cards with provider info", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Government of India")).toBeVisible({ timeout: 10000 });
  });

  test("clicking a grant navigates to detail page", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Wait for grants to load
    await expect(page.getByText("Startup India Seed Fund")).toBeVisible({ timeout: 10000 });
    
    await page.getByText("Startup India Seed Fund").click();

    await expect(page).toHaveURL(/\/grants\/grant-1/);
  });

  test("grant detail page shows description", async ({ page }) => {
    await page.goto("/grants/grant-1");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Startup India Seed Fund")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/comprehensive funding program/i)).toBeVisible();
  });

  test("grant detail has apply link", async ({ page }) => {
    await page.goto("/grants/grant-1");
    await page.waitForLoadState("networkidle");

    // Look for apply button/link
    const applyButton = page.getByRole("link", { name: /apply/i });
    await expect(applyButton).toBeVisible({ timeout: 10000 });
  });
});
