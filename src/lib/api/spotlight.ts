import { api } from "./client";

// Spotlight founder response type (not yet in OpenAPI spec)
export interface SpotlightFounder {
  id: string;
  founderName: string;
  startupName: string;
  oneLiner: string;
  photoUrl?: string;
}

/**
 * Get the current spotlight founder (Founder of the Day)
 * Returns null if no spotlight is set (204 response) or endpoint doesn't exist
 */
export async function getSpotlight(): Promise<SpotlightFounder | null> {
  try {
    const data = await api.get<SpotlightFounder | undefined>("/api/v1/spotlight");
    return data ?? null;
  } catch (error) {
    // If endpoint doesn't exist yet (404), return null gracefully
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      return null;
    }
    console.error("Failed to fetch spotlight:", error);
    return null;
  }
}
