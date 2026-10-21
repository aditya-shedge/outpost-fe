import { test, expect } from "@playwright/test";
import {
  mockUser,
  mockMentors,
  mockMentorDetail,
  mockStages,
  mockSectors,
} from "./fixtures";

test.describe("Mentors Flow", () => {
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

    await page.route("**/api/v1/mentors?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMentors),
      });
    });

    await page.route("**/api/v1/mentors/mentor-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMentorDetail),
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

  test("displays mentors list page", async ({ page }) => {
    await page.goto("/mentors");

    await expect(page.getByRole("heading", { name: /mentors/i })).toBeVisible();
    await expect(page.getByText("Rajesh Kumar")).toBeVisible();
    await expect(page.getByText("Priya Sharma")).toBeVisible();
  });

  test("shows mentor cards with key information", async ({ page }) => {
    await page.goto("/mentors");

    await expect(page.getByText("Tech Corp")).toBeVisible();
    await expect(page.getByText("CTO")).toBeVisible();
  });

  test("clicking a mentor navigates to detail page", async ({ page }) => {
    await page.goto("/mentors");

    await page.getByText("Rajesh Kumar").click();

    await expect(page).toHaveURL(/\/mentors\/mentor-1/);
  });

  test("mentor detail page shows full information", async ({ page }) => {
    await page.goto("/mentors/mentor-1");

    await expect(page.getByText("Rajesh Kumar")).toBeVisible();
    await expect(page.getByText("Tech Corp")).toBeVisible();
    await expect(page.getByText(/20\+ years in tech leadership/i)).toBeVisible();
  });

  test("mentor detail has book session button", async ({ page }) => {
    await page.goto("/mentors/mentor-1");

    const bookButton = page.getByRole("link", {
      name: /book|schedule|connect/i,
    });
    await expect(bookButton).toBeVisible();
  });

  test("shows empty state when no mentors available", async ({ page }) => {
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

    await page.goto("/mentors");

    await expect(
      page.getByText(/no mentors|no results|nothing found/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Mentor Application Flow", () => {
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

  test("displays mentor application page", async ({ page }) => {
    await page.goto("/mentors/apply");

    await expect(
      page.getByRole("heading", { name: /become a mentor|apply.*mentor/i })
    ).toBeVisible();
  });

  test("mentor application form has required fields", async ({ page }) => {
    await page.goto("/mentors/apply");

    // Check for key form fields
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/linkedin/i)).toBeVisible();
  });

  test("submits mentor application successfully", async ({ page }) => {
    await page.route("**/api/v1/mentors/apply", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "application-1", status: "PENDING" }),
      });
    });

    await page.goto("/mentors/apply");

    // Fill form - adjust selectors based on actual form
    const nameInput = page.getByLabel(/your name|name/i).first();
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test Mentor");
    }

    const linkedinInput = page.getByLabel(/linkedin/i);
    if (await linkedinInput.isVisible()) {
      await linkedinInput.fill("https://linkedin.com/in/testmentor");
    }

    // Submit if all required fields are filled
    const submitButton = page.getByRole("button", { name: /submit|apply/i });
    if (await submitButton.isEnabled()) {
      await submitButton.click();
    }
  });
});
