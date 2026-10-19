import { api } from "./client";

// Public founder profile response type (not yet in OpenAPI spec)
export interface PublicFounderProfile {
  id: string;
  founderName: string;
  startupName: string;
  bio?: string;
  oneLiner?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  stage?: string;
  sector?: string;
}

/**
 * Get a founder's public profile
 * Only accessible if founder is current spotlight or visibility allows
 * Returns null if not accessible (404 response)
 */
export async function getFounderProfile(id: string): Promise<PublicFounderProfile | null> {
  try {
    const data = await api.get<PublicFounderProfile>(`/api/v1/founders/${id}/profile`);
    return data;
  } catch (error) {
    // 404 means founder not accessible
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      return null;
    }
    console.error("Failed to fetch founder profile:", error);
    return null;
  }
}
