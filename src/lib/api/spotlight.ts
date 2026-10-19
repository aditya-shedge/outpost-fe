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
  } catch {
    // Silently return null - endpoint may not exist yet or no spotlight set
    // This is expected behavior, not an error condition
    return null;
  }
}
