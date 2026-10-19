import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminChallengesPage from "./page";
import * as adminApi from "@/lib/api/admin";

import type { ChallengeResponse } from "@/lib/api/types";

// Mock the API
jest.mock("@/lib/api/admin");
const mockGetAdminChallenges = adminApi.getAdminChallenges as jest.MockedFunction<typeof adminApi.getAdminChallenges>;
const mockCloseChallenge = adminApi.closeChallenge as jest.MockedFunction<typeof adminApi.closeChallenge>;

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockChallenges: ChallengeResponse[] = [
  {
    id: "challenge-1",
    title: "AI Innovation Challenge",
    corporateName: "Tech Corp",
    theme: "AI/ML",
    deadline: "2027-12-31",
    status: "OPEN",
    published: true,
  },
  {
    id: "challenge-2",
    title: "Green Tech Challenge",
    corporateName: "Eco Inc",
    theme: "Sustainability",
    deadline: "2027-06-30",
    status: "CLOSED",
    published: true,
  },
];

describe("AdminChallengesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminChallenges.mockResolvedValue({
      content: mockChallenges,
      page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
    });
  });

  it("renders challenges list", async () => {
    render(<AdminChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
    });

    expect(screen.getByText("Green Tech Challenge")).toBeInTheDocument();
  });

  it("shows page title and new challenge button", async () => {
    render(<AdminChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("Challenges Management")).toBeInTheDocument();
    });

    expect(screen.getByText("+ New Challenge")).toBeInTheDocument();
  });

  it("displays status badges for challenges", async () => {
    render(<AdminChallengesPage />);

    await waitFor(() => {
      // Check that both challenges are rendered
      expect(screen.getByText("AI Innovation Challenge")).toBeInTheDocument();
      expect(screen.getByText("Green Tech Challenge")).toBeInTheDocument();
    });

    // Check for table rows
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1); // Header + data rows
  });

  it("shows close button for open challenges", async () => {
    render(<AdminChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("Close")).toBeInTheDocument();
    });
  });

  it("calls close API when close clicked", async () => {
    const user = userEvent.setup();
    mockCloseChallenge.mockResolvedValue();

    render(<AdminChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Close"));

    expect(mockCloseChallenge).toHaveBeenCalledWith("challenge-1");
  });

  it("does not show close button for closed challenges", async () => {
    mockGetAdminChallenges.mockResolvedValue({
      content: [mockChallenges[1]], // Only the closed one
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    });

    render(<AdminChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("Green Tech Challenge")).toBeInTheDocument();
    });

    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("shows empty state when no challenges", async () => {
    mockGetAdminChallenges.mockResolvedValue({
      content: [],
      page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
    });

    render(<AdminChallengesPage />);

    await waitFor(() => {
      expect(screen.getByText("No challenges found")).toBeInTheDocument();
    });
  });
});
