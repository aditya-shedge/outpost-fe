import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the hero section", async ({ page }) => {
    await page.goto("/");
    
    // Check for main headline
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    
    // Check for CTA button
    await expect(page.getByRole("link", { name: /T-Hub founder/i })).toBeVisible();
  });

  test("should navigate to login when clicking CTA", async ({ page }) => {
    await page.goto("/");
    
    await page.getByRole("link", { name: /T-Hub founder/i }).click();
    
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Auth Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    
    await expect(page.getByRole("heading", { name: /log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should show signup page", async ({ page }) => {
    await page.goto("/signup");
    
    await expect(page.getByRole("heading", { name: /create.*account/i })).toBeVisible();
  });

  test("should redirect unauthenticated users from protected routes", async ({ page }) => {
    await page.goto("/discover");
    
    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });
});
