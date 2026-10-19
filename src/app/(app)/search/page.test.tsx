import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchPage from "./page";

// Mock next/navigation
let mockSearchParams = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

// Mock API calls
const mockGetGrants = jest.fn();
const mockGetChallenges = jest.fn();
const mockGetMentors = jest.fn();

jest.mock("@/lib/api/grants", () => ({
  getGrants: (...args: unknown[]) => mockGetGrants(...args),
}));

jest.mock("@/lib/api/challenges", () => ({
  getChallenges: (...args: unknown[]) => mockGetChallenges(...args),
}));

jest.mock("@/lib/api/mentors", () => ({
  getMentors: (...args: unknown[]) => mockGetMentors(...args),
}));

// Mock card components
jest.mock("@/components/ui/grant-card", () => ({
  GrantCard: ({ grant }: { grant: { title: string } }) => (
    <div data-testid="grant-card">{grant.title}</div>
  ),
}));

jest.mock("@/components/ui/challenge-card", () => ({
  ChallengeCard: ({ challenge }: { challenge: { title: string } }) => (
    <div data-testid="challenge-card">{challenge.title}</div>
  ),
}));

jest.mock("@/components/ui/mentor-card", () => ({
  MentorCard: ({ mentor }: { mentor: { name: string } }) => (
    <div data-testid="mentor-card">{mentor.name}</div>
  ),
}));

describe("SearchPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();

    // Default successful responses
    mockGetGrants.mockResolvedValue({
      content: [{ id: "1", title: "Grant One" }],
      page: { totalElements: 1 },
    });
    mockGetChallenges.mockResolvedValue({
      content: [{ id: "2", title: "Challenge One" }],
      page: { totalElements: 1 },
    });
    mockGetMentors.mockResolvedValue({
      content: [{ id: "3", name: "Mentor One" }],
      page: { totalElements: 1 },
    });
  });

  it("shows empty state when no query", async () => {
    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText("Start searching")).toBeInTheDocument();
    });
  });

  it("shows search results for query", async () => {
    mockSearchParams = new URLSearchParams("q=test");

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('3 results for "test"')).toBeInTheDocument();
      expect(screen.getByText("Grant One")).toBeInTheDocument();
      expect(screen.getByText("Challenge One")).toBeInTheDocument();
      expect(screen.getByText("Mentor One")).toBeInTheDocument();
    });
  });

  it("shows tabs with correct counts", async () => {
    mockSearchParams = new URLSearchParams("q=test");

    mockGetGrants.mockResolvedValue({
      content: [{ id: "1", title: "Grant" }],
      page: { totalElements: 5 },
    });
    mockGetChallenges.mockResolvedValue({
      content: [{ id: "2", title: "Challenge" }],
      page: { totalElements: 3 },
    });
    mockGetMentors.mockResolvedValue({
      content: [{ id: "3", name: "Mentor" }],
      page: { totalElements: 2 },
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /all 10/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /grants 5/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /challenges 3/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /mentors 2/i })).toBeInTheDocument();
    });
  });

  it("filters results by tab", async () => {
    mockSearchParams = new URLSearchParams("q=test");

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText("Grant One")).toBeInTheDocument();
    });

    // Click grants tab
    const grantsTab = screen.getByRole("button", { name: /grants 1/i });
    await userEvent.click(grantsTab);

    // Should only show grants in the results area
    expect(screen.getByText("Grant One")).toBeInTheDocument();
    // Challenge and Mentor cards should not be in document (only the tabs remain)
    expect(screen.queryByTestId("challenge-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mentor-card")).not.toBeInTheDocument();
  });

  it("shows no results state", async () => {
    mockSearchParams = new URLSearchParams("q=nonexistent");

    mockGetGrants.mockResolvedValue({
      content: [],
      page: { totalElements: 0 },
    });
    mockGetChallenges.mockResolvedValue({
      content: [],
      page: { totalElements: 0 },
    });
    mockGetMentors.mockResolvedValue({
      content: [],
      page: { totalElements: 0 },
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText(/we couldn't find anything matching "nonexistent"/i)
      ).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockSearchParams = new URLSearchParams("q=test");
    
    // Make the API calls hang
    mockGetGrants.mockImplementation(() => new Promise(() => {}));
    mockGetChallenges.mockImplementation(() => new Promise(() => {}));
    mockGetMentors.mockImplementation(() => new Promise(() => {}));

    render(<SearchPage />);

    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });
});
