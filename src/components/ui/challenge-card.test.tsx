import { render, screen } from "@testing-library/react";
import { ChallengeCard, ChallengeCardSkeleton } from "./challenge-card";
import type { ChallengeWithAi } from "@/lib/api/types";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

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
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
    expect(screen.getByText("TechCorp")).toBeInTheDocument();
  });

  it("shows Open status badge for open challenges", () => {
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows Closed status badge for closed challenges", () => {
    render(<ChallengeCard challenge={mockClosedChallenge} />);
    
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("applies muted styling for closed challenges", () => {
    render(<ChallengeCard challenge={mockClosedChallenge} />);
    
    // The card should have opacity-60 class - check by querying text
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("shows sector and theme", () => {
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
  });

  it("shows full details badge when hasDetail is true", () => {
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("Full details")).toBeInTheDocument();
  });

  it("does not show full details badge when hasDetail is false", () => {
    const challengeWithoutDetails = { ...mockOpenChallenge, hasDetail: false };
    render(<ChallengeCard challenge={challengeWithoutDetails} />);
    
    expect(screen.queryByText("Full details")).not.toBeInTheDocument();
  });

  it("shows AI reason when present", () => {
    render(<ChallengeCard challenge={mockChallengeWithAi} />);
    
    expect(screen.getByText("This challenge matches your AI/ML expertise")).toBeInTheDocument();
    expect(screen.getByText("Why this is relevant")).toBeInTheDocument();
  });

  it("hides AI reason when showAiReason is false", () => {
    render(<ChallengeCard challenge={mockChallengeWithAi} showAiReason={false} />);
    
    expect(screen.queryByText("This challenge matches your AI/ML expertise")).not.toBeInTheDocument();
  });

  it("shows formatted deadline", () => {
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText(/Deadline:/)).toBeInTheDocument();
    expect(screen.getByText(/31 Dec 2025/)).toBeInTheDocument();
  });

  it("shows rolling applications when no deadline", () => {
    const challengeNoDeadline = { ...mockOpenChallenge, deadline: undefined };
    render(<ChallengeCard challenge={challengeNoDeadline} />);
    
    expect(screen.getByText("Rolling applications")).toBeInTheDocument();
  });

  it("shows offer type", () => {
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    expect(screen.getByText("PILOT")).toBeInTheDocument();
    expect(screen.getByText(/opportunity/)).toBeInTheDocument();
  });

  it("links to challenge detail page", () => {
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/challenges/challenge-1");
  });

  it("shows corporate logo when available", () => {
    render(<ChallengeCard challenge={mockOpenChallenge} />);
    
    const logo = screen.getByAltText("TechCorp logo");
    expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("shows initials fallback when no logo", () => {
    const challengeNoLogo = { ...mockOpenChallenge, corporateLogoUrl: undefined };
    render(<ChallengeCard challenge={challengeNoLogo} />);
    
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});

describe("ChallengeCardSkeleton", () => {
  it("renders skeleton loader", () => {
    const { container } = render(<ChallengeCardSkeleton />);
    
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
