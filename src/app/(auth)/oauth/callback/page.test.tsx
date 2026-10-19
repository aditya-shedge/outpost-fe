import { render, screen, waitFor } from "@testing-library/react";
import OAuthCallbackPage from "./page";

// Mock router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));

// Mock auth context
const mockRefreshUser = jest.fn();
jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    refreshUser: mockRefreshUser,
  }),
}));

// Mock storage
const mockSetTokens = jest.fn();
jest.mock("@/lib/auth/storage", () => ({
  setTokens: (...args: unknown[]) => mockSetTokens(...args),
}));

let mockSearchParams = "accessToken=abc123&refreshToken=xyz789";

describe("OAuthCallbackPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockRefreshUser.mockReset();
    mockSetTokens.mockReset();
    mockSearchParams = "accessToken=abc123&refreshToken=xyz789";
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("with valid tokens", () => {
    it("shows loading state initially", () => {
      mockRefreshUser.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<OAuthCallbackPage />);
      
      expect(screen.getByRole("heading", { name: /signing you in/i })).toBeInTheDocument();
    });

    it("stores tokens from URL params", async () => {
      mockRefreshUser.mockResolvedValueOnce(undefined);
      render(<OAuthCallbackPage />);
      
      await waitFor(() => {
        expect(mockSetTokens).toHaveBeenCalledWith("abc123", "xyz789");
      });
    });

    it("calls refreshUser after storing tokens", async () => {
      mockRefreshUser.mockResolvedValueOnce(undefined);
      render(<OAuthCallbackPage />);
      
      await waitFor(() => {
        expect(mockRefreshUser).toHaveBeenCalled();
      });
    });

    it("shows success message after login", async () => {
      mockRefreshUser.mockResolvedValueOnce(undefined);
      render(<OAuthCallbackPage />);
      
      expect(await screen.findByRole("heading", { name: /welcome!/i })).toBeInTheDocument();
    });

    it("redirects to discover after success", async () => {
      mockRefreshUser.mockResolvedValueOnce(undefined);
      render(<OAuthCallbackPage />);
      
      await screen.findByRole("heading", { name: /welcome!/i });
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/discover");
      });
    });
  });

  describe("with error param", () => {
    beforeEach(() => {
      mockSearchParams = "error=OAuth%20failed";
    });

    it("shows error message", async () => {
      render(<OAuthCallbackPage />);
      
      expect(await screen.findByRole("heading", { name: /sign in failed/i })).toBeInTheDocument();
      expect(screen.getByText(/OAuth failed/i)).toBeInTheDocument();
    });

    it("shows link back to login", async () => {
      render(<OAuthCallbackPage />);
      
      const link = await screen.findByRole("link", { name: /back to login/i });
      expect(link).toHaveAttribute("href", "/login");
    });
  });

  describe("with EMAIL_UNVERIFIED_LINK error", () => {
    beforeEach(() => {
      mockSearchParams = "error=EMAIL_UNVERIFIED_LINK";
    });

    it("shows specific error message for unverified email", async () => {
      render(<OAuthCallbackPage />);
      
      expect(await screen.findByText(/an account with this email already exists but isn't verified/i)).toBeInTheDocument();
    });
  });

  describe("with missing tokens", () => {
    beforeEach(() => {
      mockSearchParams = ""; // No tokens
    });

    it("shows error for missing tokens", async () => {
      render(<OAuthCallbackPage />);
      
      expect(await screen.findByRole("heading", { name: /sign in failed/i })).toBeInTheDocument();
      expect(screen.getByText(/missing authentication tokens/i)).toBeInTheDocument();
    });
  });

  describe("with partial tokens", () => {
    beforeEach(() => {
      mockSearchParams = "accessToken=abc123"; // Missing refresh token
    });

    it("shows error for missing refresh token", async () => {
      render(<OAuthCallbackPage />);
      
      expect(await screen.findByRole("heading", { name: /sign in failed/i })).toBeInTheDocument();
      expect(screen.getByText(/missing authentication tokens/i)).toBeInTheDocument();
    });
  });

  describe("when refreshUser fails", () => {
    it("shows error message", async () => {
      mockRefreshUser.mockRejectedValueOnce(new Error("Failed to fetch user"));
      render(<OAuthCallbackPage />);
      
      expect(await screen.findByRole("heading", { name: /sign in failed/i })).toBeInTheDocument();
      expect(screen.getByText(/failed to complete sign in/i)).toBeInTheDocument();
    });
  });
});
