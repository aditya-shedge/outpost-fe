import { test, expect } from "@playwright/test";
import {
  mockUser,
  mockChallenges,
  mockChallengeDetail,
  mockStages,
  mockSectors,
} from "./fixtures";

test.describe("Challenges Flow", () => {
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

    await page.route("**/api/v1/challenges?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockChallenges),
      });
    });

    await page.route("**/api/v1/challenges/challenge-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockChallengeDetail),
      });
    });

    await page.route("**/api/v1/challenges/themes", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(["Payments", "Healthcare", "Education"]),
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

  test("displays challenges list page", async ({ page }) => {
    await page.goto("/challenges");

    await expect(
      page.getByRole("heading", { name: /challenges/i })
    ).toBeVisible();
    await expect(page.getByText("FinTech Innovation Challenge")).toBeVisible();
    await expect(page.getByText("HealthTech Hackathon")).toBeVisible();
  });

  test("shows challenge cards with key information", async ({ page }) => {
    await page.goto("/challenges");

    await expect(page.getByText("NPCI")).toBeVisible();
    await expect(page.getByText(/₹.*10,00,000|₹.*1,000,000/)).toBeVisible();
  });

  test("clicking a challenge navigates to detail page", async ({ page }) => {
    await page.goto("/challenges");

    await page.getByText("FinTech Innovation Challenge").click();

    await expect(page).toHaveURL(/\/challenges\/challenge-1/);
  });

  test("challenge detail page shows full information", async ({ page }) => {
    await page.goto("/challenges/challenge-1");

    await expect(page.getByText("FinTech Innovation Challenge")).toBeVisible();
    await expect(page.getByText("NPCI")).toBeVisible();
    await expect(
      page.getByText(/next generation of payment solutions/i)
    ).toBeVisible();
  });

  test("challenge detail has apply/participate button", async ({ page }) => {
    await page.goto("/challenges/challenge-1");

    const applyButton = page.getByRole("link", {
      name: /apply|participate|register/i,
    });
    await expect(applyButton).toBeVisible();
  });

  test("shows empty state when no challenges available", async ({ page }) => {
    await page.route("**/api/v1/challenges?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: [],
          page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
        }),
      });
    });

    await page.goto("/challenges");

    await expect(
      page.getByText(/no challenges|no results|nothing found/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
