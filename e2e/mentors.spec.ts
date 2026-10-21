import { test, expect, mockUser } from "./fixtures";

test.describe("Mentors Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock /me endpoint for auth
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

  test("mentor detail page shows bio", async ({ page }) => {
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

test.describe("Mentor Application", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock /me endpoint for auth
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

  test("displays mentor application page", async ({ page }) => {
    await page.goto("/mentors/apply");
    await page.waitForLoadState("networkidle");

    // Check page loaded
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });
});
