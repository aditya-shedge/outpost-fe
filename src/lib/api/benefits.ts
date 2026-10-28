import { api } from "./client";
import type { PaginatedResponse, PageMetadata } from "./types";

// Types based on backend response shapes
export interface Partner {
  id?: string;
  name?: string;
  logoUrl?: string;
  website?: string;
  publishedOfferCount?: number;
}

export interface Benefit {
  id?: string;
  partner?: Partner;
  headline?: string;
  category?: "CLOUD" | "DEV_TOOLS" | "BUSINESS_TOOLS" | "SERVICES";
  eligibilityNote?: string;
  whatYouGet?: string;
  howToClaim?: string;
  claimUrl?: string;
  claimCode?: string | null;
  validUntil?: string;
  expired?: boolean;
  aiApplied?: boolean;
  aiReason?: string;
}

export type BenefitCategory = NonNullable<Benefit["category"]>;

export interface BenefitsListParams {
  page?: number;
  size?: number;
  q?: string;
  category?: BenefitCategory;
  partnerId?: string;
  includeExpired?: boolean;
  ai?: boolean;
  sort?: string;
}

function buildQueryString(params: BenefitsListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);
  if (params.partnerId) searchParams.set("partnerId", params.partnerId);
  if (params.includeExpired) searchParams.set("includeExpired", "true");
  if (params.ai) searchParams.set("ai", "true");
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

// Benefits list response
interface BenefitsListResponse {
  content: Benefit[];
  page: PageMetadata;
}

/**
 * List published benefits/offers
 */
export async function getBenefits(
  params: BenefitsListParams = {}
): Promise<PaginatedResponse<Benefit>> {
  const queryString = buildQueryString(params);
  try {
    const response = await api.get<BenefitsListResponse>(`/api/v1/benefits${queryString}`);
    return {
      content: response?.content || [],
      page: response?.page || { number: 0, size: 20, totalElements: 0, totalPages: 0 },
    };
  } catch (error) {
    // Return empty result if endpoint doesn't exist
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      return { content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } };
    }
    throw error;
  }
}

/**
 * Get a single benefit by ID
 */
export async function getBenefit(id: string): Promise<Benefit | null> {
  try {
    const response = await api.get<Benefit>(`/api/v1/benefits/${id}`);
    return response;
  } catch (error) {
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get featured partners for benefits page
 */
export async function getFeaturedPartners(): Promise<Partner[]> {
  try {
    const response = await api.get<Partner[]>("/api/v1/benefits/featured");
    return response || [];
  } catch (error) {
    // Return empty array if endpoint doesn't exist
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      return [];
    }
    console.error("Failed to fetch featured partners:", error);
    return [];
  }
}

/**
 * Get all partners (for filter dropdown)
 */
export async function getPartners(): Promise<Partner[]> {
  try {
    const response = await api.get<{ content: Partner[] }>("/api/v1/partners");
    return response?.content || [];
  } catch (error) {
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      return [];
    }
    console.error("Failed to fetch partners:", error);
    return [];
  }
}
