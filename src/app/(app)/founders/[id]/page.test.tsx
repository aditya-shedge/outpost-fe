import { render, screen, waitFor } from "@testing-library/react";
import FounderProfilePage from "./page";
import * as foundersApi from "@/lib/api/founders";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "founder-123" }),
}));

// Mock the API
jest.mock("@/lib/api/founders");
const mockGetFounderProfile = foundersApi.getFounderProfile as jest.MockedFunction<
  typeof foundersApi.getFounderProfile
>;

const mockFounder: foundersApi.PublicFounderProfile = {
  id: "founder-123",
  founderName: "John Smith",
  startupName: "Innovation Labs",
  bio: "A passionate entrepreneur building the future.",
  oneLiner: "Making tech accessible to everyone",
  photoUrl: "https://example.com/john.jpg",
  linkedinUrl: "https://linkedin.com/in/johnsmith",
  twitterUrl: "https://twitter.com/johnsmith",
  websiteUrl: "https://johnsmith.com",
  stage: "Series A",
  sector: "Technology",
};

describe("FounderProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders founder profile when found", async () => {
    mockGetFounderProfile.mockResolvedValue(mockFounder);

    render(<FounderProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("Innovation Labs")).toBeInTheDocument();
    expect(screen.getByText(/Making tech accessible to everyone/)).toBeInTheDocument();
  });

  it("shows 404 state when founder not accessible", async () => {
    mockGetFounderProfile.mockResolvedValue(null);

    render(<FounderProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Profile Not Found")).toBeInTheDocument();
    });

    expect(screen.getByText("This founder profile is not currently accessible.")).toBeInTheDocument();
  });

  it("displays bio when available", async () => {
    mockGetFounderProfile.mockResolvedValue(mockFounder);

    render(<FounderProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("A passionate entrepreneur building the future.")).toBeInTheDocument();
    });
  });

  it("renders social links", async () => {
    mockGetFounderProfile.mockResolvedValue(mockFounder);

    render(<FounderProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
        "href",
        "https://linkedin.com/in/johnsmith"
      );
    });

    expect(screen.getByRole("link", { name: /twitter/i })).toHaveAttribute(
      "href",
      "https://twitter.com/johnsmith"
    );
    expect(screen.getByRole("link", { name: /website/i })).toHaveAttribute(
      "href",
      "https://johnsmith.com"
    );
  });

  it("displays stage and sector tags", async () => {
    mockGetFounderProfile.mockResolvedValue(mockFounder);

    render(<FounderProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Series A")).toBeInTheDocument();
    });

    expect(screen.getByText("Technology")).toBeInTheDocument();
  });

  it("shows back to discover link", async () => {
    mockGetFounderProfile.mockResolvedValue(mockFounder);

    render(<FounderProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /back to discover/i })).toHaveAttribute(
        "href",
        "/discover"
      );
    });
  });
});
