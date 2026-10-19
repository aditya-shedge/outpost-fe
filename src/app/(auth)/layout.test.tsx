import { render, screen } from "@testing-library/react";
import AuthLayout from "./layout";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock("@/lib/auth/context", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Auth Layout (FE-013)", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isVerified: false,
      isOnboarded: false,
    });
  });

  it("renders the layout with branding", () => {
    render(
      <AuthLayout>
        <div data-testid="child-content">Test Content</div>
      </AuthLayout>
    );
    
    // Check branding text exists
    expect(screen.getByText(/T-Hub Founders/i)).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <AuthLayout>
        <div data-testid="child-content">Test Content</div>
      </AuthLayout>
    );
    
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("shows footer text on mobile", () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );
    
    expect(screen.getByText(/Exclusive to the T-Hub founder community/i)).toBeInTheDocument();
  });

  it("shows loading state when checking auth", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      isVerified: false,
      isOnboarded: false,
    });

    render(
      <AuthLayout>
        <div data-testid="child-content">Test Content</div>
      </AuthLayout>
    );
    
    // During loading, children should not be visible
    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
  });
});
