"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { getBenefits, getFeaturedPartners } from "@/lib/api/benefits";
import type { Benefit, Partner, BenefitCategory } from "@/lib/api/benefits";
import { LoadingSpinner } from "@/components/ui";
import { BenefitCard, BenefitCardSkeleton } from "@/components/ui/benefit-card";

const CATEGORIES: readonly { value: BenefitCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "CLOUD", label: "Cloud" },
  { value: "DEV_TOOLS", label: "Dev Tools" },
  { value: "BUSINESS_TOOLS", label: "Business Tools" },
  { value: "SERVICES", label: "Services" },
];

export default function BenefitsPage() {
  return (
    <Suspense fallback={<BenefitsPageLoading />}>
      <BenefitsContent />
    </Suspense>
  );
}

function BenefitsPageLoading() {
  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}

function BenefitsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOnboarded } = useAuth();

  // Data state
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [page, setPage] = useState({
    number: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
  });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state (from URL)
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [partnerId, setPartnerId] = useState(searchParams.get("partner") || "");
  const [includeExpired, setIncludeExpired] = useState(searchParams.get("includeExpired") === "true");
  const [aiEnabled, setAiEnabled] = useState(() => {
    if (searchParams.get("ai") === "true") return true;
    if (typeof window !== "undefined") {
      return localStorage.getItem("ai-ranking-enabled") === "true";
    }
    return false;
  });
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 0);
  const [aiApplied, setAiApplied] = useState(false);

  // Load partners on mount
  useEffect(() => {
    async function loadPartners() {
      try {
        const data = await getFeaturedPartners();
        setPartners(data);
      } catch (err) {
        console.error("Failed to load partners:", err);
      }
    }
    loadPartners();
  }, []);

  // Fetch benefits
  const fetchBenefits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page: currentPage,
        size: 12,
      };

      if (search) params.q = search;
      if (category) params.category = category;
      if (partnerId) params.partnerId = partnerId;
      if (includeExpired) params.includeExpired = true;
      if (aiEnabled && isOnboarded) params.ai = true;

      const response = await getBenefits(params);
      setBenefits(response.content);
      setPage({
        number: response.page?.number || 0,
        size: response.page?.size || 12,
        totalElements: response.page?.totalElements || 0,
        totalPages: response.page?.totalPages || 0,
      });
      setAiApplied(response.content.some((b) => b.aiApplied === true));
    } catch (err) {
      setError("Failed to load benefits. Please try again.");
      console.error("Failed to fetch benefits:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, category, partnerId, includeExpired, aiEnabled, isOnboarded]);

  useEffect(() => {
    fetchBenefits();
  }, [fetchBenefits]);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (partnerId) params.set("partner", partnerId);
    if (includeExpired) params.set("includeExpired", "true");
    if (aiEnabled) params.set("ai", "true");
    if (currentPage > 0) params.set("page", String(currentPage));

    const queryString = params.toString();
    router.push(`/benefits${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [router, search, category, partnerId, includeExpired, aiEnabled, currentPage]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchBenefits();
  };

  // Handle filter change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(0);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setPartnerId("");
    setIncludeExpired(false);
    setAiEnabled(false);
    setCurrentPage(0);
  };

  const hasActiveFilters = search || category || partnerId || includeExpired || aiEnabled;

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      {/* Header */}
      <section className="mb-8">
        <p className="mono-label text-purple-dark flex items-center gap-2 mb-4">
          <span className="w-[7px] h-[7px] rounded-full bg-purple" />
          PARTNER PERKS
        </p>
        <h1 className="font-serif font-bold text-[clamp(34px,4vw,49px)] leading-[1.05] tracking-[-0.06em] mb-4">
          Exclusive Benefits
        </h1>
        <p className="max-w-[520px] text-muted leading-[1.75] text-[15px]">
          Access special offers and discounts from our partners, curated exclusively for T-Hub founders.
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
              placeholder="Search benefits..."
              className="w-full h-11 pl-10 pr-4 bg-paper-light border border-line text-ink placeholder:text-placeholder text-sm focus:outline-none focus:border-purple transition-colors"
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
              <div className="w-9 h-5 bg-line peer-checked:bg-purple transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
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
          value={category}
          onChange={(v) => handleFilterChange(setCategory, v)}
          options={CATEGORIES}
          label="Category"
        />
        {partners.length > 0 && (
          <FilterSelect
            value={partnerId}
            onChange={(v) => handleFilterChange(setPartnerId, v)}
            options={[
              { value: "", label: "All Partners" },
              ...partners.map((p) => ({ value: p.id!, label: p.name! })),
            ]}
            label="Partner"
          />
        )}

        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted">
          <input
            type="checkbox"
            checked={includeExpired}
            onChange={(e) => {
              setIncludeExpired(e.target.checked);
              setCurrentPage(0);
            }}
            className="w-4 h-4 border border-line bg-paper-light checked:bg-purple checked:border-purple focus:ring-purple"
          />
          Include expired
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-purple-dark hover:text-purple underline underline-offset-2"
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
              Showing <span className="font-semibold text-ink">{benefits.length}</span> of{" "}
              <span className="font-semibold text-ink">{page.totalElements}</span> benefits
              {aiEnabled && aiApplied && (
                <span className="ml-2 text-purple-dark">• AI ranked for you</span>
              )}
              {aiEnabled && !aiApplied && benefits.length > 0 && (
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

      {/* Benefits grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <BenefitCardSkeleton key={i} />
          ))}
        </div>
      ) : benefits.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted text-lg mb-2">No benefits found</p>
          <p className="text-sm text-placeholder">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {page.totalPages > 1 && (
        <section className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm border border-line bg-paper-light hover:bg-purple-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(page.totalPages, 5) }, (_, i) => {
              let pageNum = i;
              const totalPages = page.totalPages;
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
                      ? "bg-purple text-white border-purple"
                      : "border-line bg-paper-light hover:bg-purple-light"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(page.totalPages - 1, p + 1))}
            disabled={currentPage === page.totalPages - 1}
            className="px-4 py-2 text-sm border border-line bg-paper-light hover:bg-purple-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      className="h-10 px-3 pr-8 bg-paper-light border border-line text-ink text-sm focus:outline-none focus:border-purple transition-colors appearance-none cursor-pointer"
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
