"use client";

import { useState, useEffect, useCallback } from "react";
import { getStages, getSectors } from "@/lib/api/lookups";
import type { LookupResponse } from "@/lib/api/types";

// Simple in-memory cache
const cache: {
  stages: LookupResponse[] | null;
  sectors: LookupResponse[] | null;
  stagesPromise: Promise<LookupResponse[]> | null;
  sectorsPromise: Promise<LookupResponse[]> | null;
} = {
  stages: null,
  sectors: null,
  stagesPromise: null,
  sectorsPromise: null,
};

interface UseLookupResult {
  data: LookupResponse[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook for fetching startup stages with caching
 */
export function useStages(): UseLookupResult {
  const [data, setData] = useState<LookupResponse[]>(cache.stages || []);
  const [isLoading, setIsLoading] = useState(!cache.stages);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    // Return cached data if available and not forcing refresh
    if (cache.stages && !force) {
      setData(cache.stages);
      setIsLoading(false);
      return;
    }

    // If already fetching, wait for that promise
    if (cache.stagesPromise && !force) {
      try {
        const result = await cache.stagesPromise;
        setData(result);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stages");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      cache.stagesPromise = getStages();
      const result = await cache.stagesPromise;
      cache.stages = result;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stages");
    } finally {
      cache.stagesPromise = null;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, retry };
}

/**
 * Hook for fetching sectors with caching
 */
export function useSectors(): UseLookupResult {
  const [data, setData] = useState<LookupResponse[]>(cache.sectors || []);
  const [isLoading, setIsLoading] = useState(!cache.sectors);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    // Return cached data if available and not forcing refresh
    if (cache.sectors && !force) {
      setData(cache.sectors);
      setIsLoading(false);
      return;
    }

    // If already fetching, wait for that promise
    if (cache.sectorsPromise && !force) {
      try {
        const result = await cache.sectorsPromise;
        setData(result);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sectors");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      cache.sectorsPromise = getSectors();
      const result = await cache.sectorsPromise;
      cache.sectors = result;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sectors");
    } finally {
      cache.sectorsPromise = null;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, isLoading, error, retry };
}

/**
 * Clear the lookup cache (useful for testing or after logout)
 */
export function clearLookupCache(): void {
  cache.stages = null;
  cache.sectors = null;
  cache.stagesPromise = null;
  cache.sectorsPromise = null;
}
