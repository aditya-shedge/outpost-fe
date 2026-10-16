import { api } from "./client";
import { TokenResponse, User } from "./types";
import { setTokens, clearTokens } from "@/lib/auth/storage";

interface SignupRequest {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface VerifyRequest {
  token: string;
}

interface ResendVerificationRequest {
  email: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface GoogleOAuthRequest {
  idToken: string;
}

export const authApi = {
  /**
   * Register a new user with email and password
   */
  signup: async (data: SignupRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>(
      "/api/v1/auth/signup",
      data,
      { skipAuth: true }
    );
    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>(
      "/api/v1/auth/login",
      data,
      { skipAuth: true }
    );
    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Verify email with token
   */
  verify: async (data: VerifyRequest): Promise<void> => {
    await api.post<void>("/api/v1/auth/verify", data, { skipAuth: true });
  },

  /**
   * Resend verification email
   */
  resendVerification: async (data: ResendVerificationRequest): Promise<void> => {
    await api.post<void>("/api/v1/auth/resend-verification", data, {
      skipAuth: true,
    });
  },

  /**
   * Request password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post<void>("/api/v1/auth/forgot-password", data, {
      skipAuth: true,
    });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post<void>("/api/v1/auth/reset-password", data, {
      skipAuth: true,
    });
  },

  /**
   * Login/signup with Google OAuth
   */
  googleOAuth: async (data: GoogleOAuthRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>(
      "/api/v1/auth/oauth/google",
      data,
      { skipAuth: true }
    );
    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    return api.get<User>("/api/v1/me");
  },

  /**
   * Logout - clear tokens
   */
  logout: (): void => {
    clearTokens();
  },
};
