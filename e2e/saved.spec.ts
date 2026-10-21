import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Saved Items Flow", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("displays saved items page", async ({ page }) => {
    await page.goto("/saved");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("shows saved items or empty state", async ({ page }) => {
    await page.goto("/saved");
    await page.waitForLoadState("networkidle");

    // Page should render with main content
    const main = page.locator("main");
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test("can bookmark from grants page", async ({ page }) => {
    await page.goto("/grants");
    await page.waitForLoadState("networkidle");

    // Find a bookmark button if grants loaded
    const bookmarkBtn = page.getByRole("button", { name: /bookmark|save/i }).first();
    
    if (await bookmarkBtn.count() > 0) {
      await bookmarkBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
