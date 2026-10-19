import { render, screen, waitFor } from "@testing-library/react";
import GrantDetailPage from "./page";

// Mock next/navigation
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "grant-1" }),
  useRouter: () => ({ back: mockBack }),
}));

// Mock API - inline mock data to avoid hoisting issues
jest.mock("@/lib/api/grants", () => ({
  getGrantById: jest.fn().mockResolvedValue({
    id: "grant-1",
    name: "Startup India Seed Fund",
    issuingBody: "Government of India",
    type: "GRANT",
    amountDisplay: "₹50L - 1Cr",
    deadline: "2026-12-31",
    summary: "A comprehensive seed funding program for early-stage startups.",
    eligibility: "Must be a registered startup in India.\nMust have innovative product or service.",
    whatIsFunded: "Product development\nMarketing and sales\nTeam expansion",
    howToApply: "1. Register on Startup India portal\n2. Submit application\n3. Await review",
    sourceUrl: "https://startupindia.gov.in",
    expired: false,
    stages: ["Ideation", "MVP", "Growth"],
    sectors: ["FinTech", "HealthTech"],
  }),
}));

describe("Grant Detail Page (FE-021)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders breadcrumb navigation", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Grants")).toBeInTheDocument();
    });
  });

  it("displays grant title and issuing body", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Startup India Seed Fund" })).toBeInTheDocument();
      expect(screen.getByText("Government of India")).toBeInTheDocument();
    });
  });

  it("shows category badge", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText("GRANT").length).toBeGreaterThan(0);
    });
  });

  it("displays key info cards (amount, deadline)", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Funding Amount")).toBeInTheDocument();
      expect(screen.getByText("₹50L - 1Cr")).toBeInTheDocument();
      expect(screen.getByText("Deadline")).toBeInTheDocument();
    });
  });

  it("shows content sections", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Eligibility")).toBeInTheDocument();
      expect(screen.getByText("What is Funded")).toBeInTheDocument();
      expect(screen.getByText("How to Apply")).toBeInTheDocument();
    });
  });

  it("displays CTA button linking to source", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      const sourceLink = screen.getByText("Visit Official Source");
      expect(sourceLink).toBeInTheDocument();
      expect(sourceLink.closest("a")).toHaveAttribute("href", "https://startupindia.gov.in");
      expect(sourceLink.closest("a")).toHaveAttribute("target", "_blank");
    });
  });

  it("shows eligible stages", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Startup Stages")).toBeInTheDocument();
      expect(screen.getByText("Ideation")).toBeInTheDocument();
      expect(screen.getByText("MVP")).toBeInTheDocument();
      expect(screen.getByText("Growth")).toBeInTheDocument();
    });
  });

  it("shows eligible sectors", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Sectors")).toBeInTheDocument();
      expect(screen.getByText("FinTech")).toBeInTheDocument();
      expect(screen.getByText("HealthTech")).toBeInTheDocument();
    });
  });

  it("shows back button", async () => {
    render(<GrantDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Back to grants")).toBeInTheDocument();
    });
  });
});
