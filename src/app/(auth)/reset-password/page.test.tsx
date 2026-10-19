import { render, screen } from "@testing-library/react";
import ResetPasswordPage from "./page";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));

// Mock toast
jest.mock("@/components/ui/toast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

let mockSearchParams = "token=valid-reset-token";

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    mockSearchParams = "token=valid-reset-token";
  });

  describe("with valid token", () => {
    it("renders reset password form", () => {
      render(<ResetPasswordPage />);
      
      expect(screen.getByRole("heading", { name: /set new password/i })).toBeInTheDocument();
      expect(screen.getByLabelText("New password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
    });

    it("shows password requirements hint", () => {
      render(<ResetPasswordPage />);
      expect(screen.getByText(/must be at least 10 characters/i)).toBeInTheDocument();
    });

    it("has link back to login", () => {
      render(<ResetPasswordPage />);
      const link = screen.getByRole("link", { name: /back to login/i });
      expect(link).toHaveAttribute("href", "/login");
    });

    it("renders password visibility toggle buttons", () => {
      render(<ResetPasswordPage />);
      const toggleButtons = screen.getAllByRole("button", { name: /show password/i });
      expect(toggleButtons).toHaveLength(2);
    });
  });

  describe("without token", () => {
    beforeEach(() => {
      mockSearchParams = "";
    });

    it("shows error when no token provided", () => {
      render(<ResetPasswordPage />);
      
      expect(screen.getByRole("heading", { name: /invalid reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/this password reset link is invalid or has expired/i)).toBeInTheDocument();
    });

    it("shows link to request new reset", () => {
      render(<ResetPasswordPage />);
      
      const link = screen.getByRole("link", { name: /request a new link/i });
      expect(link).toHaveAttribute("href", "/forgot-password");
    });
  });
});
