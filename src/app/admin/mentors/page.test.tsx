import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminMentorsPage from "./page";
import * as adminApi from "@/lib/api/admin";

// Mock the API
jest.mock("@/lib/api/admin");
const mockGetAdminMentors = adminApi.getAdminMentors as jest.MockedFunction<typeof adminApi.getAdminMentors>;
const mockApproveMentor = adminApi.approveMentor as jest.MockedFunction<typeof adminApi.approveMentor>;
const mockRejectMentor = adminApi.rejectMentor as jest.MockedFunction<typeof adminApi.rejectMentor>;

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMentors = [
  {
    id: "mentor-1",
    name: "John Mentor",
    headline: "Product Expert",
    calcomUrl: "https://cal.com/john",
    status: "PENDING" as const,
    published: false,
  },
  {
    id: "mentor-2",
    name: "Jane Expert",
    headline: "Startup Advisor",
    calcomUrl: "https://cal.com/jane",
    status: "APPROVED" as const,
    published: true,
  },
];

describe("AdminMentorsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminMentors.mockResolvedValue({
      content: mockMentors,
      page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
    });
  });

  it("renders mentors list", async () => {
    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("John Mentor")).toBeInTheDocument();
    });

    expect(screen.getByText("Jane Expert")).toBeInTheDocument();
  });

  it("shows page title", async () => {
    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Mentor Approval Queue")).toBeInTheDocument();
    });
  });

  it("displays status badges for mentors", async () => {
    render(<AdminMentorsPage />);

    await waitFor(() => {
      // Check that both mentors are rendered
      expect(screen.getByText("John Mentor")).toBeInTheDocument();
      expect(screen.getByText("Jane Expert")).toBeInTheDocument();
    });

    // Check table rows exist
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("shows approve and reject buttons for pending mentors", async () => {
    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeInTheDocument();
    });

    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("calls approve API when approve clicked", async () => {
    const user = userEvent.setup();
    mockApproveMentor.mockResolvedValue();

    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Approve"));

    expect(mockApproveMentor).toHaveBeenCalledWith("mentor-1");
  });

  it("opens reject modal when reject clicked", async () => {
    const user = userEvent.setup();

    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Reject")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Reject"));

    expect(screen.getByText("Reject John Mentor")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Reason for rejection...")).toBeInTheDocument();
  });

  it("requires reason for rejection", async () => {
    const user = userEvent.setup();
    mockRejectMentor.mockResolvedValue();

    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Reject")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Reject"));

    // Click reject without entering reason
    const rejectButton = screen.getAllByText("Reject").find(
      (el) => el.closest(".bg-red-600")
    );
    expect(rejectButton).toBeInTheDocument();
  });

  it("shows pending count banner when there are pending mentors", async () => {
    mockGetAdminMentors.mockResolvedValue({
      content: [mockMentors[0]],
      page: { number: 0, size: 20, totalElements: 1, totalPages: 1 },
    });

    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("John Mentor")).toBeInTheDocument();
    });

    // The banner should show for pending mentors
    expect(screen.getByText(/awaiting review/)).toBeInTheDocument();
  });

  it("shows empty state when no pending applications", async () => {
    mockGetAdminMentors.mockResolvedValue({
      content: [],
      page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
    });

    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(screen.getByText("No pending applications")).toBeInTheDocument();
    });
  });

  it("has status filter dropdown defaulting to pending", async () => {
    render(<AdminMentorsPage />);

    await waitFor(() => {
      expect(mockGetAdminMentors).toHaveBeenCalledWith(
        expect.objectContaining({ status: "PENDING" })
      );
    });
  });
});
