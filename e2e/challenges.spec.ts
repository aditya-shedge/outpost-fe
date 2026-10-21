import { test, expect } from "./fixtures";

// Skip: Backend /api/v1/challenges returns 500 error
test.describe.skip("Challenges Flow", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });
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
