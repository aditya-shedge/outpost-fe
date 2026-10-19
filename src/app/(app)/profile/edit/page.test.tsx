import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileEditPage from "./page";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the auth context
const mockUser = {
  id: "user-1",
  email: "founder@example.com",
  founderName: "John Doe",
  startupName: "Acme Inc",
  stageId: "stage-1",
  sectorId: "sector-1",
  city: "Hyderabad",
  website: "https://acme.com",
};

const mockRefreshUser = jest.fn();

jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    user: mockUser,
    refreshUser: mockRefreshUser,
  }),
}));

// Mock lookups API
jest.mock("@/lib/api/lookups", () => ({
  getStages: jest.fn().mockResolvedValue([
    { id: "stage-1", name: "Idea" },
    { id: "stage-2", name: "MVP" },
  ]),
  getSectors: jest.fn().mockResolvedValue([
    { id: "sector-1", name: "HealthTech" },
    { id: "sector-2", name: "FinTech" },
  ]),
}));

// Mock meApi
const mockUpdateProfile = jest.fn().mockResolvedValue({});
jest.mock("@/lib/api/me", () => ({
  meApi: {
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
  },
}));

describe("ProfileEditPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form with current values", async () => {
    render(<ProfileEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/founder name/i)).toHaveValue("John Doe");
    });

    expect(screen.getByLabelText(/startup name/i)).toHaveValue("Acme Inc");
    expect(screen.getByLabelText(/city/i)).toHaveValue("Hyderabad");
    expect(screen.getByLabelText(/website/i)).toHaveValue("https://acme.com");
  });

  it("shows email as read-only", async () => {
    render(<ProfileEditPage />);

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveValue("founder@example.com");
      expect(emailInput).toBeDisabled();
    });
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<ProfileEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/founder name/i)).toBeInTheDocument();
    });

    // Clear founder name
    const founderNameInput = screen.getByLabelText(/founder name/i);
    await user.clear(founderNameInput);

    // Submit form
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/founder name is required/i)).toBeInTheDocument();
    });
  });

  it("navigates back on cancel", async () => {
    const user = userEvent.setup();
    render(<ProfileEditPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith("/profile");
  });

  it("submits profile changes", async () => {
    const user = userEvent.setup();
    render(<ProfileEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/founder name/i)).toBeInTheDocument();
    });

    // Update city
    const cityInput = screen.getByLabelText(/city/i);
    await user.clear(cityInput);
    await user.type(cityInput, "Bangalore");

    // Submit
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  it("shows back link", async () => {
    render(<ProfileEditPage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /back to profile/i })).toBeInTheDocument();
    });
  });
});
