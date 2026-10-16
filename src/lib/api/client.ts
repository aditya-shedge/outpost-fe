import { ApiError } from "./types";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/auth/storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Track if we're currently refreshing to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export class ApiClientError extends Error {
  status: number;
  code: string;
  errors?: string[];

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiClientError";
    this.status = apiError.status;
    this.code = apiError.code;
    this.errors = apiError.errors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add auth header if we have a token and not skipping auth
  if (!skipAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let response = await fetch(url, config);

  // Handle 401 - try to refresh token and retry
  if (response.status === 401 && !skipAuth) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      // Retry with new token
      const newAccessToken = getAccessToken();
      if (newAccessToken) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${newAccessToken}`;
        config.headers = headers;
        response = await fetch(url, config);
      }
    } else {
      // Refresh failed - redirect to login
      // Using window.location here is intentional - this runs outside React component lifecycle
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiClientError({
        status: 401,
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        message: "Session expired. Please log in again.",
      });
    }
  }

  // Handle non-OK responses
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        status: response.status,
        error: response.statusText,
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred",
      };
    }
    throw new ApiClientError(errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
