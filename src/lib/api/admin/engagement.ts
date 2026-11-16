import { api } from "../client";
import type {
  EngagementSummaryResponse,
  ContentType,
  GrantDetailResponse,
  ChallengeResponse,
  MentorDetailResponse,
} from "../types";

export interface EngagementSummaryParams {
  from?: string; // ISO date: YYYY-MM-DD
  to?: string; // ISO date: YYYY-MM-DD
  contentType?: ContentType;
}

/**
 * Fetch engagement summary for admins
 * GET /api/v1/admin/engagement/summary
 */
export async function getEngagementSummary(
  params?: EngagementSummaryParams
): Promise<EngagementSummaryResponse> {
  const queryParams = new URLSearchParams();

  if (params?.from) {
    queryParams.append("from", params.from);
  }
  if (params?.to) {
    queryParams.append("to", params.to);
  }
  if (params?.contentType) {
    queryParams.append("contentType", params.contentType);
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/v1/admin/engagement/summary${queryString ? `?${queryString}` : ""}`;

  return api.get<EngagementSummaryResponse>(endpoint);
}

/**
 * Fetch content name by ID and type
 */
export async function fetchContentName(
  contentId: string,
  contentType: ContentType
): Promise<string> {
  try {
    if (contentType === "GRANT") {
      const grant = await api.get<GrantDetailResponse>(`/api/v1/grants/${contentId}`);
      return grant.name || `[Grant ${contentId}]`;
    } else if (contentType === "CHALLENGE") {
      const challenge = await api.get<ChallengeResponse>(`/api/v1/challenges/${contentId}`);
      return challenge.title || `[Challenge ${contentId}]`;
    } else {
      // MENTOR
      const mentor = await api.get<MentorDetailResponse>(`/api/v1/mentors/${contentId}`);
      return mentor.name || `[Mentor ${contentId}]`;
    }
  } catch (error) {
    console.error(`Failed to fetch name for ${contentType} ${contentId}:`, error);
    return `[Deleted ${contentType}]`;
  }
}
