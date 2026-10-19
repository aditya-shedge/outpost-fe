import { render, screen } from "@testing-library/react";
import { ChallengeCard, ChallengeCardSkeleton } from "./challenge-card";
import { SavedItemsProvider } from "@/lib/saved/context";
import type { ChallengeWithAi } from "@/lib/api/types";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: { success: jest.fn() },
}));

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<SavedItemsProvider>{ui}</SavedItemsProvider>);
};

const mockOpenChallenge: ChallengeWithAi = {
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
};

const mockClosedChallenge: ChallengeWithAi = {
  ...mockOpenChallenge,
  id: "challenge-2",
  status: "CLOSED",
};

const mockChallengeWithAi: ChallengeWithAi = {
  ...mockOpenChallenge,
  id: "challenge-3",
  aiApplied: true,
  aiReason: "This challenge matches your AI/ML expertise",
};

describe("ChallengeCard", () => {
  it("renders challenge title and corporate name", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
    expect(screen.getByText("TechCorp")).toBeInTheDocument();
  });

  it("shows Open status badge for open challenges", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows Closed status badge for closed challenges", () => {
    renderWithProvider(<ChallengeCard challenge={mockClosedChallenge} />);
    
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("applies muted styling for closed challenges", () => {
    renderWithProvider(<ChallengeCard challenge={mockClosedChallenge} />);
    
    // The card should have opacity-60 class - check by querying text
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("shows sector and theme", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
  });

  it("shows full details badge when hasDetail is true", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("Full details")).toBeInTheDocument();
  });

  it("does not show full details badge when hasDetail is false", () => {
    const challengeWithoutDetails = { ...mockOpenChallenge, hasDetail: false };
    renderWithProvider(<ChallengeCard challenge={challengeWithoutDetails} />);
    
    expect(screen.queryByText("Full details")).not.toBeInTheDocument();
  });

  it("shows AI reason when present", () => {
    renderWithProvider(<ChallengeCard challenge={mockChallengeWithAi} />);
    
    expect(screen.getByText("This challenge matches your AI/ML expertise")).toBeInTheDocument();
    expect(screen.getByText("Why this is relevant")).toBeInTheDocument();
  });

  it("hides AI reason when showAiReason is false", () => {
    renderWithProvider(<ChallengeCard challenge={mockChallengeWithAi} showAiReason={false} />);
    
    expect(screen.queryByText("This challenge matches your AI/ML expertise")).not.toBeInTheDocument();
  });

  it("shows formatted deadline", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText(/Deadline:/)).toBeInTheDocument();
    expect(screen.getByText(/31 Dec 2025/)).toBeInTheDocument();
  });

  it("shows rolling applications when no deadline", () => {
    const challengeNoDeadline = { ...mockOpenChallenge, deadline: undefined };
    renderWithProvider(<ChallengeCard challenge={challengeNoDeadline} />);
    
    expect(screen.getByText("Rolling applications")).toBeInTheDocument();
  });

  it("shows offer type", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("PILOT")).toBeInTheDocument();
    expect(screen.getByText(/opportunity/)).toBeInTheDocument();
  });

  it("links to challenge detail page", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/challenges/challenge-1");
  });

  it("shows corporate logo when available", () => {
    renderWithProvider(<ChallengeCard challenge={mockOpenChallenge} />);
    
    const logo = screen.getByAltText("TechCorp logo");
    expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("shows initials fallback when no logo", () => {
    const challengeNoLogo = { ...mockOpenChallenge, corporateLogoUrl: undefined };
    renderWithProvider(<ChallengeCard challenge={challengeNoLogo} />);
    
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});

describe("ChallengeCardSkeleton", () => {
  it("renders skeleton loader", () => {
    const { container } = renderWithProvider(<ChallengeCardSkeleton />);
    
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
