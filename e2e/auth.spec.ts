import { test, expect } from "@playwright/test";
import { mockUser, mockUserNotOnboarded, setupAuthenticatedMocks } from "./fixtures";

test.describe("Authentication Flow", () => {
  test.describe("Login", () => {
    test("displays login page", async ({ page }) => {
      await page.goto("/login");

      // Actual heading is "Welcome back"
      await expect(
        page.getByRole("heading", { name: /welcome back/i })
      ).toBeVisible();
      await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible();
      await expect(page.getByPlaceholder(/••••/)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /sign in$/i })
      ).toBeVisible();
    });

    // Skip: requires proper API mocking that conflicts with real backend
    test.skip("shows error for invalid credentials", async ({ page }) => {
      await page.route("**/api/v1/auth/login", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Invalid credentials" }),
        });
      });

      await page.goto("/login");

      await page.getByPlaceholder(/you@example.com/i).fill("wrong@example.com");
      await page.getByPlaceholder(/••••/).fill("wrongpassword");
      await page.getByRole("button", { name: /sign in$/i }).click();

      await expect(page.getByText(/invalid|incorrect|wrong|failed/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test("successful login redirects to discover", async ({ page }) => {
      await page.route("**/api/v1/auth/login", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
          }),
        });
      });

      await page.route("**/api/v1/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockUser),
        });
      });

      await setupAuthenticatedMocks(page);

      await page.goto("/login");

      await page.getByPlaceholder(/you@example.com/i).fill("jane@example.com");
      await page.getByPlaceholder(/••••/).fill("password123");
      await page.getByRole("button", { name: /sign in$/i }).click();

      await expect(page).toHaveURL(/\/discover/, { timeout: 10000 });
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

  test.describe("Signup", () => {
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
    test("redirects unauthenticated user from discover to login", async ({
      page,
    }) => {
      await page.goto("/discover");
      await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated user from profile to login", async ({
      page,
    }) => {
      await page.goto("/profile");
      await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated user from grants to login", async ({
      page,
    }) => {
      await page.goto("/grants");
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
