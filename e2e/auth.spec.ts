import { test, expect, hasTestCredentials, loginUser } from "./fixtures";

test.describe("Authentication Flow", () => {
  test.describe("Login Page", () => {
    test("displays login page", async ({ page }) => {
      await page.goto("/login");

      await expect(
        page.getByRole("heading", { name: /welcome back/i })
      ).toBeVisible();
      await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible();
      await expect(page.getByPlaceholder(/••••/)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /sign in$/i })
      ).toBeVisible();
    });

    test("has link to signup page", async ({ page }) => {
      await page.goto("/login");

      const signupLink = page.getByRole("link", { name: /sign up/i });
      await expect(signupLink).toBeVisible();
      await signupLink.click();

      await expect(page).toHaveURL(/\/signup/);
    });

    test("has link to forgot password", async ({ page }) => {
      await page.goto("/login");

      const forgotLink = page.getByRole("link", { name: /forgot password/i });
      await expect(forgotLink).toBeVisible();
    });
  });

  test.describe("Signup Page", () => {
    test("displays signup page", async ({ page }) => {
      await page.goto("/signup");

      await expect(
        page.getByRole("heading", { name: /create|join|sign up|get started/i })
      ).toBeVisible();
      await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible();
    });

    test("has link to login page", async ({ page }) => {
      await page.goto("/signup");

      const loginLink = page.getByRole("link", { name: /sign in|log in/i });
      await expect(loginLink).toBeVisible();
      await loginLink.click();

      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Protected Routes", () => {
    test("redirects unauthenticated user from discover to login", async ({ page }) => {
      await page.goto("/discover");
      await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated user from profile to login", async ({ page }) => {
      await page.goto("/profile");
      await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated user from grants to login", async ({ page }) => {
      await page.goto("/grants");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Login Flow", () => {
    test.skip(!hasTestCredentials, "Test credentials not configured");

    test("successful login redirects to discover or onboarding", async ({ page }) => {
      await loginUser(page, process.env.OUTPOST_TEST_EMAIL!, process.env.OUTPOST_TEST_PASSWORD!);
      
      // Should be on discover or onboarding depending on user state
      await expect(page).toHaveURL(/\/(discover|onboarding)/);
    });
  });
});
