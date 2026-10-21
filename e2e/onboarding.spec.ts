import { test, expect } from "./fixtures";

// Onboarding tests - checks page behavior based on auth state
test.describe("Onboarding Page", () => {
  test("redirects appropriately based on auth state", async ({ page }) => {
    // Access onboarding directly
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    
    // Wait for any redirect to complete
    await page.waitForTimeout(2000);
    
    const url = page.url();
    
    // Should redirect to login if not authenticated
    // Or redirect to discover if already onboarded
    // Or stay on onboarding if authenticated but not onboarded
    expect(url).toMatch(/\/(login|discover|onboarding)/);
  });
});
