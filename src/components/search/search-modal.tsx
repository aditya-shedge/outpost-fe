"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGrants } from "@/lib/api/grants";
import { getChallenges } from "@/lib/api/challenges";
import { getMentors } from "@/lib/api/mentors";
import type { GrantWithAi, ChallengeWithAi, MentorWithAi } from "@/lib/api/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResults {
  grants: GrantWithAi[];
  challenges: ChallengeWithAi[];
  mentors: MentorWithAi[];
}

const RECENT_SEARCHES_KEY = "outpost_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    grants: [],
    challenges: [],
    mentors: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setQuery("");
      setResults({ grants: [], challenges: [], mentors: [] });
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Search as user types (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults({ grants: [], challenges: [], mentors: [] });
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [grantsRes, challengesRes, mentorsRes] = await Promise.all([
          getGrants({ q: query, size: 3 }),
          getChallenges({ q: query, size: 3 }),
          getMentors({ q: query, size: 3 }),
        ]);
        setResults({
          grants: grantsRes.content,
          challenges: challengesRes.content,
          mentors: mentorsRes.content,
        });
      } catch {
        // Silently fail - user can still navigate to full search
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Save to recent searches
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    const updated = [
      trimmed,
      ...recentSearches.filter((s) => s !== trimmed),
    ].slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  // Handle full search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  // Navigate to result
  const handleResultClick = (href: string) => {
    if (query.trim()) {
      saveRecentSearch(query);
    }
    router.push(href);
    onClose();
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Build flat list of all results for keyboard navigation
  const allResults = [
    ...results.grants.map((g) => ({ type: "grant" as const, id: g.id, href: `/grants/${g.id}` })),
    ...results.challenges.map((c) => ({ type: "challenge" as const, id: c.id, href: `/challenges/${c.id}` })),
    ...results.mentors.map((m) => ({ type: "mentor" as const, id: m.id, href: `/mentors/${m.id}` })),
  ];

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex].href);
    }
  };

  const totalResults =
    results.grants.length + results.challenges.length + results.mentors.length;
  const hasResults = totalResults > 0;
  const showRecentSearches = !query.trim() && recentSearches.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="bg-white border border-line shadow-xl">
          {/* Search input */}
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
              <SearchIcon className="w-5 h-5 text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search grants, challenges, mentors..."
                className="flex-1 text-base text-ink placeholder:text-muted outline-none bg-transparent"
                autoComplete="off"
              />
              {isLoading && (
                <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              )}
              <kbd className="hidden md:inline-flex px-2 py-0.5 text-xs font-mono text-muted bg-paper border border-line">
                ESC
              </kbd>
            </div>
          </form>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Recent searches */}
            {showRecentSearches && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted">
                    Recent Searches
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-muted hover:text-ink"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentSearchClick(search)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-ink hover:bg-paper transition-colors text-left"
                    >
                      <ClockIcon className="w-4 h-4 text-muted" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {query.trim() && !isLoading && !hasResults && (
              <div className="p-8 text-center">
                <p className="text-muted">No results found for &quot;{query}&quot;</p>
                <p className="text-sm text-muted mt-1">
                  Try a different search term or{" "}
                  <button
                    onClick={handleSearch}
                    className="text-gold hover:underline"
                  >
                    view all results
                  </button>
                </p>
              </div>
            )}

            {/* Grants */}
            {results.grants.length > 0 && (
              <div className="p-4 border-b border-line">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  Grants
                </span>
                <div className="mt-2 space-y-1">
                  {results.grants.map((grant, i) => {
                    const flatIndex = i;
                    return (
                      <button
                        key={grant.id}
                        onClick={() => handleResultClick(`/grants/${grant.id}`)}
                        className={`flex items-start gap-3 w-full p-2 text-left transition-colors ${
                          selectedIndex === flatIndex
                            ? "bg-paper-light"
                            : "hover:bg-paper"
                        }`}
                      >
                        <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-amber-100 text-amber-700">
                          Grant
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {grant.name}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {grant.issuingBody}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Challenges */}
            {results.challenges.length > 0 && (
              <div className="p-4 border-b border-line">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  Challenges
                </span>
                <div className="mt-2 space-y-1">
                  {results.challenges.map((challenge, i) => {
                    const flatIndex = results.grants.length + i;
                    return (
                      <button
                        key={challenge.id}
                        onClick={() =>
                          handleResultClick(`/challenges/${challenge.id}`)
                        }
                        className={`flex items-start gap-3 w-full p-2 text-left transition-colors ${
                          selectedIndex === flatIndex
                            ? "bg-paper-light"
                            : "hover:bg-paper"
                        }`}
                      >
                        <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-blue-100 text-blue-700">
                          Challenge
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {challenge.title}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {challenge.corporateName}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mentors */}
            {results.mentors.length > 0 && (
              <div className="p-4">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  Mentors
                </span>
                <div className="mt-2 space-y-1">
                  {results.mentors.map((mentor, i) => {
                    const flatIndex =
                      results.grants.length + results.challenges.length + i;
                    return (
                      <button
                        key={mentor.id}
                        onClick={() =>
                          handleResultClick(`/mentors/${mentor.id}`)
                        }
                        className={`flex items-start gap-3 w-full p-2 text-left transition-colors ${
                          selectedIndex === flatIndex
                            ? "bg-paper-light"
                            : "hover:bg-paper"
                        }`}
                      >
                        <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-green/10 text-green">
                          Mentor
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {mentor.name}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {mentor.headline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View all results */}
            {hasResults && (
              <div className="p-4 border-t border-line">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => {
                    saveRecentSearch(query);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gold hover:underline"
                >
                  View all {totalResults} results
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Icons
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

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
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
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default SearchModal;
