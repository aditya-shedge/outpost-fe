import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "./page";

// Mock the authApi
const mockForgotPassword = jest.fn();
jest.mock("@/lib/api/auth", () => ({
  authApi: {
    forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
  },
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    mockForgotPassword.mockReset();
  });

  it("renders form with email input", () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByRole("heading", { name: /reset your password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("has link back to login", () => {
    render(<ForgotPasswordPage />);
    const link = screen.getByRole("link", { name: /back to login/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  describe("form submission", () => {
    it("calls forgotPassword API with email", async () => {
      const user = userEvent.setup();
      mockForgotPassword.mockResolvedValueOnce(undefined);
      render(<ForgotPasswordPage />);
      
      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      
      await waitFor(() => {
        expect(mockForgotPassword).toHaveBeenCalledWith({ email: "test@example.com" });
      });
    });

    it("shows success message after submission", async () => {
      const user = userEvent.setup();
      mockForgotPassword.mockResolvedValueOnce(undefined);
      render(<ForgotPasswordPage />);
      
      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      
      expect(await screen.findByRole("heading", { name: /check your email/i })).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it("shows success even when API fails (security - no reveal if email exists)", async () => {
      const user = userEvent.setup();
      mockForgotPassword.mockRejectedValueOnce(new Error("Not found"));
      render(<ForgotPasswordPage />);
      
      await user.type(screen.getByLabelText(/email address/i), "nonexistent@example.com");
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      
      // Should still show success - not reveal if email exists
      expect(await screen.findByRole("heading", { name: /check your email/i })).toBeInTheDocument();
    });
  });

  describe("success state", () => {
    it("shows link back to login after success", async () => {
      const user = userEvent.setup();
      mockForgotPassword.mockResolvedValueOnce(undefined);
      render(<ForgotPasswordPage />);
      
      await user.type(screen.getByLabelText(/email address/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /send reset link/i }));
      
      const link = await screen.findByRole("link", { name: /back to login/i });
      expect(link).toHaveAttribute("href", "/login");
    });
  });
});
