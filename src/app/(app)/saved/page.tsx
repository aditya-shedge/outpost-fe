"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSavedItems, SavedItem } from "@/lib/saved/context";
import { getGrantById } from "@/lib/api/grants";
import { getChallengeById } from "@/lib/api/challenges";
import { GrantCard } from "@/components/ui/grant-card";
import { ChallengeCard } from "@/components/ui/challenge-card";
import { Skeleton, Button } from "@/components/ui";
import type { GrantWithAi, ChallengeWithAi } from "@/lib/api/types";

type FilterType = "all" | "grants" | "challenges";

interface LoadedGrant {
  type: "grant";
  data: GrantWithAi;
  savedAt: string;
}

interface LoadedChallenge {
  type: "challenge";
  data: ChallengeWithAi;
  savedAt: string;
}

type LoadedItem = LoadedGrant | LoadedChallenge;

export default function SavedPage() {
  const { savedItems, clearAll } = useSavedItems();
  const [filter, setFilter] = useState<FilterType>("all");
  const [loadedItems, setLoadedItems] = useState<LoadedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  // Load full details for saved items
  useEffect(() => {
    async function loadItems() {
      if (savedItems.length === 0) {
        setLoadedItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const loaded: LoadedItem[] = [];
      const failed = new Set<string>();

      await Promise.all(
        savedItems.map(async (item: SavedItem) => {
          try {
            if (item.type === "grant") {
              const grant = await getGrantById(item.id);
              loaded.push({ type: "grant", data: grant, savedAt: item.savedAt });
            } else {
              const challenge = await getChallengeById(item.id);
              loaded.push({
                type: "challenge",
                data: challenge,
                savedAt: item.savedAt,
              });
            }
          } catch {
            // Item might have been deleted or is unavailable
            failed.add(item.id);
          }
        })
      );

      // Sort by saved date (most recent first)
      loaded.sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );

      setLoadedItems(loaded);
      setFailedIds(failed);
      setIsLoading(false);
    }

    loadItems();
  }, [savedItems]);

  const filteredItems = loadedItems.filter((item) => {
    if (filter === "all") return true;
    if (filter === "grants") return item.type === "grant";
    if (filter === "challenges") return item.type === "challenge";
    return true;
  });

  const grantsCount = loadedItems.filter((i) => i.type === "grant").length;
  const challengesCount = loadedItems.filter(
    (i) => i.type === "challenge"
  ).length;

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Saved Items</h1>
            <p className="text-muted">
              {savedItems.length === 0
                ? "Save grants and challenges to access them later"
                : `${savedItems.length} item${savedItems.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>

          {savedItems.length > 0 && (
            <Button variant="secondary" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        {savedItems.length > 0 && (
          <div className="border-b border-line mb-8">
            <nav className="flex gap-6" aria-label="Saved items filter">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
                count={loadedItems.length}
              >
                All
              </FilterButton>
              <FilterButton
                active={filter === "grants"}
                onClick={() => setFilter("grants")}
                count={grantsCount}
              >
                Grants
              </FilterButton>
              <FilterButton
                active={filter === "challenges"}
                onClick={() => setFilter("challenges")}
                count={challengesCount}
              >
                Challenges
              </FilterButton>
            </nav>
          </div>
        )}

        {/* Loading state */}
        {isLoading && savedItems.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: Math.min(savedItems.length, 6) }).map(
              (_, i) => (
                <div key={i} className="bg-paper-light border border-line p-6">
                  <Skeleton className="h-4 w-16 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && savedItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-paper-light rounded-full flex items-center justify-center mx-auto mb-4">
              <BookmarkIcon className="w-8 h-8 text-muted" />
            </div>
            <h2 className="text-xl font-semibold text-ink mb-2">
              No saved items yet
            </h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Browse grants and challenges and click the bookmark icon to save
              them for later.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/grants">
                <Button>Browse Grants</Button>
              </Link>
              <Link href="/challenges">
                <Button variant="secondary">Browse Challenges</Button>
              </Link>
            </div>
          </div>
        )}

        {/* No results for filter */}
        {!isLoading && savedItems.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">
              No {filter === "grants" ? "grants" : "challenges"} saved yet
            </p>
          </div>
        )}

        {/* Items grid */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div key={`${item.type}-${item.data.id}`}>
                {item.type === "grant" ? (
                  <Link href={`/grants/${item.data.id}`}>
                    <GrantCard grant={item.data} showAiReason={false} />
                  </Link>
                ) : (
                  <Link href={`/challenges/${item.data.id}`}>
                    <ChallengeCard challenge={item.data} showAiReason={false} />
                  </Link>
                )}
                <p className="mt-2 text-xs text-muted">
                  Saved {formatSavedDate(item.savedAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Failed items notice */}
        {!isLoading && failedIds.size > 0 && (
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {failedIds.size} saved item{failedIds.size !== 1 ? "s" : ""} could
            not be loaded. They may have been removed or are no longer available.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  count,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-medium transition-colors relative ${
        active ? "text-ink" : "text-muted hover:text-ink"
      }`}
    >
      {children}
      <span
        className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
          active ? "bg-gold text-white" : "bg-paper-light text-muted"
        }`}
      >
        {count}
      </span>
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
      )}
    </button>
  );
}

function formatSavedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookmarkIcon({ className }: { className?: string }) {
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
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
