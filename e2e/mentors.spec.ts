import { test, expect, setupAuthenticatedMocks } from "./fixtures";

test.describe("Mentors Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await setupAuthenticatedMocks(page);
  });

  test("displays mentors list page", async ({ page }) => {
    await page.goto("/mentors");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Rajesh Kumar")).toBeVisible();
  });

  test("shows mentor cards with company", async ({ page }) => {
    await page.goto("/mentors");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Tech Corp")).toBeVisible({ timeout: 10000 });
  });

  test("clicking a mentor navigates to detail page", async ({ page }) => {
    await page.goto("/mentors");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Rajesh Kumar")).toBeVisible({ timeout: 10000 });
    await page.getByText("Rajesh Kumar").click();

    await expect(page).toHaveURL(/\/mentors\/mentor-1/);
  });

  test("mentor detail page shows bio", async ({ page }) => {
    await page.goto("/mentors/mentor-1");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Rajesh Kumar")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/20\+ years in tech leadership/i)).toBeVisible();
  });
});

test.describe("Mentor Application", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await setupAuthenticatedMocks(page);
  });

  test("displays mentor application page", async ({ page }) => {
    await page.goto("/mentors/apply");
    await page.waitForLoadState("networkidle");

    // Check page loaded
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
  });
});
