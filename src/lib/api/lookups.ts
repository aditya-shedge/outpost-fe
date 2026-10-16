import { api } from "./client";
import type { LookupResponse } from "./types";

/**
 * Get all startup stages
 */
export async function getStages(): Promise<LookupResponse[]> {
  return api.get<LookupResponse[]>("/api/v1/lookups/stages");
}

/**
 * Get all sectors
 */
export async function getSectors(): Promise<LookupResponse[]> {
  return api.get<LookupResponse[]>("/api/v1/lookups/sectors");
}
