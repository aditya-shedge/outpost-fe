import { renderHook, waitFor } from "@testing-library/react";
import { useStages, useSectors, clearLookupCache } from "./useLookups";

// Mock the API functions
jest.mock("@/lib/api/lookups", () => ({
  getStages: jest.fn(),
  getSectors: jest.fn(),
}));

import { getStages, getSectors } from "@/lib/api/lookups";

const mockGetStages = getStages as jest.MockedFunction<typeof getStages>;
const mockGetSectors = getSectors as jest.MockedFunction<typeof getSectors>;

describe("useLookups hooks (FE-015)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearLookupCache();
  });

  describe("useStages", () => {
    it("fetches stages on mount", async () => {
      const mockStages = [
        { id: "1", name: "Ideation" },
        { id: "2", name: "MVP" },
      ];
      mockGetStages.mockResolvedValue(mockStages);

      const { result } = renderHook(() => useStages());

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockStages);
      expect(result.current.error).toBeNull();
      expect(mockGetStages).toHaveBeenCalledTimes(1);
    });

    it("returns cached data on subsequent calls", async () => {
      const mockStages = [{ id: "1", name: "Ideation" }];
      mockGetStages.mockResolvedValue(mockStages);

      // First render
      const { result: result1 } = renderHook(() => useStages());
      await waitFor(() => expect(result1.current.isLoading).toBe(false));

      // Second render - should use cache
      const { result: result2 } = renderHook(() => useStages());
      
      // Should not be loading since data is cached
      expect(result2.current.data).toEqual(mockStages);
      
      // API should only have been called once
      expect(mockGetStages).toHaveBeenCalledTimes(1);
    });

    it("handles errors and provides retry", async () => {
      mockGetStages.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useStages());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.data).toEqual([]);
      expect(typeof result.current.retry).toBe("function");
    });
  });

  describe("useSectors", () => {
    it("fetches sectors on mount", async () => {
      const mockSectors = [
        { id: "1", name: "FinTech" },
        { id: "2", name: "HealthTech" },
      ];
      mockGetSectors.mockResolvedValue(mockSectors);

      const { result } = renderHook(() => useSectors());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSectors);
      expect(result.current.error).toBeNull();
    });

    it("returns cached data on subsequent calls", async () => {
      const mockSectors = [{ id: "1", name: "FinTech" }];
      mockGetSectors.mockResolvedValue(mockSectors);

      // First render
      const { result: result1 } = renderHook(() => useSectors());
      await waitFor(() => expect(result1.current.isLoading).toBe(false));

      // Second render - should use cache
      const { result: result2 } = renderHook(() => useSectors());
      expect(result2.current.data).toEqual(mockSectors);
      expect(mockGetSectors).toHaveBeenCalledTimes(1);
    });

    it("handles errors", async () => {
      mockGetSectors.mockRejectedValue(new Error("API error"));

      const { result } = renderHook(() => useSectors());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("API error");
    });
  });

  describe("clearLookupCache", () => {
    it("clears cached data", async () => {
      const mockStages = [{ id: "1", name: "Ideation" }];
      mockGetStages.mockResolvedValue(mockStages);

      // First fetch
      const { result: result1 } = renderHook(() => useStages());
      await waitFor(() => expect(result1.current.isLoading).toBe(false));
      expect(mockGetStages).toHaveBeenCalledTimes(1);

      // Clear cache
      clearLookupCache();

      // Second fetch - should call API again
      const { result: result2 } = renderHook(() => useStages());
      await waitFor(() => expect(result2.current.isLoading).toBe(false));
      expect(mockGetStages).toHaveBeenCalledTimes(2);
    });
  });
});
