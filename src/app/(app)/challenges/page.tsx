"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { getChallenges, getChallengeThemes, ChallengesListParams } from "@/lib/api/challenges";
import { getSectors } from "@/lib/api/lookups";
import { LoadingSpinner } from "@/components/ui";
import { ChallengeCard, ChallengeCardSkeleton } from "@/components/ui/challenge-card";
import type { LookupResponse, ChallengeWithAi, PageMetadata } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
] as const;

export default function ChallengesPage() {
  return (
    <Suspense fallback={<ChallengesPageLoading />}>
      <ChallengesContent />
    </Suspense>
  );
}

function ChallengesPageLoading() {
  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}

function ChallengesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOnboarded } = useAuth();

  // Data state
  const [challenges, setChallenges] = useState<ChallengeWithAi[]>([]);
  const [page, setPage] = useState<PageMetadata>({
    number: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
  });
  const [sectors, setSectors] = useState<LookupResponse[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state (from URL)
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sectorId, setSectorId] = useState(searchParams.get("sectorId") || "");
  const [theme, setTheme] = useState(searchParams.get("theme") || "");
  const [corporate, setCorporate] = useState(searchParams.get("corporate") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [aiEnabled, setAiEnabled] = useState(() => {
    if (searchParams.get("ai") === "true") return true;
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai-ranking-enabled") === "true";
    }
    return false;
  });
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 0);
  const [aiApplied, setAiApplied] = useState(false);

  // Load lookups on mount
  useEffect(() => {
    async function loadLookups() {
      try {
        const [sectorsData, themesData] = await Promise.all([
          getSectors(),
          getChallengeThemes(),
        ]);
        setSectors(sectorsData);
        setThemes(themesData);
      } catch (err) {
        console.error("Failed to load lookups:", err);
      }
    }
    loadLookups();
  }, []);

  // Fetch challenges
  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: ChallengesListParams = {
        page: currentPage,
        size: 12,
      };

      if (search) params.q = search;
      if (sectorId) params.sectorId = sectorId;
      if (theme) params.theme = theme;
      if (corporate) params.corporate = corporate;
      if (status) params.status = status as "OPEN" | "CLOSED";
      if (aiEnabled && isOnboarded) params.ai = true;

      const response = await getChallenges(params);
      setChallenges(response.content);
      setPage(response.page);
      setAiApplied(response.content.some((c) => c.aiApplied === true));
    } catch (err) {
      setError("Failed to load challenges. Please try again.");
      console.error("Failed to fetch challenges:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, sectorId, theme, corporate, status, aiEnabled, isOnboarded]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sectorId) params.set("sectorId", sectorId);
    if (theme) params.set("theme", theme);
    if (corporate) params.set("corporate", corporate);
    if (status) params.set("status", status);
    if (aiEnabled) params.set("ai", "true");
    if (currentPage > 0) params.set("page", String(currentPage));

    const queryString = params.toString();
    router.push(`/challenges${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router, search, sectorId, theme, corporate, status, aiEnabled, currentPage]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchChallenges();
  };

  // Handle filter change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(0);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setSectorId("");
    setTheme("");
    setCorporate("");
    setStatus("");
    setAiEnabled(false);
    setCurrentPage(0);
  };

  const hasActiveFilters = search || sectorId || theme || corporate || status || aiEnabled;

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      {/* Header */}
      <section className="mb-8">
        <p className="mono-label text-blue-dark flex items-center gap-2 mb-4">
          <span className="w-[7px] h-[7px] rounded-full bg-blue" />
          INNOVATION OPPORTUNITIES
        </p>
        <h1 className="font-serif font-bold text-[clamp(34px,4vw,49px)] leading-[1.05] tracking-[-0.06em] mb-4">
          Corporate Challenges
        </h1>
        <p className="max-w-[520px] text-muted leading-[1.75] text-[15px]">
          Solve real business problems and partner with leading corporates for pilots, POCs, and partnerships.
        </p>
      </section>

      {/* Search & AI Toggle */}
      <section className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-[400px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges..."
              className="w-full h-11 pl-10 pr-4 bg-paper-light border border-line text-ink placeholder:text-placeholder text-sm focus:outline-none focus:border-blue transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {isOnboarded && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setAiEnabled(enabled);
                  setCurrentPage(0);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("ai-ranking-enabled", String(enabled));
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-line peer-checked:bg-violet-600 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
              <span className="text-sm text-muted">
                AI Ranking
              </span>
            </label>
          )}
        </form>
      </section>

      {/* Filters */}
      <section className="mb-8 flex flex-wrap gap-3 items-center">
        <FilterSelect
          value={sectorId}
          onChange={(v) => handleFilterChange(setSectorId, v)}
          options={[
            { value: "", label: "All Sectors" },
            ...sectors.map((s) => ({ value: s.id!, label: s.name! })),
          ]}
          label="Sector"
        />
        <FilterSelect
          value={theme}
          onChange={(v) => handleFilterChange(setTheme, v)}
          options={[
            { value: "", label: "All Themes" },
            ...themes.map((t) => ({ value: t, label: t })),
          ]}
          label="Theme"
        />
        <FilterSelect
          value={status}
          onChange={(v) => handleFilterChange(setStatus, v)}
          options={STATUS_OPTIONS}
          label="Status"
        />

        <div className="relative max-w-[200px]">
          <input
            type="text"
            value={corporate}
            onChange={(e) => handleFilterChange(setCorporate, e.target.value)}
            placeholder="Corporate name..."
            className="w-full h-10 px-3 bg-paper-light border border-line text-ink placeholder:text-placeholder text-sm focus:outline-none focus:border-blue transition-colors"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-blue-dark hover:text-blue underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </section>

      {/* Results count */}
      <section className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              Showing <span className="font-semibold text-ink">{challenges.length}</span> of{" "}
              <span className="font-semibold text-ink">{page.totalElements}</span> challenges
              {aiEnabled && aiApplied && (
                <span className="ml-2 text-blue-dark">• AI ranked for you</span>
              )}
              {aiEnabled && !aiApplied && challenges.length > 0 && (
                <span className="ml-2 text-muted">• Showing standard results</span>
              )}
            </>
          )}
        </p>
      </section>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-rose-light border border-rose text-rose-dark text-sm">
          {error}
        </div>
      )}

      {/* Challenges grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <ChallengeCardSkeleton key={i} />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted text-lg mb-2">No challenges found</p>
          <p className="text-sm text-placeholder">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page.totalPages ?? 0) > 1 && (
        <section className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm border border-line bg-paper-light hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(page.totalPages ?? 0, 5) }, (_, i) => {
              let pageNum = i;
              const totalPages = page.totalPages ?? 0;
              if (totalPages > 5) {
                if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 text-sm border transition-colors ${
                    currentPage === pageNum
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-line bg-paper-light hover:bg-violet-100"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min((page.totalPages ?? 1) - 1, p + 1))}
            disabled={currentPage === (page.totalPages ?? 1) - 1}
            className="px-4 py-2 text-sm border border-line bg-paper-light hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </section>
      )}
    </div>
  );
}

// Filter select component
function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 px-3 pr-8 bg-paper-light border border-line text-ink text-sm focus:outline-none focus:border-blue transition-colors appearance-none cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2372777b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        backgroundSize: "16px",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
