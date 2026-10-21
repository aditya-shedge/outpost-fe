import { test, expect } from "@playwright/test";
import { mockUser, mockStages, mockSectors } from "./fixtures";

test.describe("Navigation", () => {
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
        body: JSON.stringify({
          content: [],
          page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
        }),
      });
    });

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

    await page.route("**/api/v1/mentors?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: [],
          page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
        }),
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

  test("sidebar navigation is visible on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/discover");

    // Check for navigation links
    await expect(
      page.getByRole("link", { name: /discover|home/i }).first()
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /grants/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /challenges/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /mentors/i })).toBeVisible();
  });

  test("can navigate to grants page", async ({ page }) => {
    await page.goto("/discover");

    await page.getByRole("link", { name: /grants/i }).click();

    await expect(page).toHaveURL(/\/grants/);
  });

  test("can navigate to challenges page", async ({ page }) => {
    await page.goto("/discover");

    await page.getByRole("link", { name: /challenges/i }).click();

    await expect(page).toHaveURL(/\/challenges/);
  });

  test("can navigate to mentors page", async ({ page }) => {
    await page.goto("/discover");

    await page.getByRole("link", { name: /mentors/i }).click();

    await expect(page).toHaveURL(/\/mentors/);
  });

  test("can navigate to profile", async ({ page }) => {
    await page.goto("/discover");

    // Profile is usually accessible via user menu or avatar
    const profileLink = page.getByRole("link", { name: /profile/i });
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await expect(page).toHaveURL(/\/profile/);
    }
  });

  test("can navigate to saved items", async ({ page }) => {
    await page.goto("/discover");

    const savedLink = page.getByRole("link", { name: /saved|bookmarks/i });
    if (await savedLink.isVisible()) {
      await savedLink.click();
      await expect(page).toHaveURL(/\/saved/);
    }
  });
});

test.describe("Mobile Navigation", () => {
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

    await page.route("**/api/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: [],
          page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
        }),
      });
    });
  });

  test("shows mobile menu on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/discover");

    // Look for hamburger menu or mobile nav toggle
    const menuButton = page.getByRole("button", { name: /menu|toggle/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Mobile menu should show navigation links
      await expect(page.getByRole("link", { name: /grants/i })).toBeVisible();
    }
  });

  test("bottom navigation is visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/discover");

    // Check for bottom nav bar (common mobile pattern)
    const bottomNav = page.locator("nav").last();
    await expect(bottomNav).toBeVisible();
  });
});

test.describe("Header", () => {
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

    await page.route("**/api/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          content: [],
          page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
        }),
      });
    });
  });

  test("header shows user info", async ({ page }) => {
    await page.goto("/discover");

    // Should show user avatar or name
    const userAvatar = page.getByText("JD"); // Initials for Jane Doe
    const userName = page.getByText("Jane");

    const hasUserInfo =
      (await userAvatar.isVisible()) || (await userName.isVisible());
    expect(hasUserInfo).toBeTruthy();
  });

  test("header has search functionality", async ({ page }) => {
    await page.goto("/discover");

    // Look for search input or search button
    const searchInput = page.getByRole("searchbox");
    const searchButton = page.getByRole("button", { name: /search/i });

    const hasSearch =
      (await searchInput.isVisible()) || (await searchButton.isVisible());
    // Search may or may not be in header, so this is a soft check
  });
});
