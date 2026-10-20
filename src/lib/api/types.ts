// Re-export types from OpenAPI-generated definitions
// Run `npx openapi-typescript http://localhost:8080/v3/api-docs -o src/lib/api.d.ts` to regenerate

import type { components, operations } from "../api.d";

// ============================================
// Schema types (response/request bodies)
// ============================================

// Auth
export type TokenResponse = components["schemas"]["TokenResponse"];
export type SignupRequest = components["schemas"]["SignupRequest"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type RefreshRequest = components["schemas"]["RefreshRequest"];
export type VerifyRequest = components["schemas"]["VerifyRequest"];
export type ForgotPasswordRequest = components["schemas"]["ForgotPasswordRequest"];
export type ResetPasswordRequest = components["schemas"]["ResetPasswordRequest"];
export type ResendVerificationRequest = components["schemas"]["ResendVerificationRequest"];
export type GoogleLoginRequest = components["schemas"]["GoogleLoginRequest"];
export type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];

// User/Founder
export type FounderResponse = components["schemas"]["FounderResponse"];
export type ProfilePatchRequest = components["schemas"]["ProfilePatchRequest"];
export type OnboardingRequest = components["schemas"]["OnboardingRequest"];
export type IdentityResponse = components["schemas"]["IdentityResponse"];

// Lookups
export type LookupResponse = components["schemas"]["LookupResponse"];

// Grants
export type GrantDetailResponse = components["schemas"]["GrantDetailResponse"];
export type AdminGrantResponse = components["schemas"]["AdminGrantResponse"];
export type GrantRequest = components["schemas"]["GrantRequest"];

// Challenges
export type ChallengeResponse = components["schemas"]["ChallengeResponse"];
export type ChallengeRequest = components["schemas"]["ChallengeRequest"];
export type ApplyResponse = components["schemas"]["ApplyResponse"];

// Mentors
export type MentorDetailResponse = components["schemas"]["MentorDetailResponse"];
export type MentorLinkResponse = components["schemas"]["MentorLinkResponse"];
export type MentorApplicationRequest = components["schemas"]["MentorApplicationRequest"];
export type MentorAdminResponse = components["schemas"]["MentorAdminResponse"];
export type MentorAdminRequest = components["schemas"]["MentorAdminRequest"];

// Partners & Offers
export type PartnerResponse = components["schemas"]["PartnerResponse"];
export type PartnerRequest = components["schemas"]["PartnerRequest"];
export type OfferResponse = components["schemas"]["OfferResponse"];
export type OfferRequest = components["schemas"]["OfferRequest"];

// Pagination
export type PageMetadata = components["schemas"]["PageMetadata"];

// Pitch Deck - manually defined (not in generated types yet)
export interface PitchDeckResponse {
  fileName?: string;
  sizeBytes?: number;
  uploadedAt?: string;
}

// ============================================
// Enriched Profile types (FE-045)
// These types are for bio + links editing
// Backend endpoint: PATCH /api/v1/me/profile (OP-053)
// ============================================

export type LinkType = "LINKEDIN" | "X" | "OTHER";

export interface FounderLink {
  type: LinkType;
  url: string;
}

export interface EnrichedProfileRequest {
  bio?: string | null;
  links?: FounderLink[] | null;
}

export interface EnrichedProfile {
  bio?: string | null;
  links?: FounderLink[] | null;
}

// ============================================
// Convenience type aliases
// ============================================

// Alias for backward compatibility
export type User = FounderResponse;
export type Stage = LookupResponse;
export type Sector = LookupResponse;
export type Grant = GrantDetailResponse;
export type Challenge = ChallengeResponse;
export type Mentor = MentorDetailResponse;
export type Identity = IdentityResponse;

// Enum types extracted from schema
export type IssuingBodyType = NonNullable<GrantRequest["issuingBodyType"]>;
export type GrantType = NonNullable<GrantRequest["type"]>;
export type ChallengeStatus = NonNullable<ChallengeResponse["status"]>;
export type OfferCategory = NonNullable<OfferRequest["category"]>;
export type MentorStatus = NonNullable<MentorAdminResponse["status"]>;
export type FounderRole = NonNullable<FounderResponse["role"]>;
export type IdentityProvider = operations["unlinkIdentity"]["parameters"]["path"]["provider"];
export type OfferType = NonNullable<ChallengeResponse["offerType"]>;

// ============================================
// Paginated response wrapper
// ============================================

export interface PaginatedResponse<T> {
  content: T[];
  page: PageMetadata;
}

// ============================================
// API Error shape (RFC 7807 ProblemDetail)
// ============================================

export interface ApiError {
  status: number;
  error: string;
  code: string;
  message: string;
  errors?: string[];
}

// ============================================
// Extended types with AI fields
// (These are added by the backend when ai=true)
// ============================================

export interface WithAiFields {
  aiReason?: string | null;
  aiApplied?: boolean;
}

export type GrantWithAi = GrantDetailResponse & WithAiFields;
export type ChallengeWithAi = ChallengeResponse & WithAiFields;
export type MentorWithAi = MentorDetailResponse & WithAiFields;
