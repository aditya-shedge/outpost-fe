"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import type { GrantWithAi } from "@/lib/api/types";

interface GrantCardProps {
  grant: GrantWithAi;
  showAiReason?: boolean;
}

function formatDeadline(deadline: string | undefined): string | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isExpiringSoon(grant: GrantWithAi): boolean {
  if (!grant.deadline || grant.expired) return false;
  const deadline = new Date(grant.deadline);
  const now = new Date();
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntil <= 14 && daysUntil > 0;
}

export function GrantCard({ grant, showAiReason = true }: GrantCardProps) {
  const expiringSoon = isExpiringSoon(grant);

  return (
    <Link
      href={`/grants/${grant.id}`}
      className={`group block p-5 bg-paper-light border border-line hover:border-gold hover:shadow-md hover:-translate-y-0.5 transition-all ${
        grant.expired ? "opacity-60" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="mono-label text-gold-dark mb-1">
            {grant.type}
          </p>
          <h3 className="font-serif font-bold text-lg leading-tight tracking-[-0.02em] group-hover:text-gold-dark transition-colors line-clamp-2">
            {grant.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {grant.expired && (
            <span className="px-2 py-0.5 text-xs font-medium bg-rose-light text-rose-dark">
              Expired
            </span>
          )}
          {expiringSoon && !grant.expired && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gold-light text-gold-dark">
              Ending soon
            </span>
          )}
          <BookmarkButton
            item={{
              id: grant.id!,
              type: "grant",
              name: grant.name || "Grant",
            }}
          />
        </div>
      </div>

      {/* Issuing body */}
      <p className="text-sm text-muted mb-3 truncate">
        {grant.issuingBody}
      </p>

      {/* Summary */}
      <p className="text-sm text-ink leading-relaxed line-clamp-3 mb-4">
        {grant.summary}
      </p>

      {/* AI Reason */}
      {showAiReason && grant.aiReason && (
        <div className="mb-4 p-3 bg-gold-light/50 border-l-2 border-gold">
          <p className="text-xs text-gold-dark font-medium mb-0.5 flex items-center gap-1">
            <Icon name="sparkles" className="size-3" />
            Why this is relevant
          </p>
          <p className="text-sm text-ink">{grant.aiReason}</p>
        </div>
      )}

      {/* Meta: Amount + Deadline */}
      <div className="flex flex-wrap gap-2 text-xs text-muted">
        {grant.amountDisplay && (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-light text-green-dark">
            <Icon name="currency" className="size-3" />
            {grant.amountDisplay}
          </span>
        )}
        {grant.deadline && (
          <span className={`flex items-center gap-1 px-2 py-1 ${grant.expired ? "bg-rose-light text-rose-dark" : "bg-paper"}`}>
            <Icon name="calendar" className="size-3" />
            {grant.deadline ? formatDeadline(grant.deadline) : "Rolling"}
          </span>
        )}
        {!grant.deadline && (
          <span className="flex items-center gap-1 px-2 py-1 bg-paper">
            <Icon name="calendar" className="size-3" />
            Rolling
          </span>
        )}
      </div>

      {/* Tags */}
      {((grant.stages?.length ?? 0) > 0 || (grant.sectors?.length ?? 0) > 0) && (
        <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-1.5">
          {grant.stages?.slice(0, 2).map((stage) => (
            <span key={stage} className="px-2 py-0.5 text-xs bg-paper border border-line text-muted">
              {stage}
            </span>
          ))}
          {grant.sectors?.slice(0, 2).map((sector) => (
            <span key={sector} className="px-2 py-0.5 text-xs bg-paper border border-line text-muted">
              {sector}
            </span>
          ))}
          {((grant.stages?.length ?? 0) > 2 || (grant.sectors?.length ?? 0) > 2) && (
            <span className="px-2 py-0.5 text-xs text-muted">
              +{Math.max(0, (grant.stages?.length ?? 0) - 2) + Math.max(0, (grant.sectors?.length ?? 0) - 2)} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// Skeleton loader for grant card
export function GrantCardSkeleton() {
  return (
    <div className="p-5 bg-paper-light border border-line animate-pulse">
      <div className="h-3 w-16 bg-line mb-2" />
      <div className="h-5 w-4/5 bg-line mb-3" />
      <div className="h-4 w-1/3 bg-line mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-line" />
        <div className="h-3 w-full bg-line" />
        <div className="h-3 w-2/3 bg-line" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-line" />
        <div className="h-6 w-24 bg-line" />
      </div>
    </div>
  );
}
