import { render, screen, fireEvent } from "@testing-library/react";
import { GoogleButton } from "./google-button";

// Mock window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("GoogleButton", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    mockLocation.href = "";
    process.env = { ...originalEnv, NEXT_PUBLIC_API_URL: "http://localhost:8080" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("renders sign in text for login mode", () => {
    render(<GoogleButton mode="login" />);
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });

  it("renders continue text for signup mode", () => {
    render(<GoogleButton mode="signup" />);
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });

  it("renders Google icon", () => {
    render(<GoogleButton />);
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("redirects to backend OAuth endpoint on click", () => {
    render(<GoogleButton />);
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(mockLocation.href).toBe("http://localhost:8080/oauth2/authorization/google");
  });

  it("shows loading state after click", () => {
    render(<GoogleButton />);
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
  });

  it("disables button when disabled prop is true", () => {
    render(<GoogleButton disabled />);
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("calls onClick callback when provided", () => {
    const onClick = jest.fn();
    render(<GoogleButton onClick={onClick} />);
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(onClick).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<GoogleButton className="custom-class" />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("uses default API URL when env var not set", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    render(<GoogleButton />);
    
    fireEvent.click(screen.getByRole("button"));
    
    expect(mockLocation.href).toBe("http://localhost:8080/oauth2/authorization/google");
  });
});
