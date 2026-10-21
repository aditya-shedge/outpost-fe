import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

// Skip: /api/v1/benefits and /api/v1/partners endpoints not implemented in backend
test.describe.skip("Benefits Flow", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("displays benefits list page", async ({ page }) => {
    await page.goto("/benefits");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });
});
