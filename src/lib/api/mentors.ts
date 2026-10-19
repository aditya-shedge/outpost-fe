import { api } from "./client";
import type { MentorWithAi, MentorDetailResponse, PaginatedResponse, PageMetadata } from "./types";

export interface MentorsListParams {
  page?: number;
  size?: number;
  q?: string;
  expertise?: string | string[];
  stageId?: string;
  sectorId?: string;
  ai?: boolean;
  sort?: string;
}

function buildQueryString(params: MentorsListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.q) searchParams.set("q", params.q);
  
  // Expertise can be array (multiple values) or string
  if (params.expertise) {
    const expertiseValues = Array.isArray(params.expertise) 
      ? params.expertise 
      : [params.expertise];
    expertiseValues.forEach((exp) => searchParams.append("expertise", exp));
  }
  
  if (params.stageId) searchParams.set("stageId", params.stageId);
  if (params.sectorId) searchParams.set("sectorId", params.sectorId);
  if (params.ai) searchParams.set("ai", "true");
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

interface MentorsListResponse {
  content: MentorWithAi[];
  page: PageMetadata;
}

/**
 * List published mentors with optional filters
 */
export async function getMentors(
  params: MentorsListParams = {}
): Promise<PaginatedResponse<MentorWithAi>> {
  const queryString = buildQueryString(params);
  return api.get<MentorsListResponse>(`/api/v1/mentors${queryString}`);
}

/**
 * Get a single mentor by ID
 */
export async function getMentorById(id: string): Promise<MentorDetailResponse> {
  return api.get<MentorDetailResponse>(`/api/v1/mentors/${id}`);
}
