import { render, screen } from "@testing-library/react";
import LoginPage from "./page";

// Mock the auth context
const mockLogin = jest.fn();
jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock the Google button
jest.mock("@/components/ui/google-button", () => ({
  GoogleButton: ({ mode }: { mode: string }) => (
    <button data-testid="google-button">Sign in with Google ({mode})</button>
  ),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it("renders login form with all fields", () => {
    render(<LoginPage />);
    
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
  });

  it("shows Google OAuth button", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("google-button")).toBeInTheDocument();
  });

  it("has link to signup page", () => {
    render(<LoginPage />);
    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("has link to forgot password page", () => {
    render(<LoginPage />);
    const forgotLink = screen.getByRole("link", { name: /forgot password/i });
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  it("renders password visibility toggle button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /show password/i })).toBeInTheDocument();
  });
});
