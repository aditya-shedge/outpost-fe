import { api } from "./client";

// ============================================
// Engagement Tracking API
// ============================================

export type ContentType = "GRANT" | "CHALLENGE" | "MENTOR";

/**
 * Track a click on external link (apply URL, source URL, cal.com)
 * Fire and forget - don't block the user
 */
export async function trackClick(contentType: ContentType, contentId: string): Promise<void> {
  try {
    await api.post("/api/v1/engagement/click", { contentType, contentId });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug("Failed to track click:", error);
  }
}

// ============================================
// Admin Engagement API
// ============================================

export interface EngagementSummaryParams {
  contentType?: ContentType;
  from?: string; // ISO date
  to?: string; // ISO date
}

export interface ContentEngagement {
  contentId: string;
  contentType: ContentType;
  views: number;
  clicks: number;
}

export interface PeriodCount {
  period: string;
  count: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface EngagementSummary {
  topByViews: ContentEngagement[];
  topByClicks: ContentEngagement[];
  viewsByWeek: PeriodCount[];
  viewsByMonth: PeriodCount[];
  bySector: NamedCount[];
  byStage: NamedCount[];
}

/**
 * Get engagement summary for admin dashboard
 */
export async function getEngagementSummary(
  params: EngagementSummaryParams = {}
): Promise<EngagementSummary> {
  const searchParams = new URLSearchParams();
  if (params.contentType) searchParams.set("contentType", params.contentType);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);

  const query = searchParams.toString();
  const response = await api.get<EngagementSummary>(
    `/api/v1/admin/engagement/summary${query ? `?${query}` : ""}`
  );
  
  return response || {
    topByViews: [],
    topByClicks: [],
    viewsByWeek: [],
    viewsByMonth: [],
    bySector: [],
    byStage: [],
  };
}
