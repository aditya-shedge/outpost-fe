import { render, screen, waitFor } from "@testing-library/react";
import AdminLayout from "./layout";
import { useAuth } from "@/lib/auth/context";

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/admin",
}));

// Mock auth context
jest.mock("@/lib/auth/context");
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("AdminLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state while checking auth", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isVerified: false,
      isOnboarded: false,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    // Should show loading, not content
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("redirects non-admin users to discover", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "user@test.com", role: "FOUNDER" },
      isAuthenticated: true,
      isLoading: false,
      isVerified: true,
      isOnboarded: true,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/discover");
    });
  });

  it("redirects unauthenticated users to discover", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isVerified: false,
      isOnboarded: false,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/discover");
    });
  });

  it("renders admin interface for admin users", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "admin@test.com", role: "ADMIN" },
      isAuthenticated: true,
      isLoading: false,
      isVerified: true,
      isOnboarded: true,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await waitFor(() => {
      expect(screen.getByText("Outpost Admin")).toBeInTheDocument();
    });

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
    expect(screen.getByText("Grants")).toBeInTheDocument();
    expect(screen.getByText("Challenges")).toBeInTheDocument();
    expect(screen.getByText("Mentors")).toBeInTheDocument();
  });

  it("shows back to app link", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "admin@test.com", role: "ADMIN" },
      isAuthenticated: true,
      isLoading: false,
      isVerified: true,
      isOnboarded: true,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(
      <AdminLayout>
        <div>Admin Content</div>
      </AdminLayout>
    );

    await waitFor(() => {
      expect(screen.getByText("← Back to App")).toBeInTheDocument();
    });
  });
});
