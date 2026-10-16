import { api } from "./client";
import type { GrantWithAi, GrantDetailResponse, PaginatedResponse, PageMetadata } from "./types";

// Grant filter types matching the backend API
type IssuingBodyType = "CENTRAL" | "STATE" | "OTHER";
type GrantType = "GRANT" | "SUBSIDY" | "SCHEME" | "INCENTIVE";

export interface GrantsListParams {
  page?: number;
  size?: number;
  q?: string;
  issuingBodyType?: IssuingBodyType;
  type?: GrantType;
  stageId?: string;
  sectorId?: string;
  amountBand?: string;
  deadline?: string;
  includeExpired?: boolean;
  ai?: boolean;
  sort?: string;
}

function buildQueryString(params: GrantsListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.q) searchParams.set("q", params.q);
  if (params.issuingBodyType) searchParams.set("issuingBodyType", params.issuingBodyType);
  if (params.type) searchParams.set("type", params.type);
  if (params.stageId) searchParams.set("stageId", params.stageId);
  if (params.sectorId) searchParams.set("sectorId", params.sectorId);
  if (params.amountBand) searchParams.set("amountBand", params.amountBand);
  if (params.deadline) searchParams.set("deadline", params.deadline);
  if (params.includeExpired) searchParams.set("includeExpired", "true");
  if (params.ai) searchParams.set("ai", "true");
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

// Response type from grants list endpoint (includes AI fields when ai=true)
interface GrantsListResponse {
  content: GrantWithAi[];
  page: PageMetadata;
}

/**
 * List published grants with optional filters
 */
export async function getGrants(
  params: GrantsListParams = {}
): Promise<PaginatedResponse<GrantWithAi>> {
  const queryString = buildQueryString(params);
  return api.get<GrantsListResponse>(`/api/v1/grants${queryString}`);
}

/**
 * Get a single grant by ID
 */
export async function getGrantById(id: string): Promise<GrantDetailResponse> {
  return api.get<GrantDetailResponse>(`/api/v1/grants/${id}`);
}
