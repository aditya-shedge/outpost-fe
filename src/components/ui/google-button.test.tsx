import { render, screen, waitFor, act } from "@testing-library/react";
import { GoogleButton } from "./google-button";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth API
jest.mock("@/lib/api/auth", () => ({
  authApi: {
    googleOAuth: jest.fn(),
  },
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

const mockGoogleOAuth = authApi.googleOAuth as jest.MockedFunction<typeof authApi.googleOAuth>;
const mockToastError = toast.error as jest.MockedFunction<typeof toast.error>;

describe("GoogleButton", () => {
  const originalEnv = process.env;
  let mockGooglePrompt: jest.Mock;
  let mockGoogleInitialize: jest.Mock;
  let mockRenderButton: jest.Mock;
  let capturedCallback: ((response: { credential: string }) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockGoogleOAuth.mockReset();
    mockToastError.mockClear();
    capturedCallback = null;
    
    process.env = { 
      ...originalEnv, 
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: "test-client-id" 
    };

    // Mock Google Identity Services
    mockGooglePrompt = jest.fn();
    mockRenderButton = jest.fn();
    mockGoogleInitialize = jest.fn((config) => {
      capturedCallback = config.callback;
    });

    (window as Window & { google?: unknown }).google = {
      accounts: {
        id: {
          initialize: mockGoogleInitialize,
          prompt: mockGooglePrompt,
          renderButton: mockRenderButton,
          cancel: jest.fn(),
        },
        oauth2: {
          initCodeClient: jest.fn(),
          initTokenClient: jest.fn(),
        },
      },
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    delete (window as Window & { google?: unknown }).google;
  });

  it("shows loading state before Google script loads", () => {
    delete (window as Window & { google?: unknown }).google;
    render(<GoogleButton mode="login" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows unavailable message when client ID is not set", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    render(<GoogleButton />);
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
  });

  it("warns when GOOGLE_CLIENT_ID is not set", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    render(<GoogleButton />);
    
    expect(consoleSpy).toHaveBeenCalledWith("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
    consoleSpy.mockRestore();
  });

  it("shows toast error when clicking without client ID configured", async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    render(<GoogleButton />);
    
    const button = screen.getByRole("button");
    button.click();
    
    expect(mockToastError).toHaveBeenCalledWith("Google Sign-In is not configured");
  });

  it("initializes Google Identity Services with correct config for login mode", async () => {
    render(<GoogleButton mode="login" />);
    
    await waitFor(() => {
      expect(mockGoogleInitialize).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: "test-client-id",
          callback: expect.any(Function),
          ux_mode: "popup",
          context: "signin",
        })
      );
    });
  });

  it("initializes Google Identity Services with signup context for signup mode", async () => {
    render(<GoogleButton mode="signup" />);
    
    await waitFor(() => {
      expect(mockGoogleInitialize).toHaveBeenCalledWith(
        expect.objectContaining({
          context: "signup",
        })
      );
    });
  });

  it("renders Google button with correct text for login mode", async () => {
    render(<GoogleButton mode="login" />);
    
    await waitFor(() => {
      expect(mockRenderButton).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          text: "signin_with",
        })
      );
    });
  });

  it("renders Google button with correct text for signup mode", async () => {
    render(<GoogleButton mode="signup" />);
    
    await waitFor(() => {
      expect(mockRenderButton).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          text: "continue_with",
        })
      );
    });
  });

  it("calls googleOAuth API with credential and redirects on success", async () => {
    mockGoogleOAuth.mockResolvedValueOnce({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    });
    const onSuccess = jest.fn();

    render(<GoogleButton onSuccess={onSuccess} />);
    
    await waitFor(() => {
      expect(mockGoogleInitialize).toHaveBeenCalled();
    });

    // Simulate Google callback
    await act(async () => {
      capturedCallback?.({ credential: "test-id-token" });
    });

    await waitFor(() => {
      expect(mockGoogleOAuth).toHaveBeenCalledWith({ idToken: "test-id-token" });
      expect(onSuccess).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/discover");
    });
  });

  it("calls onError callback and shows toast when API fails", async () => {
    mockGoogleOAuth.mockRejectedValueOnce(new Error("Auth failed"));
    const onError = jest.fn();

    render(<GoogleButton onError={onError} />);
    
    await waitFor(() => {
      expect(mockGoogleInitialize).toHaveBeenCalled();
    });

    // Simulate Google callback
    await act(async () => {
      capturedCallback?.({ credential: "test-id-token" });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(mockToastError).toHaveBeenCalledWith("Auth failed");
    });
  });

  it("applies custom className to container", async () => {
    const { container } = render(<GoogleButton className="custom-class" />);
    
    await waitFor(() => {
      expect(mockRenderButton).toHaveBeenCalled();
    });
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
