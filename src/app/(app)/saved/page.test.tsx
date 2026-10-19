import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SavedPage from "./page";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock the saved items context
const mockToggleSave = jest.fn();
const mockRemoveSaved = jest.fn();
const mockClearAll = jest.fn();
let mockSavedItems: Array<{ id: string; type: "grant" | "challenge"; name: string; savedAt: string }> = [];

jest.mock("@/lib/saved/context", () => ({
  useSavedItems: () => ({
    savedItems: mockSavedItems,
    isSaved: (id: string) => mockSavedItems.some((item) => item.id === id),
    toggleSave: mockToggleSave,
    removeSaved: mockRemoveSaved,
    clearAll: mockClearAll,
  }),
  SavedItemsProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock API calls
jest.mock("@/lib/api/grants", () => ({
  getGrantById: jest.fn((id: string) =>
    Promise.resolve({
      id,
      name: `Grant ${id}`,
      issuingBody: "Test Org",
      type: "GRANT",
      summary: "Test summary",
    })
  ),
}));

jest.mock("@/lib/api/challenges", () => ({
  getChallengeById: jest.fn((id: string) =>
    Promise.resolve({
      id,
      title: `Challenge ${id}`,
      corporateName: "Test Corp",
      status: "OPEN",
    })
  ),
}));

describe("SavedPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSavedItems = [];
  });

  it("shows empty state when no items saved", async () => {
    render(<SavedPage />);

    await waitFor(() => {
      expect(screen.getByText("No saved items yet")).toBeInTheDocument();
    });

    expect(screen.getByText(/browse grants and challenges/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse grants/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse challenges/i })).toBeInTheDocument();
  });

  it("displays saved items", async () => {
    mockSavedItems = [
      { id: "1", type: "grant", name: "Test Grant", savedAt: new Date().toISOString() },
    ];

    render(<SavedPage />);

    await waitFor(() => {
      expect(screen.getByText("Grant 1")).toBeInTheDocument();
    });
  });

  it("shows filter tabs when items are saved", async () => {
    mockSavedItems = [
      { id: "1", type: "grant", name: "Test Grant", savedAt: new Date().toISOString() },
      { id: "2", type: "challenge", name: "Test Challenge", savedAt: new Date().toISOString() },
    ];

    render(<SavedPage />);

    await waitFor(() => {
      // Check for filter tabs by looking at the text content
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Grants")).toBeInTheDocument();
      expect(screen.getByText("Challenges")).toBeInTheDocument();
    });
  });

  it("filters items by type", async () => {
    mockSavedItems = [
      { id: "1", type: "grant", name: "Test Grant", savedAt: new Date().toISOString() },
      { id: "2", type: "challenge", name: "Test Challenge", savedAt: new Date().toISOString() },
    ];

    render(<SavedPage />);

    await waitFor(() => {
      expect(screen.getByText("Grant 1")).toBeInTheDocument();
      expect(screen.getByText("Challenge 2")).toBeInTheDocument();
    });

    // Click grants filter
    const grantsTab = screen.getByRole("button", { name: /grants 1/i });
    await userEvent.click(grantsTab);

    expect(screen.getByText("Grant 1")).toBeInTheDocument();
    expect(screen.queryByText("Challenge 2")).not.toBeInTheDocument();
  });

  it("shows clear all button when items exist", async () => {
    mockSavedItems = [
      { id: "1", type: "grant", name: "Test Grant", savedAt: new Date().toISOString() },
    ];

    render(<SavedPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
    });
  });
});
