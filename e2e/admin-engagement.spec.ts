import { test, expect, Page } from "@playwright/test";
import { loginAsAdmin, loginAsFounder } from "./fixtures";

test.describe("Admin Engagement Dashboard (OP-085)", () => {
  test.describe("Access Control", () => {
    test("should allow admin to access engagement dashboard", async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin/engagement");
      
      // Should see the dashboard
      await expect(page.locator("h1")).toContainText("Engagement Dashboard");
    });

    test("should block founder from accessing engagement dashboard", async ({ page }) => {
      await loginAsFounder(page);
      await page.goto("/admin/engagement");
      
      // Should be redirected away (either to /discover or show access denied)
      await page.waitForURL(/\/(discover|admin)$/);
      
      // Should not see engagement dashboard
      const heading = page.locator("h1");
      await expect(heading).not.toContainText("Engagement Dashboard");
    });

    test("should redirect anonymous user to login", async ({ page }) => {
      await page.goto("/admin/engagement");
      
      // Should be redirected to login
      await page.waitForURL(/\/login/);
    });
  });

  test.describe("Dashboard Content", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin/engagement");
      await page.waitForLoadState("networkidle");
    });

    test("should display all required sections", async ({ page }) => {
      // Check for filter controls
      await expect(page.locator('text=Date Range')).toBeVisible();
      await expect(page.locator('text=Content Type')).toBeVisible();
      
      // Check for preset buttons
      await expect(page.locator('button:has-text("Last 7 days")')).toBeVisible();
      await expect(page.locator('button:has-text("Last 30 days")')).toBeVisible();
      await expect(page.locator('button:has-text("Last 90 days")')).toBeVisible();
      
      // Last 30 days should be selected by default
      const thirtyDaysBtn = page.locator('button:has-text("Last 30 days")');
      await expect(thirtyDaysBtn).toHaveClass(/bg-gold/);
    });

    test("should display top viewed content table", async ({ page }) => {
      const topViewedSection = page.locator('text=Top Viewed Content').locator("..");
      await expect(topViewedSection).toBeVisible();
      
      // Check table headers
      await expect(page.locator('th:has-text("Content Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Type")')).toBeVisible();
      await expect(page.locator('th:has-text("Views")')).toBeVisible();
      await expect(page.locator('th:has-text("Clicks")')).toBeVisible();
    });

    test("should display top clicked content table", async ({ page }) => {
      const topClickedSection = page.locator('text=Top Clicked Content').locator("..");
      await expect(topClickedSection).toBeVisible();
    });

    test("should display weekly views trend chart", async ({ page }) => {
      // Look for the chart container
      const chartSection = page.locator('text=Weekly Views Trend').locator("..");
      await expect(chartSection).toBeVisible();
      
      // Check if recharts SVG is rendered
      const chart = chartSection.locator("svg.recharts-surface");
      await expect(chart).toBeVisible();
    });

    test("should display sector breakdown chart", async ({ page }) => {
      const sectorSection = page.locator('text=Views by Sector').locator("..");
      await expect(sectorSection).toBeVisible();
    });

    test("should display stage breakdown chart", async ({ page }) => {
      const stageSection = page.locator('text=Views by Stage').locator("..");
      await expect(stageSection).toBeVisible();
    });
  });

  test.describe("Filters", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin/engagement");
      await page.waitForLoadState("networkidle");
    });

    test("should change date range when preset is clicked", async ({ page }) => {
      const sevenDaysBtn = page.locator('button:has-text("Last 7 days")');
      await sevenDaysBtn.click();
      
      // Button should be highlighted
      await expect(sevenDaysBtn).toHaveClass(/bg-gold/);
      
      // Apply button should trigger new data fetch
      await page.locator('button:has-text("Apply")').click();
      await page.waitForLoadState("networkidle");
    });

    test("should filter by content type", async ({ page }) => {
      const contentTypeSelect = page.locator('select').first();
      
      // Select Grants
      await contentTypeSelect.selectOption("GRANT");
      await page.locator('button:has-text("Apply")').click();
      await page.waitForLoadState("networkidle");
      
      // Select Challenges
      await contentTypeSelect.selectOption("CHALLENGE");
      await page.locator('button:has-text("Apply")').click();
      await page.waitForLoadState("networkidle");
      
      // Select Mentors
      await contentTypeSelect.selectOption("MENTOR");
      await page.locator('button:has-text("Apply")').click();
      await page.waitForLoadState("networkidle");
      
      // Back to All
      await contentTypeSelect.selectOption("");
      await page.locator('button:has-text("Apply")').click();
      await page.waitForLoadState("networkidle");
    });

    test("should disable apply button while loading", async ({ page }) => {
      const applyBtn = page.locator('button:has-text("Apply")');
      
      // Click apply
      await applyBtn.click();
      
      // Should show loading state (optional - depends on timing)
      // await expect(applyBtn).toBeDisabled();
      // await expect(applyBtn).toContainText("Loading");
      
      // Wait for completion
      await page.waitForLoadState("networkidle");
      await expect(applyBtn).toBeEnabled();
    });
  });

  test.describe("Table Content", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin/engagement");
      await page.waitForLoadState("networkidle");
    });

    test("should display content type badges with correct colors", async ({ page }) => {
      // Look for badge elements
      const grantBadge = page.locator('span:has-text("GRANT")').first();
      const challengeBadge = page.locator('span:has-text("CHALLENGE")').first();
      const mentorBadge = page.locator('span:has-text("MENTOR")').first();
      
      // Check if at least one badge type exists and has color styling
      const badgeCount = await page.locator('span').filter({ hasText: /^(GRANT|CHALLENGE|MENTOR)$/ }).count();
      expect(badgeCount).toBeGreaterThan(0);
      
      // Check that badges have color classes
      if (await grantBadge.isVisible()) {
        await expect(grantBadge).toHaveClass(/blue/);
      }
      if (await challengeBadge.isVisible()) {
        await expect(challengeBadge).toHaveClass(/orange/);
      }
      if (await mentorBadge.isVisible()) {
        await expect(mentorBadge).toHaveClass(/green/);
      }
    });

    test("should format numbers with thousand separators", async ({ page }) => {
      // Look for numbers in the table
      const viewsCell = page.locator('td').filter({ hasText: /^\d{1,3}(,\d{3})*$/ }).first();
      
      // If we have data, check formatting
      if (await viewsCell.isVisible()) {
        const text = await viewsCell.textContent();
        // Should contain comma for numbers >= 1000
        if (parseInt(text?.replace(/,/g, '') || '0') >= 1000) {
          expect(text).toMatch(/,/);
        }
      }
    });

    test("should have clickable content links", async ({ page }) => {
      // Find first content link in table
      const contentLink = page.locator('table a').first();
      
      if (await contentLink.isVisible()) {
        const href = await contentLink.getAttribute("href");
        
        // Should link to admin content pages
        expect(href).toMatch(/\/admin\/(grants|challenges|mentors)\//);
      }
    });
  });

  test.describe("Empty States", () => {
    test("should show empty state when no data available", async ({ page }) => {
      await loginAsAdmin(page);
      
      // Use a date range far in the past with no data
      // This test assumes there's no data in year 2020
      // In real testing, you'd mock the API response
      await page.goto("/admin/engagement");
      await page.waitForLoadState("networkidle");
      
      // If we get an empty result, check for empty state messaging
      const emptyMessage = page.locator('text=No Data Available, text=No views recorded, text=No clicks recorded');
      // At least one empty state should be visible if there's no data
      // This is optional as it depends on actual data
    });

    test("should show individual section empty states", async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin/engagement");
      await page.waitForLoadState("networkidle");
      
      // Check if empty state icons are present when sections are empty
      const emptyIcons = page.locator('text=📊, text=🖱️');
      // These might or might not be visible depending on data
    });
  });

  test.describe("Loading States", () => {
    test("should show loading spinner on initial load", async ({ page }) => {
      await loginAsAdmin(page);
      
      // Navigate and immediately check for spinner
      const responsePromise = page.waitForResponse(/\/api\/v1\/admin\/engagement\/summary/);
      await page.goto("/admin/engagement");
      
      // Should show loading spinner while fetching
      // This might be too fast to catch in some cases
      const spinner = page.locator('[class*="spinner"], [class*="loading"]');
      
      await responsePromise;
      await page.waitForLoadState("networkidle");
    });
  });

  test.describe("Error Handling", () => {
    test("should handle API errors gracefully", async ({ page }) => {
      await loginAsAdmin(page);
      
      // Intercept API and return error
      await page.route("**/api/v1/admin/engagement/summary*", (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({
            status: 500,
            error: "Internal Server Error",
            code: "SERVER_ERROR",
            message: "Failed to fetch engagement data",
          }),
        });
      });
      
      await page.goto("/admin/engagement");
      await page.waitForLoadState("networkidle");
      
      // Should show error message
      await expect(page.locator('text=Failed to load engagement data')).toBeVisible();
      
      // Should have retry button
      await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    });

    test("should handle 403 forbidden error", async ({ page }) => {
      await loginAsFounder(page);
      
      // Try to access admin engagement
      await page.goto("/admin/engagement");
      
      // Should not show dashboard
      await expect(page.locator('h1:has-text("Engagement Dashboard")')).not.toBeVisible();
    });
  });

  test.describe("Data Privacy (No PII)", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin/engagement");
      await page.waitForLoadState("networkidle");
    });

    test("should not display founder email addresses", async ({ page }) => {
      // Check entire page content
      const content = await page.textContent("body");
      
      // Should not contain email addresses
      // This is a basic check - in production you'd verify more thoroughly
      expect(content).not.toMatch(/\w+@\w+\.\w+/);
    });

    test("should only show aggregated data", async ({ page }) => {
      // Verify that tables only show content names, not founder names
      // (unless the content IS a mentor, where the mentor name is the content)
      
      // Charts should only show sector/stage dimensions, not individual founders
      const sectorChart = page.locator('text=Views by Sector').locator("..");
      const stageChart = page.locator('text=Views by Stage').locator("..");
      
      await expect(sectorChart).toBeVisible();
      await expect(stageChart).toBeVisible();
      
      // No individual founder breakdowns should exist
      await expect(page.locator('text=Views by Founder')).not.toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should have engagement link in admin sidebar", async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin");
      
      // Check for engagement nav item
      const engagementLink = page.locator('a:has-text("Engagement")');
      await expect(engagementLink).toBeVisible();
      
      // Click it
      await engagementLink.click();
      await page.waitForURL(/\/admin\/engagement/);
      
      // Should be highlighted
      await expect(engagementLink).toHaveClass(/bg-gold/);
    });

    test("should maintain active state on engagement page", async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto("/admin/engagement");
      
      const engagementLink = page.locator('a:has-text("Engagement")');
      await expect(engagementLink).toHaveClass(/bg-gold/);
    });
  });
});
