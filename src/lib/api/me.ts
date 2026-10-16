import { api } from "./client";
import type {
  FounderResponse,
  ProfilePatchRequest,
  OnboardingRequest,
  IdentityResponse,
  ChangePasswordRequest,
} from "./types";

export const meApi = {
  /**
   * Get current user profile
   */
  getMe: async (): Promise<FounderResponse> => {
    return api.get<FounderResponse>("/api/v1/me");
  },

  /**
   * Update profile fields
   */
  updateProfile: async (data: ProfilePatchRequest): Promise<FounderResponse> => {
    return api.patch<FounderResponse>("/api/v1/me", data);
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async (data: OnboardingRequest): Promise<FounderResponse> => {
    return api.post<FounderResponse>("/api/v1/me/onboarding", data);
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put<void>("/api/v1/me/password", data);
  },

  /**
   * Get linked identities (OAuth providers)
   */
  getIdentities: async (): Promise<IdentityResponse[]> => {
    return api.get<IdentityResponse[]>("/api/v1/me/identities");
  },

  /**
   * Unlink an OAuth provider
   */
  unlinkIdentity: async (provider: string): Promise<void> => {
    await api.delete<void>(`/api/v1/me/identities/${provider}`);
  },
};
