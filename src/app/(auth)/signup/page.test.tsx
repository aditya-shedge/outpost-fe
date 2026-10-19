import { render, screen } from "@testing-library/react";
import SignupPage from "./page";

// Mock the auth context
const mockSignup = jest.fn();
jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    signup: mockSignup,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock the Google button
jest.mock("@/components/ui/google-button", () => ({
  GoogleButton: ({ mode }: { mode: string }) => (
    <button data-testid="google-button">Continue with Google ({mode})</button>
  ),
}));

describe("SignupPage", () => {
  beforeEach(() => {
    mockSignup.mockReset();
  });

  it("renders signup form with all fields", () => {
    render(<SignupPage />);
    
    expect(screen.getByRole("heading", { name: /join the founder directory/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("shows Google OAuth button", () => {
    render(<SignupPage />);
    expect(screen.getByTestId("google-button")).toBeInTheDocument();
  });

  it("has link to login page", () => {
    render(<SignupPage />);
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("shows password requirements hint", () => {
    render(<SignupPage />);
    expect(screen.getByText(/must be at least 10 characters/i)).toBeInTheDocument();
  });

  it("renders password visibility toggle buttons", () => {
    render(<SignupPage />);
    const toggleButtons = screen.getAllByRole("button", { name: /show password/i });
    expect(toggleButtons).toHaveLength(2);
  });
});
