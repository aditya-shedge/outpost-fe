import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Profile Flow", () => {
  test.skip(!hasTestCredentials, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
  });

  test("displays profile page with user info", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Should show profile heading with user name
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    
    // Should have edit profile link
    await expect(page.getByRole("link", { name: /edit profile/i })).toBeVisible();
  });

  test("shows user avatar", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Avatar should be visible (contains initials or image)
    await expect(page.locator(".rounded-full").first()).toBeVisible({ timeout: 10000 });
  });

  test("navigates to edit profile page", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: /edit profile/i }).click();

    await expect(page).toHaveURL(/\/profile\/edit/);
  });

  test("edit profile form has required fields", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");

    // Check form fields exist - using actual labels from the form
    await expect(page.getByRole("textbox", { name: /founder name/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("textbox", { name: /startup name/i })).toBeVisible();
    await expect(page.getByRole("combobox", { name: /stage/i })).toBeVisible();
  });

  test("back to profile link works", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: /back to profile/i }).click();

    await expect(page).toHaveURL(/\/profile$/);
  });

  test("security settings link works", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    await page.getByRole("link", { name: /security settings/i }).click();

    await expect(page).toHaveURL(/\/profile\/security/);
  });
});
