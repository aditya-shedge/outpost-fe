import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChallengesPage from "./page";

// Mock modules
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isOnboarded: true,
    user: { id: "user-1", founderName: "Test User" },
  }),
}));

jest.mock("@/lib/api/challenges", () => ({
  getChallenges: jest.fn().mockResolvedValue({
    content: [
      {
        id: "challenge-1",
        corporateName: "TechCorp",
        title: "AI Innovation Challenge",
        sectorName: "Technology",
        theme: "AI/ML",
        status: "OPEN",
        deadline: "2025-12-31",
        hasDetail: true,
        offerType: "PILOT",
      },
      {
        id: "challenge-2",
        corporateName: "FinCorp",
        title: "Fintech Solutions",
        sectorName: "Finance",
        theme: "Payments",
        status: "CLOSED",
        deadline: "2024-06-30",
        hasDetail: false,
        offerType: "POC",
      },
    ],
    page: { number: 0, size: 12, totalElements: 2, totalPages: 1 },
  }),
  getChallengeThemes: jest.fn().mockResolvedValue(["AI/ML", "Payments", "Sustainability"]),
}));

jest.mock("@/lib/api/lookups", () => ({
  getSectors: jest.fn().mockResolvedValue([
    { id: "sector-1", name: "Technology" },
    { id: "sector-2", name: "Finance" },
  ]),
}));

describe("ChallengesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it("renders page title and description", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("Corporate Challenges")).toBeInTheDocument();
    });
    expect(screen.getByText(/Solve real business problems/)).toBeInTheDocument();
  });

  it("shows search input", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search challenges...")).toBeInTheDocument();
    });
  });

  it("shows AI toggle for onboarded users", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("AI Ranking")).toBeInTheDocument();
    });
  });

  it("shows filter dropdowns", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Sector" })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: "Theme" })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: "Status" })).toBeInTheDocument();
    });
  });

  it("shows corporate name filter input", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Corporate name...")).toBeInTheDocument();
    });
  });

  it("displays challenge cards", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
      expect(screen.getByText("Fintech Solutions")).toBeInTheDocument();
    });
  });

  it("shows results count", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      // "2" appears twice (showing X of Y), use getAllByText
      const twos = screen.getAllByText("2");
      expect(twos.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows both open and closed challenges", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      // Open challenge
      expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
      // Closed challenge
      expect(screen.getByText("Fintech Solutions")).toBeInTheDocument();
    });
  });

  it("populates sector filter with options from API", async () => {
    render(<ChallengesPage />);

    // Wait for sectors to load - the sector select should eventually have more than just "All Sectors"
    await waitFor(() => {
      const sectorSelect = screen.getByRole("combobox", { name: "Sector" }) as HTMLSelectElement;
      const options = Array.from(sectorSelect.options).map(opt => opt.text);
      expect(options.length).toBeGreaterThan(1);
    }, { timeout: 3000 });

    const sectorSelect = screen.getByRole("combobox", { name: "Sector" }) as HTMLSelectElement;
    const options = Array.from(sectorSelect.options).map(opt => opt.text);
    
    expect(options).toContain("All Sectors");
    expect(options).toContain("Technology");
    expect(options).toContain("Finance");
  });

  it("populates theme filter with options from API", async () => {
    render(<ChallengesPage />);

    // Wait for themes to load
    await waitFor(() => {
      const themeSelect = screen.getByRole("combobox", { name: "Theme" }) as HTMLSelectElement;
      const options = Array.from(themeSelect.options).map(opt => opt.text);
      expect(options.length).toBeGreaterThan(1);
    }, { timeout: 3000 });

    const themeSelect = screen.getByRole("combobox", { name: "Theme" }) as HTMLSelectElement;
    const options = Array.from(themeSelect.options).map(opt => opt.text);
    
    expect(options).toContain("All Themes");
    expect(options).toContain("AI/ML");
    expect(options).toContain("Payments");
  });

  it("shows status filter options", async () => {
    render(<ChallengesPage />);

    await waitFor(() => {
      const statusSelect = screen.getByRole("combobox", { name: "Status" });
      expect(statusSelect).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole("combobox", { name: "Status" }) as HTMLSelectElement;
    const options = Array.from(statusSelect.options).map(opt => opt.text);
    
    expect(options).toContain("All Status");
    expect(options).toContain("Open");
    expect(options).toContain("Closed");
  });

  it("shows Clear all button when filters are active", async () => {
    const user = userEvent.setup();
    render(<ChallengesPage />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Status" })).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole("combobox", { name: "Status" });
    await user.selectOptions(statusSelect, "OPEN");

    await waitFor(() => {
      expect(screen.getByText("Clear all")).toBeInTheDocument();
    });
  });
});
