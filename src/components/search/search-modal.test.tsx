import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchModal } from "./search-modal";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock API calls
jest.mock("@/lib/api/grants", () => ({
  getGrants: jest.fn(() =>
    Promise.resolve({
      content: [
        { id: "1", name: "Test Grant", issuingBody: "Test Org" },
      ],
      page: { totalElements: 1 },
    })
  ),
}));

jest.mock("@/lib/api/challenges", () => ({
  getChallenges: jest.fn(() =>
    Promise.resolve({
      content: [
        { id: "2", title: "Test Challenge", corporateName: "Test Corp" },
      ],
      page: { totalElements: 1 },
    })
  ),
}));

jest.mock("@/lib/api/mentors", () => ({
  getMentors: jest.fn(() =>
    Promise.resolve({
      content: [
        { id: "3", name: "Test Mentor", headline: "Test Role" },
      ],
      page: { totalElements: 1 },
    })
  ),
}));

describe("SearchModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders when open", () => {
    render(<SearchModal isOpen={true} onClose={jest.fn()} />);

    expect(
      screen.getByPlaceholderText(/search grants, challenges, mentors/i)
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<SearchModal isOpen={false} onClose={jest.fn()} />);

    expect(
      screen.queryByPlaceholderText(/search grants, challenges, mentors/i)
    ).not.toBeInTheDocument();
  });

  it("calls onClose when escape is pressed", () => {
    const onClose = jest.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = jest.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);

    // Click the backdrop (first div with bg-ink/50)
    const backdrop = document.querySelector(".bg-ink\\/50");
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it("shows search results when typing", async () => {
    render(<SearchModal isOpen={true} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText(/search grants, challenges, mentors/i);
    await userEvent.type(input, "test");

    await waitFor(() => {
      expect(screen.getByText("Test Grant")).toBeInTheDocument();
      expect(screen.getByText("Test Challenge")).toBeInTheDocument();
      expect(screen.getByText("Test Mentor")).toBeInTheDocument();
    });
  });

  it("navigates to search results page on form submit", async () => {
    const onClose = jest.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);

    const input = screen.getByPlaceholderText(/search grants, challenges, mentors/i);
    await userEvent.type(input, "funding{enter}");

    expect(mockPush).toHaveBeenCalledWith("/search?q=funding");
    expect(onClose).toHaveBeenCalled();
  });
});
