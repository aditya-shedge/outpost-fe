import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MentorsPage from "./page";

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

jest.mock("@/lib/api/mentors", () => ({
  getMentors: jest.fn().mockResolvedValue({
    content: [
      {
        id: "mentor-1",
        name: "Jane Doe",
        headline: "CEO at TechCorp",
        photoUrl: "https://example.com/photo.jpg",
        expertise: ["Fundraising", "Product"],
      },
      {
        id: "mentor-2",
        name: "John Smith",
        headline: "Angel Investor",
        expertise: ["Finance", "Strategy"],
      },
    ],
    page: { number: 0, size: 12, totalElements: 2, totalPages: 1 },
  }),
}));

jest.mock("@/lib/api/lookups", () => ({
  getStages: jest.fn().mockResolvedValue([
    { id: "stage-1", name: "Idea" },
    { id: "stage-2", name: "MVP" },
  ]),
  getSectors: jest.fn().mockResolvedValue([
    { id: "sector-1", name: "Technology" },
    { id: "sector-2", name: "Finance" },
  ]),
}));

describe("MentorsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  it("renders page title and description", async () => {
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Connect with Mentors")).toBeInTheDocument();
    });
    expect(screen.getByText(/Get guidance from operators/)).toBeInTheDocument();
  });

  it("shows search input", async () => {
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search mentors...")).toBeInTheDocument();
    });
  });

  it("shows AI toggle for onboarded users", async () => {
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("AI Ranking")).toBeInTheDocument();
    });
  });

  it("shows expertise filter tags", async () => {
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Expertise")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Fundraising" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Product" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Marketing" })).toBeInTheDocument();
    });
  });

  it("shows stage and sector filter dropdowns", async () => {
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "Stage" })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: "Sector" })).toBeInTheDocument();
    });
  });

  it("displays mentor cards", async () => {
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("John Smith")).toBeInTheDocument();
    });
  });

  it("shows results count", async () => {
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
    });
  });

  it("toggles expertise filter when clicked", async () => {
    const user = userEvent.setup();
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Fundraising" })).toBeInTheDocument();
    });

    const fundraisingButton = screen.getByRole("button", { name: "Fundraising" });
    await user.click(fundraisingButton);

    // Button should now be selected (has bg-green class)
    expect(fundraisingButton).toHaveClass("bg-green");
  });

  it("shows Clear all button when filters are active", async () => {
    const user = userEvent.setup();
    render(<MentorsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Fundraising" })).toBeInTheDocument();
    });

    const fundraisingButton = screen.getByRole("button", { name: "Fundraising" });
    await user.click(fundraisingButton);

    await waitFor(() => {
      expect(screen.getByText("Clear all")).toBeInTheDocument();
    });
  });
});
