import { render, screen, waitFor } from "@testing-library/react";
import ChallengeDetailPage from "./page";

// Mock modules
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "challenge-1" }),
  notFound: jest.fn(),
}));

const mockOpenChallenge = {
  id: "challenge-1",
  corporateName: "TechCorp",
  corporateLogoUrl: "https://example.com/logo.png",
  title: "AI Innovation Challenge",
  sectorId: "sector-1",
  sectorName: "Technology",
  theme: "Artificial Intelligence",
  deadline: "2025-12-31",
  status: "OPEN",
  applyUrl: "https://example.com/apply",
  hasDetail: true,
  offerType: "PILOT",
  problemStatement: "We need innovative AI solutions to improve our customer service.",
  lookingFor: "Startups with proven AI/ML capabilities and experience in NLP.",
  eligibility: "Indian startups with at least 1 year of operation.",
  timeline: "Applications close Dec 2025. Pilots begin Q1 2026.",
};

const mockClosedChallenge = {
  ...mockOpenChallenge,
  id: "challenge-2",
  status: "CLOSED",
};

const mockMinimalChallenge: typeof mockOpenChallenge = {
  ...mockOpenChallenge,
  id: "challenge-3",
  hasDetail: false,
  problemStatement: "",
  lookingFor: "",
  eligibility: "",
  timeline: "",
};

let mockChallenge = mockOpenChallenge;

jest.mock("@/lib/api/challenges", () => ({
  getChallengeById: jest.fn(() => Promise.resolve(mockChallenge)),
}));

describe("ChallengeDetailPage", () => {
  beforeEach(() => {
    mockChallenge = mockOpenChallenge;
    jest.clearAllMocks();
  });

  it("renders breadcrumb navigation", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Challenges")).toBeInTheDocument();
      // Title appears in both breadcrumb and header, so use getAllByText
      const titles = screen.getAllByText("AI Innovation Challenge");
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders challenge title and corporate name", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "AI Innovation Challenge" })).toBeInTheDocument();
      expect(screen.getByText("TechCorp")).toBeInTheDocument();
    });
  });

  it("shows corporate logo", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      const logo = screen.getByAltText("TechCorp logo");
      expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
    });
  });

  it("shows Open status for open challenges", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Open for applications")).toBeInTheDocument();
    });
  });

  it("shows key info cards with sector, theme, deadline, and offer type", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Technology")).toBeInTheDocument();
      expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
      expect(screen.getByText("31 December 2025")).toBeInTheDocument();
      // PILOT appears in badge and info card, use getAllByText
      const pilotTexts = screen.getAllByText("PILOT");
      expect(pilotTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows full detail sections when hasDetail is true", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Problem Statement")).toBeInTheDocument();
      expect(screen.getByText(/innovative AI solutions/)).toBeInTheDocument();
      
      expect(screen.getByText("What They're Looking For")).toBeInTheDocument();
      expect(screen.getByText(/proven AI\/ML capabilities/)).toBeInTheDocument();
      
      expect(screen.getByText("Eligibility")).toBeInTheDocument();
      expect(screen.getByText(/Indian startups/)).toBeInTheDocument();
      
      expect(screen.getByText("Timeline")).toBeInTheDocument();
      expect(screen.getByText(/Q1 2026/)).toBeInTheDocument();
    });
  });

  it("shows limited info message when hasDetail is false", async () => {
    mockChallenge = mockMinimalChallenge;
    
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Limited details are available/)).toBeInTheDocument();
    });
    
    expect(screen.queryByText("Problem Statement")).not.toBeInTheDocument();
  });

  it("shows Apply Now button with link for open challenges", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      const applyButton = screen.getByRole("link", { name: /Apply Now/i });
      expect(applyButton).toHaveAttribute("href", "https://example.com/apply");
      expect(applyButton).toHaveAttribute("target", "_blank");
    });
  });

  it("shows closed banner for closed challenges", async () => {
    mockChallenge = mockClosedChallenge;
    
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("This challenge is closed")).toBeInTheDocument();
      expect(screen.getByText("Applications are no longer being accepted.")).toBeInTheDocument();
    });
  });

  it("shows disabled apply button for closed challenges", async () => {
    mockChallenge = mockClosedChallenge;
    
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Applications Closed")).toBeInTheDocument();
    });
    
    const disabledButton = screen.getByText("Applications Closed").closest("a");
    expect(disabledButton).toHaveClass("pointer-events-none");
    expect(disabledButton).toHaveAttribute("aria-disabled", "true");
  });

  it("shows back to challenges link", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /Back to challenges/i });
      expect(backLink).toHaveAttribute("href", "/challenges");
    });
  });

  it("shows Closed status badge for closed challenges", async () => {
    mockChallenge = mockClosedChallenge;
    
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });
  });

  it("shows offer type badge", async () => {
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      const pilotBadges = screen.getAllByText("PILOT");
      expect(pilotBadges.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe("ChallengeDetailPage - Error handling", () => {
  it("shows error message when challenge not found", async () => {
    const { getChallengeById } = require("@/lib/api/challenges");
    getChallengeById.mockRejectedValueOnce(new Error("Not found"));
    
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Challenge not found/)).toBeInTheDocument();
    });
  });

  it("shows back link when error occurs", async () => {
    const { getChallengeById } = require("@/lib/api/challenges");
    getChallengeById.mockRejectedValueOnce(new Error("Not found"));
    
    render(<ChallengeDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("← Back to challenges")).toBeInTheDocument();
    });
  });
});
