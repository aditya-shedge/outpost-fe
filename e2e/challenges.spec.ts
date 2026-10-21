import { test, expect, setupAuthenticatedMocks } from "./fixtures";

test.describe("Challenges Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });

    await setupAuthenticatedMocks(page);
  });

  test("displays challenges list page", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("FinTech Innovation Challenge")).toBeVisible();
  });

  test("shows challenge cards with organizer", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("NPCI")).toBeVisible({ timeout: 10000 });
  });

  test("clicking a challenge navigates to detail page", async ({ page }) => {
    await page.goto("/challenges");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("FinTech Innovation Challenge")).toBeVisible({ timeout: 10000 });
    await page.getByText("FinTech Innovation Challenge").click();

    await expect(page).toHaveURL(/\/challenges\/challenge-1/);
  });

  test("challenge detail page shows description", async ({ page }) => {
    await page.goto("/challenges/challenge-1");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("FinTech Innovation Challenge")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/next generation of payment/i)).toBeVisible();
  });
});
