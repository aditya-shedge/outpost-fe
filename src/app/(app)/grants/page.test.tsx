import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GrantsPage from "./page";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock useAuth
jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    isOnboarded: true,
  }),
}));

// Mock API functions
jest.mock("@/lib/api/grants", () => ({
  getGrants: jest.fn().mockResolvedValue({
    content: [
      {
        id: "grant-1",
        name: "Startup India Seed Fund",
        issuingBody: "Government of India",
        type: "GRANT",
        amountDisplay: "₹50L",
        deadline: "2026-12-31",
        summary: "Seed funding for early-stage startups",
        expired: false,
      },
      {
        id: "grant-2",
        name: "State Innovation Grant",
        issuingBody: "Telangana Government",
        type: "SUBSIDY",
        amountDisplay: "₹25L",
        deadline: null,
        summary: "Support for innovative startups",
        expired: false,
      },
    ],
    page: { number: 0, size: 12, totalElements: 2, totalPages: 1 },
  }),
}));

jest.mock("@/lib/api/lookups", () => ({
  getStages: jest.fn().mockResolvedValue([
    { id: "stage-1", name: "Ideation" },
    { id: "stage-2", name: "MVP" },
  ]),
  getSectors: jest.fn().mockResolvedValue([
    { id: "sector-1", name: "FinTech" },
    { id: "sector-2", name: "HealthTech" },
  ]),
}));

describe("Grants Listing Page (FE-019)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page header with title", async () => {
    render(<GrantsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Grants & Schemes")).toBeInTheDocument();
    });
  });

  it("displays filter dropdowns", async () => {
    render(<GrantsPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText("Source")).toBeInTheDocument();
      expect(screen.getByLabelText("Type")).toBeInTheDocument();
      expect(screen.getByLabelText("Stage")).toBeInTheDocument();
      expect(screen.getByLabelText("Sector")).toBeInTheDocument();
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
      expect(screen.getByLabelText("Deadline")).toBeInTheDocument();
    });
  });

  it("shows search input", async () => {
    render(<GrantsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search grants...")).toBeInTheDocument();
    });
  });

  it("shows AI toggle for onboarded users", async () => {
    render(<GrantsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("AI Ranking")).toBeInTheDocument();
    });
  });

  it("displays grants after loading", async () => {
    render(<GrantsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Startup India Seed Fund")).toBeInTheDocument();
      expect(screen.getByText("State Innovation Grant")).toBeInTheDocument();
    });
  });

  it("shows results count", async () => {
    render(<GrantsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      // Use getAllBy since the count might appear twice (showing X of Y)
      expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    });
  });

  it("filters can be changed", async () => {
    const user = userEvent.setup();
    render(<GrantsPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText("Type")).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText("Type");
    await user.selectOptions(typeSelect, "GRANT");
    
    expect(typeSelect).toHaveValue("GRANT");
  });
});
