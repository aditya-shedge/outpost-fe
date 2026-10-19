import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DiscoverPage from "./page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock useAuth
jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    user: { founderName: "Jane Doe" },
    isAuthenticated: true,
    isVerified: true,
    isOnboarded: true,
  }),
}));

// Mock API functions - must be hoisted before the variables
jest.mock("@/lib/api/grants", () => ({
  getGrants: jest.fn().mockResolvedValue({ 
    content: [
      {
        id: "grant-1",
        name: "Startup India Seed Fund",
        issuingBody: "Government of India",
        amountDisplay: "₹50L",
        deadline: "2026-12-31",
        summary: "Seed funding for early-stage startups",
      },
    ], 
    page: { totalElements: 1 } 
  }),
}));

jest.mock("@/lib/api/challenges", () => ({
  getChallenges: jest.fn().mockResolvedValue({ 
    content: [
      {
        id: "challenge-1",
        title: "AI Innovation Challenge",
        corporateName: "TechCorp",
        deadline: "2026-11-30",
        status: "OPEN",
        problemStatement: "Build AI solutions for healthcare",
      },
    ], 
    page: { totalElements: 1 } 
  }),
}));

jest.mock("@/lib/api/mentors", () => ({
  getMentors: jest.fn().mockResolvedValue({ 
    content: [
      {
        id: "mentor-1",
        name: "John Smith",
        headline: "Startup Advisor",
        expertise: ["Strategy", "Fundraising"],
        photoUrl: null,
      },
    ], 
    page: { totalElements: 1 } 
  }),
}));

describe("Discover Page", () => {
  describe("FE-016: Hero Section + Stats", () => {
    it("renders hero section with correct text", async () => {
      render(<DiscoverPage />);
      
      // Use getAllBy for elements that might appear multiple times
      expect(screen.getAllByText(/CURATED FOR T-HUB FOUNDERS/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/What will move your startup forward/i)).toBeInTheDocument();
    });

    it("displays stats cards", async () => {
      render(<DiscoverPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Open calls")).toBeInTheDocument();
        expect(screen.getByText("Mentors")).toBeInTheDocument();
        expect(screen.getByText("Closing soon")).toBeInTheDocument();
      });
    });

    it("personalizes greeting with user name", async () => {
      render(<DiscoverPage />);
      
      expect(screen.getByText(/Jane/)).toBeInTheDocument();
    });
  });

  describe("FE-017: Opportunities Section", () => {
    it("renders opportunities heading", async () => {
      render(<DiscoverPage />);
      
      expect(screen.getByText("Opportunities for you")).toBeInTheDocument();
    });

    it("shows filter pills", async () => {
      render(<DiscoverPage />);
      
      expect(screen.getByText("All opportunities")).toBeInTheDocument();
      expect(screen.getByText("Grants")).toBeInTheDocument();
      expect(screen.getByText("Challenges")).toBeInTheDocument();
    });

    it("renders opportunity cards after loading", async () => {
      render(<DiscoverPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Startup India Seed Fund")).toBeInTheDocument();
        expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
      });
    });

    it("filters opportunities when clicking filter pill", async () => {
      const user = userEvent.setup();
      render(<DiscoverPage />);
      
      await waitFor(() => {
        expect(screen.getByText("Startup India Seed Fund")).toBeInTheDocument();
      });

      // Click on Challenges filter
      await user.click(screen.getByText("Challenges"));
      
      // Grant should be hidden, challenge should be visible
      expect(screen.queryByText("Startup India Seed Fund")).not.toBeInTheDocument();
      expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
    });

    it("shows explore all link", async () => {
      render(<DiscoverPage />);
      
      expect(screen.getByText("Explore all opportunities")).toBeInTheDocument();
    });
  });

  describe("FE-018: Mentors Section", () => {
    it("renders mentors section with dark theme heading", async () => {
      render(<DiscoverPage />);
      
      expect(screen.getByText(/FOUNDER TO FOUNDER/i)).toBeInTheDocument();
      expect(screen.getByText(/Meet mentors who've been there/i)).toBeInTheDocument();
    });

    it("renders mentor cards after loading", async () => {
      render(<DiscoverPage />);
      
      await waitFor(() => {
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(screen.getByText("Startup Advisor")).toBeInTheDocument();
      });
    });

    it("shows browse all mentors link", async () => {
      render(<DiscoverPage />);
      
      expect(screen.getByText("Browse all mentors")).toBeInTheDocument();
    });
  });
});
