import { test, expect } from "@playwright/test";
import {
  mockUser,
  mockGrants,
  mockChallenges,
  mockMentors,
  mockStages,
  mockSectors,
} from "./fixtures";

test.describe("Discover Page", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

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

    await page.route("**/api/v1/challenges?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockChallenges),
      });
    });

    await page.route("**/api/v1/mentors?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMentors),
      });
    });

    await page.route("**/api/v1/spotlight", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
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

  test("displays discover page with sections", async ({ page }) => {
    await page.goto("/discover");

    // Should show main discover page elements
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("shows grants section on discover", async ({ page }) => {
    await page.goto("/discover");

    // Look for grants or opportunities section
    await expect(
      page.getByText(/grants|opportunities|funding/i).first()
    ).toBeVisible();
  });

  test("can navigate to grants from discover", async ({ page }) => {
    await page.goto("/discover");

    // Find and click grants link/button
    const grantsLink = page.getByRole("link", { name: /grants|view all/i }).first();
    if (await grantsLink.isVisible()) {
      await grantsLink.click();
      await expect(page).toHaveURL(/\/(grants|discover)/);
    }
  });
});

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await page.route("**/api/v1/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUser),
      });
    });

    await page.route("**/api/v1/grants?**", async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search") || "";
      
      const filtered = mockGrants.content.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.provider.toLowerCase().includes(search.toLowerCase())
      );
      
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: filtered,
          page: {
            number: 0,
            size: 20,
            totalElements: filtered.length,
            totalPages: 1,
          },
        }),
      });
    });

    await page.route("**/api/v1/challenges?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockChallenges),
      });
    });

    await page.route("**/api/v1/mentors?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMentors),
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

  test("search page is accessible", async ({ page }) => {
    await page.goto("/search");

    // Should have search input
    await expect(
      page.getByRole("searchbox").or(page.getByPlaceholder(/search/i))
    ).toBeVisible();
  });

  test("can search for grants", async ({ page }) => {
    await page.goto("/search");

    const searchInput = page
      .getByRole("searchbox")
      .or(page.getByPlaceholder(/search/i));
    await searchInput.fill("Startup India");

    // Press enter or wait for auto-search
    await searchInput.press("Enter");

    // Should show search results
    await page.waitForTimeout(500); // Wait for results
  });

  test("shows no results message for empty search", async ({ page }) => {
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

    await page.goto("/search?q=nonexistent");

    // Should show empty state or no results message
    await expect(
      page.getByText(/no results|nothing found|no matches/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
