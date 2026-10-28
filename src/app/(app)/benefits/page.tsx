"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getBenefits, getFeaturedPartners, getPartners } from "@/lib/api/benefits";
import type { Benefit, Partner, BenefitCategory } from "@/lib/api/benefits";
import { Icon, Select, Input, EmptyState, PageLoader } from "@/components/ui";
import { BenefitCard, BenefitCardSkeleton } from "@/components/ui/benefit-card";

const CATEGORIES: { value: BenefitCategory | ""; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "CLOUD", label: "Cloud" },
  { value: "DEV_TOOLS", label: "Dev Tools" },
  { value: "BUSINESS_TOOLS", label: "Business Tools" },
  { value: "SERVICES", label: "Services" },
];

export default function BenefitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state from URL
  const categoryParam = searchParams.get("category") as BenefitCategory | null;
  const partnerParam = searchParams.get("partner");
  const searchParam = searchParams.get("q") || "";
  const showExpiredParam = searchParams.get("showExpired") === "true";
  const aiParam = searchParams.get("ai") === "true";
  const pageParam = parseInt(searchParams.get("page") || "0", 10);

  // Data state
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [featuredPartners, setFeaturedPartners] = useState<Partner[]>([]);
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);

  // Local filter state
  const [searchQuery, setSearchQuery] = useState(searchParam);

  // Update URL with filters
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "false") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 0 when filters change (except for page itself)
      if (!("page" in updates)) {
        params.delete("page");
      }

      router.push(`/benefits?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch featured partners
  useEffect(() => {
    const fetchPartners = async () => {
      const [featured, all] = await Promise.all([getFeaturedPartners(), getPartners()]);
      setFeaturedPartners(featured);
      setAllPartners(all);
      setIsLoadingPartners(false);
    };
    fetchPartners();
  }, []);

  // Fetch benefits
  useEffect(() => {
    const fetchBenefits = async () => {
      setIsLoading(true);
      try {
        const response = await getBenefits({
          page: pageParam,
          size: 12,
          q: searchParam || undefined,
          category: categoryParam || undefined,
          partnerId: partnerParam || undefined,
          includeExpired: showExpiredParam,
          ai: aiParam,
        });
        setBenefits(response.content);
        setTotalPages(response.page?.totalPages || 0);
        setTotalElements(response.page?.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch benefits:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBenefits();
  }, [pageParam, searchParam, categoryParam, partnerParam, showExpiredParam, aiParam]);

  // Search submit handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchQuery });
  };

  if (isLoading && benefits.length === 0 && isLoadingPartners) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      {/* Header */}
      <div className="mb-8">
        <p className="mono-label text-gold-dark flex items-center gap-2 mb-2">
          <Icon name="gift" className="size-4" />
          PARTNER PERKS
        </p>
        <h1 className="font-serif font-bold text-3xl tracking-[-0.04em] text-ink mb-2">
          Exclusive Benefits
        </h1>
        <p className="text-muted max-w-lg">
          Access special offers and discounts from our partners, curated exclusively for T-Hub founders.
        </p>
      </div>

      {/* Featured Partners Section */}
      {!isLoadingPartners && featuredPartners.length > 0 && (
        <section className="mb-10">
          <h2 className="mono-label text-muted mb-4">FEATURED PARTNERS</h2>
          <div className="flex flex-wrap gap-4">
            {featuredPartners.map((partner) => (
              <button
                key={partner.id}
                onClick={() => updateFilters({ partner: partner.id || null })}
                className={`flex items-center gap-3 px-4 py-3 border transition-all ${
                  partnerParam === partner.id
                    ? "border-gold bg-gold-light"
                    : "border-line bg-paper-light hover:border-gold"
                }`}
              >
                {partner.logoUrl ? (
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name || "Partner"}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-gold-light flex items-center justify-center">
                    <span className="text-sm font-bold text-gold-dark">
                      {partner.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-ink">{partner.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
            <Input
              type="text"
              placeholder="Search benefits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Category Filter */}
        <Select
          value={categoryParam || ""}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="w-full md:w-48"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </Select>

        {/* Partner Filter */}
        {allPartners.length > 0 && (
          <Select
            value={partnerParam || ""}
            onChange={(e) => updateFilters({ partner: e.target.value })}
            className="w-full md:w-48"
          >
            <option value="">All partners</option>
            {allPartners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {/* Toggle Row */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        {/* AI Toggle */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={aiParam}
              onChange={(e) => updateFilters({ ai: e.target.checked ? "true" : null })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-line peer-checked:bg-gold rounded-full transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-ink">AI recommendations</span>
        </label>

        {/* Show Expired Toggle */}
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={showExpiredParam}
              onChange={(e) => updateFilters({ showExpired: e.target.checked ? "true" : null })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-line peer-checked:bg-gold rounded-full transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-ink">Show expired</span>
        </label>

        {/* Results count */}
        <span className="text-sm text-muted ml-auto">
          {totalElements} benefit{totalElements !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Benefits Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <BenefitCardSkeleton key={i} />
          ))}
        </div>
      ) : benefits.length === 0 ? (
        <EmptyState
          icon="gift"
          title="No benefits found"
          description={
            searchParam || categoryParam || partnerParam
              ? "Try adjusting your filters or search query."
              : "Check back soon for new partner offers."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => updateFilters({ page: String(pageParam - 1) })}
            disabled={pageParam === 0}
            className="px-4 py-2 text-sm border border-line hover:border-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted">
            Page {pageParam + 1} of {totalPages}
          </span>
          <button
            onClick={() => updateFilters({ page: String(pageParam + 1) })}
            disabled={pageParam >= totalPages - 1}
            className="px-4 py-2 text-sm border border-line hover:border-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
