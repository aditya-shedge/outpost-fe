import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "./page";

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
  emailVerified: true,
  onboarded: true,
};

jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    user: mockUser,
    refreshUser: jest.fn(),
  }),
}));

// Mock the meApi
jest.mock("@/lib/api/me", () => ({
  meApi: {
    getIdentities: jest.fn().mockResolvedValue([
      { provider: "EMAIL", linkedAt: "2024-01-01T00:00:00Z" },
      { provider: "GOOGLE", linkedAt: "2024-01-02T00:00:00Z" },
    ]),
  },
}));

describe("ProfilePage", () => {
  it("renders profile information", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "John Doe" })).toBeInTheDocument();
    });

    // Acme Inc appears in header and profile field
    expect(screen.getAllByText("Acme Inc").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("founder@example.com")).toBeInTheDocument();
    expect(screen.getByText("Hyderabad")).toBeInTheDocument();
  });

  it("shows user initials in avatar", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });

  it("displays linked sign-in methods", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("EMAIL")).toBeInTheDocument();
      expect(screen.getByText("GOOGLE")).toBeInTheDocument();
    });
  });

  it("shows edit profile link", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /edit profile/i })).toBeInTheDocument();
    });
  });

  it("shows security links", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /change password/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /manage sign-in methods/i })).toBeInTheDocument();
    });
  });
});
