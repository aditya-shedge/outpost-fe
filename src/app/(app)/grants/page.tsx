"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { getGrants, GrantsListParams } from "@/lib/api/grants";
import { getStages, getSectors } from "@/lib/api/lookups";
import { LoadingSpinner } from "@/components/ui";
import { GrantCard, GrantCardSkeleton } from "@/components/ui/grant-card";
import type { LookupResponse, GrantWithAi, PageMetadata } from "@/lib/api/types";

const ISSUING_BODY_TYPES = [
  { value: "", label: "All Sources" },
  { value: "CENTRAL", label: "Central Government" },
  { value: "STATE", label: "State Government" },
  { value: "OTHER", label: "Other" },
] as const;

const GRANT_TYPES = [
  { value: "", label: "All Types" },
  { value: "GRANT", label: "Grant" },
  { value: "SUBSIDY", label: "Subsidy" },
  { value: "SCHEME", label: "Scheme" },
  { value: "INCENTIVE", label: "Incentive" },
] as const;

const AMOUNT_BANDS = [
  { value: "", label: "Any Amount" },
  { value: "UNDER_10L", label: "Under ₹10L" },
  { value: "10L_50L", label: "₹10L - 50L" },
  { value: "50L_1CR", label: "₹50L - 1Cr" },
  { value: "OVER_1CR", label: "Over ₹1Cr" },
] as const;

const DEADLINE_OPTIONS = [
  { value: "", label: "Any Deadline" },
  { value: "OPEN_NOW", label: "Open now" },
  { value: "CLOSING_THIS_MONTH", label: "Closing this month" },
  { value: "ROLLING", label: "Rolling" },
] as const;

export default function GrantsPage() {
  return (
    <Suspense fallback={<GrantsPageLoading />}>
      <GrantsContent />
    </Suspense>
  );
}

function GrantsPageLoading() {
  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}

function GrantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOnboarded } = useAuth();

  // Data state
  const [grants, setGrants] = useState<GrantWithAi[]>([]);
  const [page, setPage] = useState<PageMetadata>({
    number: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
  });
  const [stages, setStages] = useState<LookupResponse[]>([]);
  const [sectors, setSectors] = useState<LookupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state (from URL)
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [issuingBodyType, setIssuingBodyType] = useState(searchParams.get("issuingBodyType") || "");
  const [grantType, setGrantType] = useState(searchParams.get("type") || "");
  const [stageId, setStageId] = useState(searchParams.get("stageId") || "");
  const [sectorId, setSectorId] = useState(searchParams.get("sectorId") || "");
  const [amountBand, setAmountBand] = useState(searchParams.get("amountBand") || "");
  const [deadline, setDeadline] = useState(searchParams.get("deadline") || "");
  const [includeExpired, setIncludeExpired] = useState(searchParams.get("includeExpired") === "true");
  const [aiEnabled, setAiEnabled] = useState(() => {
    // Check URL first, then localStorage
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
        const [stagesData, sectorsData] = await Promise.all([
          getStages(),
          getSectors(),
        ]);
        setStages(stagesData);
        setSectors(sectorsData);
      } catch (err) {
        console.error("Failed to load lookups:", err);
      }
    }
    loadLookups();
  }, []);

  // Fetch grants
  const fetchGrants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: GrantsListParams = {
        page: currentPage,
        size: 12,
      };

      if (search) params.q = search;
      if (issuingBodyType) params.issuingBodyType = issuingBodyType as GrantsListParams["issuingBodyType"];
      if (grantType) params.type = grantType as GrantsListParams["type"];
      if (stageId) params.stageId = stageId;
      if (sectorId) params.sectorId = sectorId;
      if (amountBand) params.amountBand = amountBand;
      if (deadline) params.deadline = deadline;
      if (includeExpired) params.includeExpired = true;
      if (aiEnabled && isOnboarded) params.ai = true;

      const response = await getGrants(params);
      setGrants(response.content);
      setPage(response.page);
      // Track if AI was actually applied (some grants might have aiApplied field)
      setAiApplied(response.content.some(g => g.aiApplied === true));
    } catch (err) {
      setError("Failed to load grants. Please try again.");
      console.error("Failed to fetch grants:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, issuingBodyType, grantType, stageId, sectorId, amountBand, deadline, includeExpired, aiEnabled, isOnboarded]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (issuingBodyType) params.set("issuingBodyType", issuingBodyType);
    if (grantType) params.set("type", grantType);
    if (stageId) params.set("stageId", stageId);
    if (sectorId) params.set("sectorId", sectorId);
    if (amountBand) params.set("amountBand", amountBand);
    if (deadline) params.set("deadline", deadline);
    if (includeExpired) params.set("includeExpired", "true");
    if (aiEnabled) params.set("ai", "true");
    if (currentPage > 0) params.set("page", String(currentPage));

    const queryString = params.toString();
    router.push(`/grants${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router, search, issuingBodyType, grantType, stageId, sectorId, amountBand, deadline, includeExpired, aiEnabled, currentPage]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchGrants();
  };

  // Handle filter change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(0);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setIssuingBodyType("");
    setGrantType("");
    setStageId("");
    setSectorId("");
    setAmountBand("");
    setDeadline("");
    setIncludeExpired(false);
    setAiEnabled(false);
    setCurrentPage(0);
  };

  const hasActiveFilters = search || issuingBodyType || grantType || stageId || sectorId || amountBand || deadline || includeExpired || aiEnabled;

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      {/* Header */}
      <section className="mb-8">
        <p className="mono-label text-gold-dark flex items-center gap-2 mb-4">
          <span className="w-[7px] h-[7px] rounded-full bg-gold" />
          FUNDING OPPORTUNITIES
        </p>
        <h1 className="font-serif font-bold text-[clamp(34px,4vw,49px)] leading-[1.05] tracking-[-0.06em] mb-4">
          Grants & Schemes
        </h1>
        <p className="max-w-[520px] text-muted leading-[1.75] text-[15px]">
          Discover government grants, subsidies, and schemes to fund your startup journey.
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
              placeholder="Search grants..."
              className="w-full h-11 pl-10 pr-4 bg-paper-light border border-line text-ink placeholder:text-placeholder text-sm focus:outline-none focus:border-gold transition-colors"
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
                  // Persist to localStorage
                  if (typeof window !== "undefined") {
                    localStorage.setItem("ai-ranking-enabled", String(enabled));
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-line peer-checked:bg-gold transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
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
          value={issuingBodyType}
          onChange={(v) => handleFilterChange(setIssuingBodyType, v)}
          options={ISSUING_BODY_TYPES}
          label="Source"
        />
        <FilterSelect
          value={grantType}
          onChange={(v) => handleFilterChange(setGrantType, v)}
          options={GRANT_TYPES}
          label="Type"
        />
        <FilterSelect
          value={stageId}
          onChange={(v) => handleFilterChange(setStageId, v)}
          options={[
            { value: "", label: "All Stages" },
            ...stages.map((s) => ({ value: s.id!, label: s.name! })),
          ]}
          label="Stage"
        />
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
          value={amountBand}
          onChange={(v) => handleFilterChange(setAmountBand, v)}
          options={AMOUNT_BANDS}
          label="Amount"
        />
        <FilterSelect
          value={deadline}
          onChange={(v) => handleFilterChange(setDeadline, v)}
          options={DEADLINE_OPTIONS}
          label="Deadline"
        />

        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted">
          <input
            type="checkbox"
            checked={includeExpired}
            onChange={(e) => {
              setIncludeExpired(e.target.checked);
              setCurrentPage(0);
            }}
            className="w-4 h-4 border border-line bg-paper-light checked:bg-gold checked:border-gold focus:ring-gold"
          />
          Include expired
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-gold-dark hover:text-gold-hover underline underline-offset-2"
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
              Showing <span className="font-semibold text-ink">{grants.length}</span> of{" "}
              <span className="font-semibold text-ink">{page.totalElements}</span> grants
              {aiEnabled && aiApplied && (
                <span className="ml-2 text-gold-dark">• AI ranked for you</span>
              )}
              {aiEnabled && !aiApplied && grants.length > 0 && (
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

      {/* Grants grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <GrantCardSkeleton key={i} />
          ))}
        </div>
      ) : grants.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted text-lg mb-2">No grants found</p>
          <p className="text-sm text-placeholder">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {grants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page.totalPages ?? 0) > 1 && (
        <section className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm border border-line bg-paper-light hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(page.totalPages ?? 0, 5) }, (_, i) => {
              // Show pages around current page
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
                      ? "bg-gold text-white border-gold"
                      : "border-line bg-paper-light hover:bg-gold-light"
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
            className="px-4 py-2 text-sm border border-line bg-paper-light hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      className="h-10 px-3 pr-8 bg-paper-light border border-line text-ink text-sm focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
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
