import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Mentors Flow", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("displays mentors list page", async ({ page }) => {
    await page.goto("/mentors");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    
    // Real backend mentor names
    await expect(page.getByText(/Priya|Rahul|Ananya|Vikram|Deepa|Arjun/i).first()).toBeVisible();
  });

  test("shows mentor cards with expertise", async ({ page }) => {
    await page.goto("/mentors");
    await page.waitForLoadState("networkidle");

    // Real backend expertise areas
    await expect(page.getByText(/Product|Growth|Finance|Engineering|Sales|Fundraising/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("clicking a mentor navigates to detail page", async ({ page }) => {
    await page.goto("/mentors");
    await page.waitForLoadState("networkidle");

    // Click first mentor card link
    const mentorLink = page.locator("a[href^='/mentors/d']").first();
    await expect(mentorLink).toBeVisible({ timeout: 10000 });
    
    await mentorLink.click();

    await expect(page).toHaveURL(/\/mentors\/d[a-f0-9-]+/);
  });

  test("mentor detail page shows info", async ({ page }) => {
    await page.goto("/mentors");
    await page.waitForLoadState("networkidle");
    
    // Navigate to first mentor
    const mentorLink = page.locator("a[href^='/mentors/d']").first();
    await mentorLink.click();
    await page.waitForLoadState("networkidle");

    // Detail page should have heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });
});
