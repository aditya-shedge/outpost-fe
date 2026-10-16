// API Error shape from backend (RFC 7807 ProblemDetail)
export interface ApiError {
  status: number;
  error: string;
  code: string;
  message: string;
  errors?: string[];
}

// Paginated response shape
export interface PaginatedResponse<T> {
  content: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Token response from login/signup/refresh
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User/Founder profile
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  founderName: string | null;
  startupName: string | null;
  stageId: string | null;
  stageName: string | null;
  sectorId: string | null;
  sectorName: string | null;
  city: string | null;
  website: string | null;
  onboarded: boolean;
  role: "FOUNDER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

// Lookup types
export interface Stage {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Sector {
  id: string;
  name: string;
  sortOrder: number;
}

// Grant types
export interface Grant {
  id: string;
  name: string;
  issuingBody: string;
  issuingBodyType: "CENTRAL" | "STATE" | "OTHER";
  type: "GRANT" | "SUBSIDY" | "SCHEME" | "INCENTIVE";
  amountDisplay: string | null;
  deadline: string | null;
  summary: string;
  eligibility: string | null;
  whatIsFunded: string | null;
  howToApply: string | null;
  sourceUrl: string;
  stages: Stage[];
  sectors: Sector[];
  expired: boolean;
  aiReason?: string | null;
  aiApplied?: boolean;
}

// Challenge types
export interface Challenge {
  id: string;
  corporateName: string;
  corporateLogoUrl: string | null;
  title: string;
  sector: Sector | null;
  theme: string;
  deadline: string;
  status: "OPEN" | "CLOSED";
  applyUrl: string;
  hasDetail: boolean;
  problemStatement: string | null;
  lookingFor: string | null;
  eligibility: string | null;
  timeline: string | null;
  offerType: "PILOT" | "POC" | "PARTNERSHIP" | null;
  aiReason?: string | null;
  aiApplied?: boolean;
}

// Mentor types
export interface Mentor {
  id: string;
  name: string;
  photoUrl: string | null;
  headline: string;
  bio: string | null;
  experience: string | null;
  expertise: string[];
  links: { type: string; url: string }[];
  calcomUrl: string;
  stage: Stage | null;
  sector: Sector | null;
  aiReason?: string | null;
  aiApplied?: boolean;
}

// Identity (linked OAuth providers)
export interface Identity {
  provider: "GOOGLE" | "EMAIL";
  linkedAt: string;
}
