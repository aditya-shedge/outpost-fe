import { test as base, expect, Page, BrowserContext } from "@playwright/test";

// Test user credentials - set these environment variables to run authenticated tests
// OUTPOST_TEST_EMAIL and OUTPOST_TEST_PASSWORD
const TEST_EMAIL = process.env.OUTPOST_TEST_EMAIL;
const TEST_PASSWORD = process.env.OUTPOST_TEST_PASSWORD;

export const hasTestCredentials = !!(TEST_EMAIL && TEST_PASSWORD);

// Helper to login and get authenticated
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  
  await page.getByPlaceholder(/you@example.com/i).fill(email);
  await page.getByPlaceholder(/••••/).fill(password);
  await page.getByRole("button", { name: /sign in$/i }).click();
  
  // Wait for redirect after login
  await page.waitForURL(/\/(discover|onboarding)/, { timeout: 15000 });
}

// Extended test with auth helpers for real backend
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    if (!hasTestCredentials) {
      throw new Error(
        "Test credentials not set. Set OUTPOST_TEST_EMAIL and OUTPOST_TEST_PASSWORD environment variables."
      );
    }
    
    await loginUser(page, TEST_EMAIL!, TEST_PASSWORD!);
    await use(page);
  },
});

export { expect };
