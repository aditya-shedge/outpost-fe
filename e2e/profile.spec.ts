import { test, expect, setupAuthenticatedMocks, mockUser, mockStages, mockSectors } from "./fixtures";

test.describe("Profile Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth token - must use correct keys
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Setup all mocks BEFORE navigation
    await setupAuthenticatedMocks(page);
  });

  test("displays profile page with user info", async ({ page }) => {
    await page.goto("/profile");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Use more specific selectors since "Jane Doe" appears in multiple places
    await expect(page.getByRole("heading", { name: "Jane Doe" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Acme Inc").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /edit profile/i })).toBeVisible();
  });

  test("shows user initials in avatar", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Avatar should show initials "JD" for Jane Doe - use first() since there might be multiple
    await expect(page.getByText("JD").first()).toBeVisible({ timeout: 10000 });
  });

  test("navigates to edit profile page", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    // Wait for page to fully load
    await expect(page.getByRole("heading", { name: "Jane Doe" })).toBeVisible({ timeout: 10000 });

    await page.getByRole("link", { name: /edit profile/i }).click();

    await expect(page).toHaveURL(/\/profile\/edit/);
    await expect(page.getByRole("heading", { name: "Edit Profile" })).toBeVisible();
  });

  test("edit profile form is pre-populated with current values", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");

    await expect(page.getByLabel(/founder name/i)).toHaveValue("Jane Doe", { timeout: 10000 });
    await expect(page.getByLabel(/startup name/i)).toHaveValue("Acme Inc");
    await expect(page.getByLabel(/city/i)).toHaveValue("Hyderabad");
  });

  test("validates required fields on edit", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(page.getByLabel(/founder name/i)).toBeVisible({ timeout: 10000 });

    // Clear required field
    await page.getByLabel(/founder name/i).clear();

    // Try to submit
    await page.getByRole("button", { name: /save changes/i }).click();

    // Should show validation error
    await expect(page.getByText(/founder name is required/i)).toBeVisible();
  });

  test("saves profile changes successfully", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(page.getByLabel(/founder name/i)).toBeVisible({ timeout: 10000 });

    // Update a field
    await page.getByLabel(/founder name/i).clear();
    await page.getByLabel(/founder name/i).fill("Jane Smith");

    await page.getByRole("button", { name: /save changes/i }).click();

    // Should redirect to profile page
    await expect(page).toHaveURL(/\/profile$/, { timeout: 10000 });
  });

  test("cancel button returns to profile page", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page).toHaveURL(/\/profile$/);
  });

  test("city is required for profile edit", async ({ page }) => {
    await page.goto("/profile/edit");
    await page.waitForLoadState("networkidle");

    // Wait for form to load
    await expect(page.getByLabel(/city/i)).toBeVisible({ timeout: 10000 });

    // Clear city field
    await page.getByLabel(/city/i).clear();

    // Try to submit
    await page.getByRole("button", { name: /save changes/i }).click();

    // Should show validation error for city
    await expect(page.getByText(/city is required/i)).toBeVisible();
  });
});
