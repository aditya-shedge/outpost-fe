import { api } from "./client";
import type { ChallengeWithAi, ChallengeResponse, PaginatedResponse, PageMetadata } from "./types";

export interface ChallengesListParams {
  page?: number;
  size?: number;
  q?: string;
  sectorId?: string;
  theme?: string;
  corporate?: string;
  status?: "OPEN" | "CLOSED";
  ai?: boolean;
  sort?: string;
}

function buildQueryString(params: ChallengesListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.q) searchParams.set("q", params.q);
  if (params.sectorId) searchParams.set("sectorId", params.sectorId);
  if (params.theme) searchParams.set("theme", params.theme);
  if (params.corporate) searchParams.set("corporate", params.corporate);
  if (params.status) searchParams.set("status", params.status);
  if (params.ai) searchParams.set("ai", "true");
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

interface ChallengesListResponse {
  content: ChallengeWithAi[];
  page: PageMetadata;
}

/**
 * List published challenges with optional filters
 */
export async function getChallenges(
  params: ChallengesListParams = {}
): Promise<PaginatedResponse<ChallengeWithAi>> {
  const queryString = buildQueryString(params);
  return api.get<ChallengesListResponse>(`/api/v1/challenges${queryString}`);
}

/**
 * Get a single challenge by ID
 */
export async function getChallengeById(id: string): Promise<ChallengeResponse> {
  return api.get<ChallengeResponse>(`/api/v1/challenges/${id}`);
}

/**
 * Get available challenge themes
 */
export async function getChallengeThemes(): Promise<string[]> {
  return api.get<string[]>("/api/v1/challenges/themes");
}
