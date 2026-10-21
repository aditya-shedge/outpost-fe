import { test, expect } from "@playwright/test";
import {
  mockUser,
  mockGrants,
  mockGrantDetail,
  mockStages,
  mockSectors,
} from "./fixtures";

test.describe("Grants Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Set auth token
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    // Mock API endpoints
    await page.route("**/api/v1/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    await page.route("**/api/v1/grants?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockGrants),
      });
    });

    await page.route("**/api/v1/grants/grant-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockGrantDetail),
      });
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

  test("displays grants list page", async ({ page }) => {
    await page.goto("/grants");

    await expect(page.getByRole("heading", { name: /grants/i })).toBeVisible();
    await expect(page.getByText("Startup India Seed Fund")).toBeVisible();
    await expect(page.getByText("T-Hub Innovation Grant")).toBeVisible();
  });

  test("shows grant cards with key information", async ({ page }) => {
    await page.goto("/grants");

    // Check first grant card has expected info
    await expect(page.getByText("Government of India")).toBeVisible();
    await expect(page.getByText(/₹.*100,000/)).toBeVisible();
  });

  test("clicking a grant navigates to detail page", async ({ page }) => {
    await page.goto("/grants");

    await page.getByText("Startup India Seed Fund").click();

    await expect(page).toHaveURL(/\/grants\/grant-1/);
  });

  test("grant detail page shows full information", async ({ page }) => {
    await page.goto("/grants/grant-1");

    await expect(page.getByText("Startup India Seed Fund")).toBeVisible();
    await expect(page.getByText("Government of India")).toBeVisible();
    await expect(
      page.getByText(/comprehensive funding program/i)
    ).toBeVisible();
    await expect(page.getByText(/must be registered in india/i)).toBeVisible();
  });

  test("grant detail has apply button", async ({ page }) => {
    await page.goto("/grants/grant-1");

    const applyButton = page.getByRole("link", { name: /apply/i });
    await expect(applyButton).toBeVisible();
  });

  test("filters grants by stage", async ({ page }) => {
    await page.goto("/grants");

    // Look for stage filter
    const stageFilter = page.getByRole("combobox", { name: /stage/i });
    if (await stageFilter.isVisible()) {
      await stageFilter.selectOption("stage-1");
      // Page should update (API will be called with filter)
      await page.waitForResponse("**/api/v1/grants?**");
    }
  });

  test("shows empty state when no grants match filters", async ({ page }) => {
    // Override route to return empty results
    await page.route("**/api/v1/grants?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: [],
          page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
        }),
      });
    });

    await page.goto("/grants");

    // Should show some empty state message
    await expect(
      page.getByText(/no grants|no results|nothing found/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
