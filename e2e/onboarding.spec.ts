import { test, expect, mockUserNotOnboarded, mockUser, mockStages, mockSectors } from "./fixtures";

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock for non-onboarded user - need mocks here since we can't use real backend for this
    await page.route("**/**/api/v1/me", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockUserNotOnboarded),
        });
      } else {
        await route.continue();
      }
    });

    await page.route("**/**/api/v1/lookups/stages", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockStages),
      });
    });

    await page.route("**/**/api/v1/lookups/sectors", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSectors),
      });
    });
  });

  test("redirects non-onboarded user to onboarding page", async ({ page }) => {
    await page.goto("/discover");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("displays onboarding form", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/complete your profile/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/startup name/i)).toBeVisible();
  });

  test("submit button is disabled when required fields are empty", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");

    const submitButton = page.getByRole("button", { name: /complete setup/i });
    await expect(submitButton).toBeDisabled();
  });

  test("submit button enables when all required fields are filled", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");

    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/startup name/i).fill("Acme Inc");
    await page.getByLabel(/stage/i).selectOption("stage-1");
    await page.getByLabel(/sector/i).selectOption("sector-1");
    await page.getByLabel(/city/i).fill("Hyderabad");

    const submitButton = page.getByRole("button", { name: /complete setup/i });
    await expect(submitButton).toBeEnabled();
  });

  test("completes onboarding and redirects to discover", async ({ page }) => {
    // Track onboarding state
    let onboardingComplete = false;

    // Override the me route to handle onboarding
    await page.route("**/**/api/v1/me", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(onboardingComplete ? mockUser : mockUserNotOnboarded),
        });
      } else {
        await route.continue();
      }
    });

    await page.route("**/**/api/v1/me/onboarding", async (route) => {
      onboardingComplete = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    // Mock other endpoints for after redirect
    await page.route("**/**/api/v1/grants*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
      });
    });

    await page.route("**/**/api/v1/spotlight", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      });
    });

    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");

    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/startup name/i).fill("Acme Inc");
    await page.getByLabel(/stage/i).selectOption("stage-1");
    await page.getByLabel(/sector/i).selectOption("sector-1");
    await page.getByLabel(/city/i).fill("Hyderabad");

    await page.getByRole("button", { name: /complete setup/i }).click();

    await expect(page).toHaveURL(/\/discover/, { timeout: 10000 });
  });
});
