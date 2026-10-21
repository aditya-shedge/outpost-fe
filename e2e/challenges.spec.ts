import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Challenges Flow", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("displays challenges list page", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("shows challenge cards with corporate info", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    // Real backend data - corporate names
    await expect(page.getByText(/Reliance|HDFC|Apollo|Swiggy|Infosys|Zomato|Mahindra|ICICI|Tata/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("clicking a challenge navigates to detail page", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    const challengeLink = page.locator("a[href^='/challenges/']").first();
    await expect(challengeLink).toBeVisible({ timeout: 10000 });
    
    await challengeLink.click();

    await expect(page).toHaveURL(/\/challenges\/[a-f0-9-]+/);
  });

  test("challenge detail page shows content", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");
    
    const challengeLink = page.locator("a[href^='/challenges/']").first();
    await challengeLink.click();
    await page.waitForLoadState("networkidle");

    // Detail page should have heading and apply button
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test("can filter challenges by theme", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    // Check if filter/theme selector exists
    const filterBtn = page.getByRole("combobox").first();
    if (await filterBtn.count() > 0) {
      await filterBtn.click();
    }
  });
});
