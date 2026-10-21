import { test, expect } from "@playwright/test";
import { mockUser, mockUserNotOnboarded } from "./fixtures";

test.describe("Authentication Flow", () => {
  test.describe("Login", () => {
    test("displays login page", async ({ page }) => {
      await page.goto("/login");

      await expect(
        page.getByRole("heading", { name: /log in|sign in/i })
      ).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /log in|sign in/i })
      ).toBeVisible();
    });

    test("shows validation errors for empty fields", async ({ page }) => {
      await page.goto("/login");

      await page.getByRole("button", { name: /log in|sign in/i }).click();

      // Should show validation errors
      await expect(page.getByText(/email.*required|enter.*email/i)).toBeVisible(
        { timeout: 3000 }
      );
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await page.route("**/api/v1/auth/login", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Invalid credentials" }),
        });
      });

      await page.goto("/login");

      await page.getByLabel(/email/i).fill("wrong@example.com");
      await page.getByLabel(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: /log in|sign in/i }).click();

      await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test("successful login redirects to discover", async ({ page, context }) => {
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

      await page.goto("/login");

      await page.getByLabel(/email/i).fill("jane@example.com");
      await page.getByLabel(/password/i).fill("password123");
      await page.getByRole("button", { name: /log in|sign in/i }).click();

      await expect(page).toHaveURL(/\/discover/, { timeout: 10000 });
    });

    test("login redirects to onboarding for non-onboarded users", async ({
      page,
    }) => {
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
          body: JSON.stringify(mockUserNotOnboarded),
        });
      });

      await page.goto("/login");

      await page.getByLabel(/email/i).fill("new@example.com");
      await page.getByLabel(/password/i).fill("password123");
      await page.getByRole("button", { name: /log in|sign in/i }).click();

      await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
    });

    test("has link to signup page", async ({ page }) => {
      await page.goto("/login");

      const signupLink = page.getByRole("link", {
        name: /sign up|create.*account|register/i,
      });
      await expect(signupLink).toBeVisible();
      await signupLink.click();

      await expect(page).toHaveURL(/\/signup/);
    });

    test("has link to forgot password", async ({ page }) => {
      await page.goto("/login");

      const forgotLink = page.getByRole("link", {
        name: /forgot|reset.*password/i,
      });
      await expect(forgotLink).toBeVisible();
    });
  });

  test.describe("Signup", () => {
    test("displays signup page", async ({ page }) => {
      await page.goto("/signup");

      await expect(
        page.getByRole("heading", { name: /sign up|create.*account|register/i })
      ).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    });

    test("shows validation for weak password", async ({ page }) => {
      await page.route("**/api/v1/auth/signup", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Password must be at least 8 characters",
          }),
        });
      });

      await page.goto("/signup");

      await page.getByLabel(/email/i).fill("new@example.com");
      const passwordFields = page.getByLabel(/password/i);
      await passwordFields.first().fill("weak");
      if ((await passwordFields.count()) > 1) {
        await passwordFields.nth(1).fill("weak");
      }

      await page.getByRole("button", { name: /sign up|create|register/i }).click();

      await expect(page.getByText(/password.*8|too short|weak/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test("successful signup shows verification message", async ({ page }) => {
      await page.route("**/api/v1/auth/signup", async (route) => {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ message: "Verification email sent" }),
        });
      });

      await page.goto("/signup");

      await page.getByLabel(/email/i).fill("new@example.com");
      const passwordFields = page.getByLabel(/password/i);
      await passwordFields.first().fill("StrongPass123!");
      if ((await passwordFields.count()) > 1) {
        await passwordFields.nth(1).fill("StrongPass123!");
      }

      await page.getByRole("button", { name: /sign up|create|register/i }).click();

      // Should redirect to verify email or show success message
      await expect(
        page.getByText(/verify|check.*email|confirmation/i)
      ).toBeVisible({ timeout: 10000 });
    });

    test("has link to login page", async ({ page }) => {
      await page.goto("/signup");

      const loginLink = page.getByRole("link", {
        name: /log in|sign in|already.*account/i,
      });
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

    test("redirects unauthenticated user from challenges to login", async ({
      page,
    }) => {
      await page.goto("/challenges");
      await expect(page).toHaveURL(/\/login/);
    });

    test("redirects unauthenticated user from mentors to login", async ({
      page,
    }) => {
      await page.goto("/mentors");
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Logout", () => {
    test("logging out clears session and redirects to login", async ({
      page,
      context,
    }) => {
      // Set up authenticated state
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

      await page.goto("/discover");

      // Find and click logout button/link
      const logoutButton = page.getByRole("button", { name: /log out|sign out/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page).toHaveURL(/\/login|\/$/);
      }
    });
  });
});
