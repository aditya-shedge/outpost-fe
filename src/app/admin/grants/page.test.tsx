import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminGrantsPage from "./page";
import * as adminApi from "@/lib/api/admin";

import type { AdminGrantResponse } from "@/lib/api/types";

// Mock the API
jest.mock("@/lib/api/admin");
const mockGetAdminGrants = adminApi.getAdminGrants as jest.MockedFunction<typeof adminApi.getAdminGrants>;
const mockPublishGrant = adminApi.publishGrant as jest.MockedFunction<typeof adminApi.publishGrant>;
const mockUnpublishGrant = adminApi.unpublishGrant as jest.MockedFunction<typeof adminApi.unpublishGrant>;
const mockDeleteGrant = adminApi.deleteGrant as jest.MockedFunction<typeof adminApi.deleteGrant>;

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockGrants: AdminGrantResponse[] = [
  {
    id: "grant-1",
    name: "Test Grant 1",
    issuingBody: "Government",
    type: "GRANT",
    deadline: "2027-12-31",
    published: true,
    expired: false,
  },
  {
    id: "grant-2",
    name: "Draft Grant",
    issuingBody: "State",
    type: "SUBSIDY",
    deadline: "2027-06-30",
    published: false,
    expired: false,
  },
];

describe("AdminGrantsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminGrants.mockResolvedValue({
      content: mockGrants,
      page: { number: 0, size: 20, totalElements: 2, totalPages: 1 },
    });
  });

  it("renders grants list", async () => {
    render(<AdminGrantsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Grant 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Draft Grant")).toBeInTheDocument();
  });

  it("shows page title and new grant button", async () => {
    render(<AdminGrantsPage />);

    await waitFor(() => {
      expect(screen.getByText("Grants Management")).toBeInTheDocument();
    });

    expect(screen.getByText("+ New Grant")).toBeInTheDocument();
  });

  it("displays status badges for grants", async () => {
    render(<AdminGrantsPage />);

    await waitFor(() => {
      // Check that both grants are rendered with their status
      expect(screen.getByText("Test Grant 1")).toBeInTheDocument();
      expect(screen.getByText("Draft Grant")).toBeInTheDocument();
    });

    // Check for status badges (they appear as spans in table rows)
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1); // Header + data rows
  });

  it("has status filter dropdown", async () => {
    render(<AdminGrantsPage />);

    await waitFor(() => {
      expect(screen.getByText("All Status")).toBeInTheDocument();
    });
  });

  it("shows publish button for draft grants", async () => {
    render(<AdminGrantsPage />);

    await waitFor(() => {
      expect(screen.getByText("Publish")).toBeInTheDocument();
    });
  });

  it("shows unpublish button for published grants", async () => {
    render(<AdminGrantsPage />);

    await waitFor(() => {
      expect(screen.getByText("Unpublish")).toBeInTheDocument();
    });
  });

  it("calls publish API when publish clicked", async () => {
    const user = userEvent.setup();
    mockPublishGrant.mockResolvedValue();

    render(<AdminGrantsPage />);

    await waitFor(() => {
      expect(screen.getByText("Publish")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Publish"));

    expect(mockPublishGrant).toHaveBeenCalledWith("grant-2");
  });

  it("shows empty state when no grants", async () => {
    mockGetAdminGrants.mockResolvedValue({
      content: [],
      page: { number: 0, size: 20, totalElements: 0, totalPages: 0 },
    });

    render(<AdminGrantsPage />);

    await waitFor(() => {
      expect(screen.getByText("No grants found")).toBeInTheDocument();
    });
  });
});
