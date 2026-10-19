import { render, screen } from "@testing-library/react";
import { GrantCard, GrantCardSkeleton } from "./grant-card";
import { SavedItemsProvider } from "@/lib/saved/context";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: { success: jest.fn() },
}));

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<SavedItemsProvider>{ui}</SavedItemsProvider>);
};

describe("GrantCard Component (FE-020)", () => {
  const mockGrant = {
    id: "grant-1",
    name: "Startup India Seed Fund",
    issuingBody: "Government of India",
    type: "GRANT" as const,
    amountDisplay: "₹50L",
    deadline: "2026-12-31",
    summary: "Seed funding for early-stage startups to help them grow.",
    expired: false,
    stages: ["Ideation", "MVP"],
    sectors: ["FinTech"],
  };

  it("renders grant title and issuing body", () => {
    renderWithProvider(<GrantCard grant={mockGrant} />);
    
    expect(screen.getByText("Startup India Seed Fund")).toBeInTheDocument();
    expect(screen.getByText("Government of India")).toBeInTheDocument();
  });

  it("displays category badge", () => {
    renderWithProvider(<GrantCard grant={mockGrant} />);
    
    expect(screen.getByText("GRANT")).toBeInTheDocument();
  });

  it("shows bookmark button", () => {
    renderWithProvider(<GrantCard grant={mockGrant} />);
    
    expect(screen.getByRole("button", { name: /save for later/i })).toBeInTheDocument();
  });

  it("displays summary text", () => {
    renderWithProvider(<GrantCard grant={mockGrant} />);
    
    expect(screen.getByText(/Seed funding for early-stage startups/)).toBeInTheDocument();
  });

  it("shows amount and deadline", () => {
    renderWithProvider(<GrantCard grant={mockGrant} />);
    
    expect(screen.getByText("₹50L")).toBeInTheDocument();
    expect(screen.getByText(/31 Dec 2026/)).toBeInTheDocument();
  });

  it("shows Rolling for null deadline", () => {
    const grantWithNoDeadline = { ...mockGrant, deadline: undefined };
    renderWithProvider(<GrantCard grant={grantWithNoDeadline} />);
    
    expect(screen.getByText("Rolling")).toBeInTheDocument();
  });

  it("shows Expired indicator for expired grants", () => {
    const expiredGrant = { ...mockGrant, expired: true };
    renderWithProvider(<GrantCard grant={expiredGrant} />);
    
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("applies muted styling for expired grants", () => {
    const expiredGrant = { ...mockGrant, expired: true };
    const { container } = renderWithProvider(<GrantCard grant={expiredGrant} />);
    
    expect(container.firstChild).toHaveClass("opacity-60");
  });

  it("shows AI reason when present", () => {
    const grantWithAi = { ...mockGrant, aiReason: "Matches your FinTech focus" };
    renderWithProvider(<GrantCard grant={grantWithAi} showAiReason={true} />);
    
    expect(screen.getByText("Matches your FinTech focus")).toBeInTheDocument();
  });

  it("hides AI reason when showAiReason is false", () => {
    const grantWithAi = { ...mockGrant, aiReason: "Matches your FinTech focus" };
    renderWithProvider(<GrantCard grant={grantWithAi} showAiReason={false} />);
    
    expect(screen.queryByText("Matches your FinTech focus")).not.toBeInTheDocument();
  });

  it("links to grant detail page", () => {
    renderWithProvider(<GrantCard grant={mockGrant} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/grants/grant-1");
  });

  it("displays stage and sector tags", () => {
    renderWithProvider(<GrantCard grant={mockGrant} />);
    
    expect(screen.getByText("Ideation")).toBeInTheDocument();
    expect(screen.getByText("MVP")).toBeInTheDocument();
    expect(screen.getByText("FinTech")).toBeInTheDocument();
  });
});

describe("GrantCardSkeleton", () => {
  it("renders skeleton placeholder", () => {
    const { container } = renderWithProvider(<GrantCardSkeleton />);
    
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
