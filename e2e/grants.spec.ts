import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Grants Flow", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("displays grants list page", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Check page loaded
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    
    // Should show grants from real backend
    await expect(page.getByText(/Grant|Fund/i).first()).toBeVisible();
  });

  test("shows grant cards with provider info", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Real backend returns grants with issuing bodies
    await expect(page.getByText(/Foundation|DPIIT|MeitY|Government|SIDBI|NITI|Nasscom/i).first()).toBeVisible({ timeout: 10000 });
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
});
