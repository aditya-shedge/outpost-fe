import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingPage from "./page";

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock useAuth
const mockRefreshUser = jest.fn();
jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    isOnboarded: false,
    refreshUser: mockRefreshUser,
  }),
}));

// Mock API
jest.mock("@/lib/api/me", () => ({
  meApi: {
    completeOnboarding: jest.fn().mockResolvedValue({}),
  },
}));

// Mock lookups hooks
jest.mock("@/lib/hooks/useLookups", () => ({
  useStages: () => ({
    data: [
      { id: "stage-1", name: "Ideation" },
      { id: "stage-2", name: "MVP" },
    ],
    isLoading: false,
    error: null,
    retry: jest.fn(),
  }),
  useSectors: () => ({
    data: [
      { id: "sector-1", name: "FinTech" },
      { id: "sector-2", name: "HealthTech" },
    ],
    isLoading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

// Mock toast
jest.mock("@/components/ui/toast", () => ({
  showToast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Onboarding Page (FE-014)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the onboarding form with all fields", () => {
    render(<OnboardingPage />);
    
    expect(screen.getByText("Complete your profile")).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/startup name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sector/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
  });

  it("shows progress indicator", () => {
    render(<OnboardingPage />);
    
    // Should show step indicators (there are multiple elements with step numbers)
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("populates stage dropdown with options", () => {
    render(<OnboardingPage />);
    
    const stageSelect = screen.getByLabelText(/stage/i);
    expect(stageSelect).toBeInTheDocument();
    expect(screen.getByText("Ideation")).toBeInTheDocument();
    expect(screen.getByText("MVP")).toBeInTheDocument();
  });

  it("populates sector dropdown with options", () => {
    render(<OnboardingPage />);
    
    const sectorSelect = screen.getByLabelText(/sector/i);
    expect(sectorSelect).toBeInTheDocument();
    expect(screen.getByText("FinTech")).toBeInTheDocument();
    expect(screen.getByText("HealthTech")).toBeInTheDocument();
  });

  it("disables submit button when required fields are empty", () => {
    render(<OnboardingPage />);
    
    const submitButton = screen.getByRole("button", { name: /complete setup/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when required fields are filled", async () => {
    const user = userEvent.setup();
    render(<OnboardingPage />);
    
    await user.type(screen.getByLabelText(/your name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/startup name/i), "Acme Inc");
    await user.selectOptions(screen.getByLabelText(/stage/i), "stage-1");
    await user.selectOptions(screen.getByLabelText(/sector/i), "sector-1");
    await user.type(screen.getByLabelText(/city/i), "Hyderabad");
    
    const submitButton = screen.getByRole("button", { name: /complete setup/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("submits form and redirects on success", async () => {
    const { meApi } = require("@/lib/api/me");
    const { showToast } = require("@/components/ui/toast");
    const user = userEvent.setup();
    
    render(<OnboardingPage />);
    
    await user.type(screen.getByLabelText(/your name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/startup name/i), "Acme Inc");
    await user.selectOptions(screen.getByLabelText(/stage/i), "stage-1");
    await user.selectOptions(screen.getByLabelText(/sector/i), "sector-1");
    await user.type(screen.getByLabelText(/city/i), "Hyderabad");
    
    await user.click(screen.getByRole("button", { name: /complete setup/i }));
    
    await waitFor(() => {
      expect(meApi.completeOnboarding).toHaveBeenCalledWith({
        founderName: "Jane Doe",
        startupName: "Acme Inc",
        stageId: "stage-1",
        sectorId: "sector-1",
        city: "Hyderabad",
        website: undefined,
      });
    });
    
    await waitFor(() => {
      expect(mockRefreshUser).toHaveBeenCalled();
      expect(showToast.success).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/discover");
    });
  });
});
