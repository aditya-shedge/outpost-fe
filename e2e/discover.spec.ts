import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Discover Page", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
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
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("search page is accessible", async ({ page }) => {
    await page.goto("/search?q=test");
    await page.waitForLoadState("networkidle");

    // Search page should show results section or tabs
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
  });
});
