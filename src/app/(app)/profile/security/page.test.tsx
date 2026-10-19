import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SecurityPage from "./page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the auth context
const mockUser = {
  id: "user-1",
  email: "founder@example.com",
  founderName: "John Doe",
};

jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock meApi with controllable functions
let mockGetIdentities = jest.fn();
let mockChangePassword = jest.fn();
let mockUnlinkIdentity = jest.fn();

jest.mock("@/lib/api/me", () => ({
  meApi: {
    getIdentities: () => mockGetIdentities(),
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
    unlinkIdentity: (...args: unknown[]) => mockUnlinkIdentity(...args),
  },
}));

describe("SecurityPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetIdentities = jest.fn().mockResolvedValue([
      { provider: "EMAIL", linkedAt: "2024-01-01T00:00:00Z" },
      { provider: "GOOGLE", linkedAt: "2024-01-02T00:00:00Z" },
    ]);
    mockChangePassword = jest.fn().mockResolvedValue({});
    mockUnlinkIdentity = jest.fn().mockResolvedValue({});
  });

  it("displays linked sign-in methods", async () => {
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByText("Email & Password")).toBeInTheDocument();
      expect(screen.getByText("GOOGLE")).toBeInTheDocument();
    });
  });

  it("shows change password form when email identity exists", async () => {
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByText("Change Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    });
  });

  it("hides change password form when no email identity", async () => {
    mockGetIdentities = jest.fn().mockResolvedValue([
      { provider: "GOOGLE", linkedAt: "2024-01-02T00:00:00Z" },
    ]);
    
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByText("GOOGLE")).toBeInTheDocument();
    });

    expect(screen.queryByText("Change Password")).not.toBeInTheDocument();
  });

  it("validates password fields", async () => {
    const user = userEvent.setup();
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    // Submit without filling fields
    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
    });
  });

  it("validates password length", async () => {
    const user = userEvent.setup();
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "short");
    await user.type(screen.getByLabelText(/confirm new password/i), "short");

    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it("validates password match", async () => {
    const user = userEvent.setup();
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "newpassword123");
    await user.type(screen.getByLabelText(/confirm new password/i), "differentpassword");

    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("submits password change", async () => {
    const user = userEvent.setup();
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "newpassword123");
    await user.type(screen.getByLabelText(/confirm new password/i), "newpassword123");

    await user.click(screen.getByRole("button", { name: /change password/i }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: "oldpassword",
        newPassword: "newpassword123",
      });
    });
  });

  it("shows unlink buttons when multiple identities", async () => {
    render(<SecurityPage />);

    await waitFor(() => {
      const unlinkButtons = screen.getAllByRole("button", { name: /unlink/i });
      expect(unlinkButtons.length).toBe(2);
    });
  });

  it("hides unlink buttons when only one identity", async () => {
    mockGetIdentities = jest.fn().mockResolvedValue([
      { provider: "EMAIL", linkedAt: "2024-01-01T00:00:00Z" },
    ]);
    
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getByText("Email & Password")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /unlink/i })).not.toBeInTheDocument();
    expect(screen.getByText(/cannot unlink your only sign-in method/i)).toBeInTheDocument();
  });

  it("confirms before unlinking", async () => {
    const user = userEvent.setup();
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /unlink/i })[0]).toBeInTheDocument();
    });

    // Click unlink on first identity
    await user.click(screen.getAllByRole("button", { name: /unlink/i })[0]);

    // Should show confirm/cancel
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("can cancel unlink", async () => {
    const user = userEvent.setup();
    render(<SecurityPage />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /unlink/i })[0]).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: /unlink/i })[0]);
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Confirm button should be gone
    expect(screen.queryByRole("button", { name: /confirm/i })).not.toBeInTheDocument();
  });
});
