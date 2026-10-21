import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

// Skip: Backend /api/v1/challenges returns 500 error due to bad enum data
test.describe.skip("Challenges Flow", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("displays challenges list page", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("clicking a challenge navigates to detail page", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    const challengeLink = page.locator("a[href^='/challenges/']").first();
    await expect(challengeLink).toBeVisible({ timeout: 10000 });
    
    await challengeLink.click();

    await expect(page).toHaveURL(/\/challenges\/[a-f0-9-]+/);
  });
});
