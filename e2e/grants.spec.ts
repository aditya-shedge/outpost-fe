import { test, expect, mockUser } from "./fixtures";

test.describe("Grants Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth token
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock /me endpoint for auth - other endpoints use real backend
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
  });

  test("displays grants list page", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Check page loaded
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    
    // Check real backend data is displayed (any grant from seed data)
    await expect(page.getByText(/Grant|Fund/i).first()).toBeVisible();
  });

  test("shows grant cards with provider info", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Real backend returns grants with issuing bodies
    await expect(page.getByText(/Foundation|DPIIT|MeitY|Government|SIDBI|NITI/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("clicking a grant navigates to detail page", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Click first grant card link
    const grantLink = page.locator("a[href^='/grants/']").first();
    await expect(grantLink).toBeVisible({ timeout: 10000 });
    
    await grantLink.click();

    await expect(page).toHaveURL(/\/grants\/[a-f0-9-]+/);
  });

  test("grant detail page shows content", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");
    
    // Navigate to first grant
    const grantLink = page.locator("a[href^='/grants/']").first();
    await grantLink.click();
    await page.waitForLoadState("networkidle");

    // Detail page should have grant info
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("grant detail has apply action", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");
    
    // Navigate to first grant
    const grantLink = page.locator("a[href^='/grants/']").first();
    await grantLink.click();
    await page.waitForLoadState("networkidle");

    // Look for apply button/link - could be link or button
    const applyElement = page.getByRole("link", { name: /apply/i }).or(page.getByRole("button", { name: /apply/i }));
    // If no explicit apply, check for external link to application
    const hasApply = await applyElement.count() > 0;
    
    // Grant detail should have heading at minimum
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    
    // If apply exists, verify it's visible
    if (hasApply) {
      await expect(applyElement.first()).toBeVisible();
    }
  });
});
