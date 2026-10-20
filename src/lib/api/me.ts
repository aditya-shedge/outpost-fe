import { api } from "./client";
import type {
  FounderResponse,
  ProfilePatchRequest,
  OnboardingRequest,
  IdentityResponse,
  ChangePasswordRequest,
  PitchDeckResponse,
  EnrichedProfileRequest,
  EnrichedProfile,
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

  // ============================================
  // Enriched Profile (FE-045)
  // Backend: PATCH /api/v1/me/profile (OP-053)
  // ============================================

  /**
   * Update enriched profile (bio and links)
   */
  updateEnrichedProfile: async (data: EnrichedProfileRequest): Promise<EnrichedProfile> => {
    return api.patch<EnrichedProfile>("/api/v1/me/profile", data);
  },

  /**
   * Get enriched profile (bio and links)
   * Note: This might be included in the main /me response when backend supports it
   */
  getEnrichedProfile: async (): Promise<EnrichedProfile> => {
    return api.get<EnrichedProfile>("/api/v1/me/profile");
  },

  // ============================================
  // Pitch Deck (FE-046)
  // Backend: /api/v1/me/pitch-deck (OP-052)
  // ============================================

  /**
   * Upload or replace pitch deck
   * PDF only, max 10MB
   */
  uploadPitchDeck: async (file: File): Promise<PitchDeckResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<PitchDeckResponse>("/api/v1/me/pitch-deck", formData);
  },

  /**
   * Get pitch deck download URL
   * Returns a redirect URL or throws 404 if no deck uploaded
   */
  getPitchDeckUrl: (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return `${baseUrl}/api/v1/me/pitch-deck`;
  },

  /**
   * Check if pitch deck exists by trying to get info
   * Note: The actual endpoint returns 302 or 404, so we need a HEAD or info endpoint
   * For now, we'll just attempt to fetch and catch 404
   */
  hasPitchDeck: async (): Promise<PitchDeckResponse | null> => {
    try {
      // The backend returns 302 redirect on GET, but we need metadata
      // We'll attempt a HEAD request or use an info endpoint if available
      // For now, return null and let the UI check via other means
      const response = await fetch(meApi.getPitchDeckUrl(), {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        redirect: "manual", // Don't follow redirect
      });
      
      if (response.status === 302 || response.status === 200) {
        // Pitch deck exists - but we don't have metadata from HEAD
        // The actual metadata comes from the upload response
        return { fileName: "pitch-deck.pdf" }; // Placeholder
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Delete pitch deck
   */
  deletePitchDeck: async (): Promise<void> => {
    await api.delete<void>("/api/v1/me/pitch-deck");
  },
};
