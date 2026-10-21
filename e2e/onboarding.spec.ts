import { test, expect } from "@playwright/test";
import {
  mockUserNotOnboarded,
  mockUser,
  mockStages,
  mockSectors,
} from "./fixtures";

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth token
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock API endpoints
    await page.route("**/api/v1/me", async (route) => {
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

    await page.route("**/api/v1/lookups/stages", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockStages),
      });
    });

    await page.route("**/api/v1/lookups/sectors", async (route) => {
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

  test("displays onboarding form with all fields", async ({ page }) => {
    await page.goto("/onboarding");

    await expect(page.getByText("Complete your profile")).toBeVisible();
    await expect(page.getByLabel(/your name/i)).toBeVisible();
    await expect(page.getByLabel(/startup name/i)).toBeVisible();
    await expect(page.getByLabel(/stage/i)).toBeVisible();
    await expect(page.getByLabel(/sector/i)).toBeVisible();
    await expect(page.getByLabel(/city/i)).toBeVisible();
    await expect(page.getByLabel(/website/i)).toBeVisible();
  });

  test("shows progress steps", async ({ page }) => {
    await page.goto("/onboarding");

    // Progress indicator should be visible
    await expect(page.getByText("About you")).toBeVisible();
  });

  test("submit button is disabled when required fields are empty", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    const submitButton = page.getByRole("button", { name: /complete setup/i });
    await expect(submitButton).toBeDisabled();
  });

  test("submit button enables when all required fields are filled", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/startup name/i).fill("Acme Inc");
    await page.getByLabel(/stage/i).selectOption("stage-1");
    await page.getByLabel(/sector/i).selectOption("sector-1");
    await page.getByLabel(/city/i).fill("Hyderabad");

    const submitButton = page.getByRole("button", { name: /complete setup/i });
    await expect(submitButton).toBeEnabled();
  });

  test("completes onboarding and redirects to discover", async ({ page }) => {
    // Mock successful onboarding
    await page.route("**/api/v1/me/onboarding", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    // After onboarding, /me returns onboarded user
    let onboarded = false;
    await page.route("**/api/v1/me", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(onboarded ? mockUser : mockUserNotOnboarded),
        });
      } else {
        onboarded = true;
        await route.continue();
      }
    });

    await page.goto("/onboarding");

    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/startup name/i).fill("Acme Inc");
    await page.getByLabel(/stage/i).selectOption("stage-1");
    await page.getByLabel(/sector/i).selectOption("sector-1");
    await page.getByLabel(/city/i).fill("Hyderabad");
    await page.getByLabel(/website/i).fill("https://acme.com");

    await page.getByRole("button", { name: /complete setup/i }).click();

    // Should redirect to discover after success
    await expect(page).toHaveURL(/\/discover/, { timeout: 10000 });
  });

  test("shows error when onboarding fails", async ({ page }) => {
    await page.route("**/api/v1/me/onboarding", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid data" }),
      });
    });

    await page.goto("/onboarding");

    await page.getByLabel(/your name/i).fill("Jane Doe");
    await page.getByLabel(/startup name/i).fill("Acme Inc");
    await page.getByLabel(/stage/i).selectOption("stage-1");
    await page.getByLabel(/sector/i).selectOption("sector-1");
    await page.getByLabel(/city/i).fill("Hyderabad");

    await page.getByRole("button", { name: /complete setup/i }).click();

    // Should show error message
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
  });
});
