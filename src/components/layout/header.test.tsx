import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => "/discover",
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the auth context
const mockLogout = jest.fn();
const mockUser = {
  id: "user-1",
  email: "founder@example.com",
  founderName: "Jane Smith",
  startupName: "Acme Inc",
};

jest.mock("@/lib/auth/context", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

describe("Header - User Menu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows user initials in avatar button", () => {
    render(<Header />);

    expect(screen.getByRole("button", { name: /user menu/i })).toHaveTextContent("JS");
  });

  it("opens menu on avatar click", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const avatarButton = screen.getByRole("button", { name: /user menu/i });
    await user.click(avatarButton);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /log out/i })).toBeInTheDocument();
  });

  it("shows user info in menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("founder@example.com")).toBeInTheDocument();
  });

  it("closes menu on click outside", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open menu
    await user.click(screen.getByRole("button", { name: /user menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    // Click outside
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("closes menu on Escape key", async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Open menu
    await user.click(screen.getByRole("button", { name: /user menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    // Press Escape
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("navigates to profile on menu item click", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));
    
    const profileLink = screen.getByRole("menuitem", { name: /profile/i });
    expect(profileLink).toHaveAttribute("href", "/profile");
  });

  it("navigates to settings on menu item click", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));
    
    const settingsLink = screen.getByRole("menuitem", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/profile/security");
  });

  it("logs out and redirects on logout click", async () => {
    const user = userEvent.setup();
    mockLogout.mockResolvedValue(undefined);
    render(<Header />);

    await user.click(screen.getByRole("button", { name: /user menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /log out/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("toggles menu on repeated clicks", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const avatarButton = screen.getByRole("button", { name: /user menu/i });

    // Open
    await user.click(avatarButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    // Close
    await user.click(avatarButton);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    // Open again
    await user.click(avatarButton);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
