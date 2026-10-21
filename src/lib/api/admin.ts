import { api } from "./client";
import type {
  AdminGrantResponse,
  GrantRequest,
  ChallengeResponse,
  ChallengeRequest,
  MentorAdminResponse,
  PaginatedResponse,
  PageMetadata,
} from "./types";

// ============================================
// Admin Grants API
// ============================================

export interface AdminGrantsParams {
  page?: number;
  size?: number;
  status?: "published" | "draft" | "expired";
  q?: string;
}

export async function getAdminGrants(
  params: AdminGrantsParams = {}
): Promise<PaginatedResponse<AdminGrantResponse>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.status) searchParams.set("status", params.status);
  if (params.q) searchParams.set("q", params.q);

  const query = searchParams.toString();
  const response = await api.get<{ content: AdminGrantResponse[]; page: PageMetadata }>(
    `/api/v1/admin/grants${query ? `?${query}` : ""}`
  );
  return {
    content: response?.content || [],
    page: response?.page || { number: 0, size: 20, totalElements: 0, totalPages: 0 },
  };
}

export async function getAdminGrant(id: string): Promise<AdminGrantResponse | null> {
  try {
    return await api.get<AdminGrantResponse>(`/api/v1/admin/grants/${id}`);
  } catch {
    return null;
  }
}

export async function createGrant(data: GrantRequest): Promise<AdminGrantResponse> {
  return api.post<AdminGrantResponse>("/api/v1/admin/grants", data);
}

export async function updateGrant(id: string, data: GrantRequest): Promise<AdminGrantResponse> {
  return api.put<AdminGrantResponse>(`/api/v1/admin/grants/${id}`, data);
}

export async function deleteGrant(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/grants/${id}`);
}

export async function publishGrant(id: string): Promise<void> {
  await api.post(`/api/v1/admin/grants/${id}/publish`);
}

export async function unpublishGrant(id: string): Promise<void> {
  await api.post(`/api/v1/admin/grants/${id}/unpublish`);
}

export async function expireGrant(id: string): Promise<void> {
  await api.post(`/api/v1/admin/grants/${id}/expire`);
}

// ============================================
// Admin Challenges API
// ============================================

export interface AdminChallengesParams {
  page?: number;
  size?: number;
  status?: "OPEN" | "CLOSED";
  published?: boolean;
  q?: string;
}

export async function getAdminChallenges(
  params: AdminChallengesParams = {}
): Promise<PaginatedResponse<ChallengeResponse>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.status) searchParams.set("status", params.status);
  if (params.published !== undefined) searchParams.set("published", String(params.published));
  if (params.q) searchParams.set("q", params.q);

  const query = searchParams.toString();
  const response = await api.get<{ content: ChallengeResponse[]; page: PageMetadata }>(
    `/api/v1/admin/challenges${query ? `?${query}` : ""}`
  );
  return {
    content: response?.content || [],
    page: response?.page || { number: 0, size: 20, totalElements: 0, totalPages: 0 },
  };
}

export async function getAdminChallenge(id: string): Promise<ChallengeResponse | null> {
  try {
    return await api.get<ChallengeResponse>(`/api/v1/admin/challenges/${id}`);
  } catch {
    return null;
  }
}

export async function createChallenge(data: ChallengeRequest): Promise<ChallengeResponse> {
  return api.post<ChallengeResponse>("/api/v1/admin/challenges", data);
}

export async function updateChallenge(id: string, data: ChallengeRequest): Promise<ChallengeResponse> {
  return api.put<ChallengeResponse>(`/api/v1/admin/challenges/${id}`, data);
}

export async function deleteChallenge(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/challenges/${id}`);
}

export async function publishChallenge(id: string): Promise<void> {
  await api.post(`/api/v1/admin/challenges/${id}/publish`);
}

export async function unpublishChallenge(id: string): Promise<void> {
  await api.post(`/api/v1/admin/challenges/${id}/unpublish`);
}

export async function closeChallenge(id: string): Promise<void> {
  await api.post(`/api/v1/admin/challenges/${id}/close`);
}

// ============================================
// Admin Mentors API
// ============================================

export interface AdminMentorsParams {
  page?: number;
  size?: number;
  status?: "SEEDED" | "PENDING" | "APPROVED" | "REJECTED";
  q?: string;
}

export async function getAdminMentors(
  params: AdminMentorsParams = {}
): Promise<PaginatedResponse<MentorAdminResponse>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  if (params.status) searchParams.set("status", params.status);
  if (params.q) searchParams.set("q", params.q);

  const query = searchParams.toString();
  // Backend returns a plain array, not paginated
  const response = await api.get<MentorAdminResponse[]>(
    `/api/v1/admin/mentors${query ? `?${query}` : ""}`
  );
  
  // Convert to paginated format for consistency with UI
  const content = response || [];
  return {
    content,
    page: { number: 0, size: content.length, totalElements: content.length, totalPages: 1 },
  };
}

export async function getAdminMentor(id: string): Promise<MentorAdminResponse | null> {
  try {
    return await api.get<MentorAdminResponse>(`/api/v1/admin/mentors/${id}`);
  } catch {
    return null;
  }
}

export async function approveMentor(id: string): Promise<void> {
  await api.post(`/api/v1/admin/mentors/${id}/approve`);
}

export async function rejectMentor(id: string, reason: string): Promise<void> {
  await api.post(`/api/v1/admin/mentors/${id}/reject`, { reason });
}

export async function updateMentor(id: string, data: Partial<MentorAdminResponse>): Promise<MentorAdminResponse> {
  return api.put<MentorAdminResponse>(`/api/v1/admin/mentors/${id}`, data);
}

export async function deleteMentor(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/mentors/${id}`);
}
