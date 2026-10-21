import { test as base, expect, Page } from "@playwright/test";

// Mock data
export const mockUser = {
  id: "user-123",
  email: "jane@example.com",
  founderName: "Jane Doe",
  startupName: "Acme Inc",
  stageId: "stage-1",
  sectorId: "sector-1",
  city: "Hyderabad",
  website: "https://acme.com",
  onboarded: true,
  emailVerified: true,
  roles: ["FOUNDER"],
};

export const mockUserNotOnboarded = {
  ...mockUser,
  founderName: null,
  startupName: null,
  stageId: null,
  sectorId: null,
  city: null,
  onboarded: false,
};

export const mockStages = [
  { id: "stage-1", name: "Ideation" },
  { id: "stage-2", name: "MVP" },
  { id: "stage-3", name: "Growth" },
];

export const mockSectors = [
  { id: "sector-1", name: "FinTech" },
  { id: "sector-2", name: "HealthTech" },
  { id: "sector-3", name: "EdTech" },
];

export const mockGrants = {
  content: [
    {
      id: "grant-1",
      title: "Startup India Seed Fund",
      provider: "Government of India",
      amountMin: 100000,
      amountMax: 500000,
      deadline: "2024-12-31",
      stage: { id: "stage-1", name: "Ideation" },
      sectors: [{ id: "sector-1", name: "FinTech" }],
      status: "PUBLISHED",
    },
    {
      id: "grant-2",
      title: "T-Hub Innovation Grant",
      provider: "T-Hub",
      amountMin: 50000,
      amountMax: 200000,
      deadline: "2024-11-30",
      stage: { id: "stage-2", name: "MVP" },
      sectors: [{ id: "sector-2", name: "HealthTech" }],
      status: "PUBLISHED",
    },
  ],
  page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
};

export const mockGrantDetail = {
  id: "grant-1",
  title: "Startup India Seed Fund",
  provider: "Government of India",
  description: "A comprehensive funding program for early-stage startups.",
  amountMin: 100000,
  amountMax: 500000,
  deadline: "2024-12-31",
  stage: { id: "stage-1", name: "Ideation" },
  sectors: [{ id: "sector-1", name: "FinTech" }],
  eligibility: ["Must be registered in India", "Less than 2 years old"],
  applicationUrl: "https://startupindia.gov.in/apply",
  status: "PUBLISHED",
};

export const mockChallenges = {
  content: [
    {
      id: "challenge-1",
      title: "FinTech Innovation Challenge",
      organizer: "NPCI",
      deadline: "2024-12-15",
      prizePool: 1000000,
      theme: "Payments",
      status: "PUBLISHED",
    },
    {
      id: "challenge-2",
      title: "HealthTech Hackathon",
      organizer: "Apollo",
      deadline: "2024-11-20",
      prizePool: 500000,
      theme: "Healthcare",
      status: "PUBLISHED",
    },
  ],
  page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
};

export const mockChallengeDetail = {
  id: "challenge-1",
  title: "FinTech Innovation Challenge",
  organizer: "NPCI",
  description: "Build the next generation of payment solutions.",
  deadline: "2024-12-15",
  prizePool: 1000000,
  theme: "Payments",
  eligibility: ["Indian startups only", "Must have a working prototype"],
  applicationUrl: "https://npci.org.in/challenge",
  status: "PUBLISHED",
};

export const mockMentors = {
  content: [
    {
      id: "mentor-1",
      name: "Rajesh Kumar",
      title: "CTO",
      company: "Tech Corp",
      expertise: ["Product", "Engineering"],
      bio: "20+ years in tech leadership",
      imageUrl: null,
    },
    {
      id: "mentor-2",
      name: "Priya Sharma",
      title: "CEO",
      company: "StartupX",
      expertise: ["Strategy", "Fundraising"],
      bio: "Serial entrepreneur and investor",
      imageUrl: null,
    },
  ],
  page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
};

export const mockMentorDetail = {
  id: "mentor-1",
  name: "Rajesh Kumar",
  title: "CTO",
  company: "Tech Corp",
  expertise: ["Product", "Engineering"],
  bio: "20+ years in tech leadership. Built products used by millions.",
  linkedinUrl: "https://linkedin.com/in/rajesh",
  calendlyUrl: "https://calendly.com/rajesh",
  imageUrl: null,
};

// Helper to setup common API mocks for authenticated user
export async function setupAuthenticatedMocks(page: Page, user = mockUser) {
  // Set up all routes before any navigation
  await page.route("**/api/v1/me", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(user),
      });
    } else if (route.request().method() === "PATCH") {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...user, ...body }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/v1/me/identities", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
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

  await page.route("**/api/v1/grants?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockGrants),
    });
  });

  await page.route("**/api/v1/grants/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockGrantDetail),
    });
  });

  await page.route("**/api/v1/challenges?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockChallenges),
    });
  });

  await page.route("**/api/v1/challenges/themes", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(["Payments", "Healthcare", "Education"]),
    });
  });

  await page.route("**/api/v1/challenges/*", async (route) => {
    if (route.request().url().includes("themes")) return;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockChallengeDetail),
    });
  });

  await page.route("**/api/v1/mentors?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockMentors),
    });
  });

  await page.route("**/api/v1/mentors/*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockMentorDetail),
    });
  });

  await page.route("**/api/v1/spotlight", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(null),
    });
  });

  await page.route("**/api/v1/benefits**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } }),
    });
  });
}

// Extended test with auth helpers
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page, context }, use) => {
    // Set auth token in localStorage before each test
    // Keys must match what the app uses: outpost_access_token, outpost_refresh_token
    await context.addInitScript(() => {
      window.localStorage.setItem("outpost_access_token", "mock-access-token");
      window.localStorage.setItem("outpost_refresh_token", "mock-refresh-token");
    });
    
    // Setup all mocks
    await setupAuthenticatedMocks(page);
    
    await use(page);
  },
});

export { expect };
