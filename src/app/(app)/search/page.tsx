"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getGrants } from "@/lib/api/grants";
import { getChallenges } from "@/lib/api/challenges";
import { getMentors } from "@/lib/api/mentors";
import { GrantCard } from "@/components/ui/grant-card";
import { ChallengeCard } from "@/components/ui/challenge-card";
import { MentorCard } from "@/components/ui/mentor-card";
import { Skeleton } from "@/components/ui";
import type { GrantWithAi, ChallengeWithAi, MentorWithAi } from "@/lib/api/types";

type TabType = "all" | "grants" | "challenges" | "mentors";

interface SearchResults {
  grants: GrantWithAi[];
  challenges: ChallengeWithAi[];
  mentors: MentorWithAi[];
  counts: {
    grants: number;
    challenges: number;
    mentors: number;
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [results, setResults] = useState<SearchResults>({
    grants: [],
    challenges: [],
    mentors: [],
    counts: { grants: 0, challenges: 0, mentors: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch results when query changes
  useEffect(() => {
    async function fetchResults() {
      if (!query.trim()) {
        setResults({
          grants: [],
          challenges: [],
          mentors: [],
          counts: { grants: 0, challenges: 0, mentors: 0 },
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [grantsRes, challengesRes, mentorsRes] = await Promise.all([
          getGrants({ q: query, size: 12 }),
          getChallenges({ q: query, size: 12 }),
          getMentors({ q: query, size: 12 }),
        ]);

        setResults({
          grants: grantsRes.content,
          challenges: challengesRes.content,
          mentors: mentorsRes.content,
          counts: {
            grants: grantsRes.page.totalElements ?? 0,
            challenges: challengesRes.page.totalElements ?? 0,
            mentors: mentorsRes.page.totalElements ?? 0,
          },
        });
      } catch {
        // Handle error silently - show empty state
        setResults({
          grants: [],
          challenges: [],
          mentors: [],
          counts: { grants: 0, challenges: 0, mentors: 0 },
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  const totalResults =
    results.counts.grants +
    results.counts.challenges +
    results.counts.mentors;

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalResults },
    { id: "grants", label: "Grants", count: results.counts.grants },
    { id: "challenges", label: "Challenges", count: results.counts.challenges },
    { id: "mentors", label: "Mentors", count: results.counts.mentors },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Search Results</h1>
          {query && (
            <p className="text-muted">
              {isLoading
                ? "Searching..."
                : `${totalResults} results for "${query}"`}
            </p>
          )}
        </div>

        {/* No query state */}
        {!query && (
          <div className="text-center py-16">
            <SearchIcon className="w-12 h-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-ink mb-2">
              Start searching
            </h2>
            <p className="text-muted">
              Enter a search term to find grants, challenges, and mentors.
            </p>
          </div>
        )}

        {/* Tabs */}
        {query && (
          <div className="border-b border-line mb-8">
            <nav className="flex gap-6" aria-label="Search result categories">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                      activeTab === tab.id
                        ? "bg-gold text-white"
                        : "bg-paper-light text-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Loading state */}
        {query && isLoading && (
          <div className="space-y-8">
            <SearchSectionSkeleton title="Grants" count={3} />
            <SearchSectionSkeleton title="Challenges" count={3} />
            <SearchSectionSkeleton title="Mentors" count={3} />
          </div>
        )}

        {/* Results */}
        {query && !isLoading && (
          <>
            {/* No results */}
            {totalResults === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-paper-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-muted" />
                </div>
                <h2 className="text-xl font-semibold text-ink mb-2">
                  No results found
                </h2>
                <p className="text-muted mb-6">
                  We couldn&apos;t find anything matching &quot;{query}&quot;.
                </p>
                <p className="text-sm text-muted">Try:</p>
                <ul className="text-sm text-muted mt-2 space-y-1">
                  <li>• Using different keywords</li>
                  <li>• Checking your spelling</li>
                  <li>• Using more general terms</li>
                </ul>
              </div>
            )}

            {/* All tab */}
            {activeTab === "all" && totalResults > 0 && (
              <div className="space-y-12">
                {/* Grants section */}
                {results.grants.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-ink">
                        Grants
                        <span className="ml-2 text-sm font-normal text-muted">
                          ({results.counts.grants})
                        </span>
                      </h2>
                      {results.counts.grants > 3 && (
                        <button
                          onClick={() => setActiveTab("grants")}
                          className="text-sm text-gold hover:underline"
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {results.grants.slice(0, 3).map((grant) => (
                        <Link key={grant.id} href={`/grants/${grant.id}`}>
                          <GrantCard grant={grant} />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Challenges section */}
                {results.challenges.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-ink">
                        Challenges
                        <span className="ml-2 text-sm font-normal text-muted">
                          ({results.counts.challenges})
                        </span>
                      </h2>
                      {results.counts.challenges > 3 && (
                        <button
                          onClick={() => setActiveTab("challenges")}
                          className="text-sm text-gold hover:underline"
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {results.challenges.slice(0, 3).map((challenge) => (
                        <Link
                          key={challenge.id}
                          href={`/challenges/${challenge.id}`}
                        >
                          <ChallengeCard challenge={challenge} />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Mentors section */}
                {results.mentors.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-ink">
                        Mentors
                        <span className="ml-2 text-sm font-normal text-muted">
                          ({results.counts.mentors})
                        </span>
                      </h2>
                      {results.counts.mentors > 3 && (
                        <button
                          onClick={() => setActiveTab("mentors")}
                          className="text-sm text-gold hover:underline"
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {results.mentors.slice(0, 3).map((mentor) => (
                        <Link key={mentor.id} href={`/mentors/${mentor.id}`}>
                          <MentorCard mentor={mentor} />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Grants tab */}
            {activeTab === "grants" && (
              <section>
                {results.grants.length === 0 ? (
                  <EmptyTabState type="grants" query={query} />
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.grants.map((grant) => (
                      <Link key={grant.id} href={`/grants/${grant.id}`}>
                        <GrantCard grant={grant} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Challenges tab */}
            {activeTab === "challenges" && (
              <section>
                {results.challenges.length === 0 ? (
                  <EmptyTabState type="challenges" query={query} />
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.challenges.map((challenge) => (
                      <Link
                        key={challenge.id}
                        href={`/challenges/${challenge.id}`}
                      >
                        <ChallengeCard challenge={challenge} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Mentors tab */}
            {activeTab === "mentors" && (
              <section>
                {results.mentors.length === 0 ? (
                  <EmptyTabState type="mentors" query={query} />
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {results.mentors.map((mentor) => (
                      <Link key={mentor.id} href={`/mentors/${mentor.id}`}>
                        <MentorCard mentor={mentor} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyTabState({
  type,
  query,
}: {
  type: "grants" | "challenges" | "mentors";
  query: string;
}) {
  return (
    <div className="text-center py-12">
      <p className="text-muted">
        No {type} found matching &quot;{query}&quot;
      </p>
    </div>
  );
}

function SearchSectionSkeleton({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink mb-4">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white border border-line p-6">
            <Skeleton className="h-4 w-16 mb-3" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
            <Skeleton className="h-10 w-48 mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-line p-6">
                  <Skeleton className="h-4 w-16 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
