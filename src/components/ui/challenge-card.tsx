"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import type { ChallengeWithAi } from "@/lib/api/types";

interface ChallengeCardProps {
  challenge: ChallengeWithAi;
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

function isClosingSoon(challenge: ChallengeWithAi): boolean {
  if (!challenge.deadline || challenge.status === "CLOSED") return false;
  const deadline = new Date(challenge.deadline);
  const now = new Date();
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntil <= 14 && daysUntil > 0;
}

export function ChallengeCard({ challenge, showAiReason = true }: ChallengeCardProps) {
  const isClosed = challenge.status === "CLOSED";
  const closingSoon = isClosingSoon(challenge);

  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className={`group block p-5 bg-paper-light border border-line hover:border-blue hover:shadow-md hover:-translate-y-0.5 transition-all ${
        isClosed ? "opacity-60" : ""
      }`}
    >
      {/* Header: Logo + Corporate name */}
      <div className="flex items-start gap-3 mb-3">
        {challenge.corporateLogoUrl ? (
          <img
            src={challenge.corporateLogoUrl}
            alt={`${challenge.corporateName} logo`}
            className="w-10 h-10 object-contain bg-white border border-line p-1 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-light border border-line flex items-center justify-center text-blue-dark font-bold text-sm shrink-0">
            {challenge.corporateName?.charAt(0) || "C"}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted truncate mb-0.5">
            {challenge.corporateName}
          </p>
          <h3 className="font-serif font-bold text-lg leading-tight tracking-[-0.02em] group-hover:text-blue-dark transition-colors line-clamp-2">
            {challenge.title}
          </h3>
        </div>
      </div>

      {/* Status badge row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`px-2 py-0.5 text-xs font-medium ${
            isClosed
              ? "bg-muted/10 text-muted"
              : "bg-green-light text-green-dark"
          }`}
        >
          {isClosed ? "Closed" : "Open"}
        </span>

        <div className="flex items-center gap-2">
          {closingSoon && !isClosed && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gold-light text-gold-dark">
              Closing soon
            </span>
          )}
          {challenge.hasDetail && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-light text-blue-dark">
              Full details
            </span>
          )}
        </div>
      </div>

      {/* Meta: Sector + Theme */}
      <div className="flex flex-wrap gap-2 text-xs text-muted mb-3">
        {challenge.sectorName && (
          <span className="px-2 py-1 bg-paper border border-line">
            {challenge.sectorName}
          </span>
        )}
        {challenge.theme && (
          <span className="px-2 py-1 bg-paper border border-line">
            {challenge.theme}
          </span>
        )}
      </div>

      {/* AI Reason */}
      {showAiReason && challenge.aiReason && (
        <div className="mb-3 p-3 bg-blue-light/50 border-l-2 border-blue">
          <p className="text-xs text-blue-dark font-medium mb-0.5 flex items-center gap-1">
            <Icon name="sparkles" className="size-3" />
            Why this is relevant
          </p>
          <p className="text-sm text-ink">{challenge.aiReason}</p>
        </div>
      )}

      {/* Deadline */}
      <div className="flex items-center gap-1 text-xs text-muted">
        <Icon name="calendar" className="size-3" />
        {challenge.deadline ? (
          <span className={isClosed ? "line-through" : ""}>
            Deadline: {formatDeadline(challenge.deadline)}
          </span>
        ) : (
          <span>Rolling applications</span>
        )}
      </div>

      {/* Offer type */}
      {challenge.offerType && (
        <div className="mt-2 text-xs text-muted">
          <span className="text-ink font-medium">{challenge.offerType}</span> opportunity
        </div>
      )}
    </Link>
  );
}

// Skeleton loader for challenge card
export function ChallengeCardSkeleton() {
  return (
    <div className="p-5 bg-paper-light border border-line animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-line shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-24 bg-line mb-2" />
          <div className="h-5 w-4/5 bg-line" />
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-14 bg-line" />
        <div className="h-5 w-20 bg-line" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-24 bg-line" />
        <div className="h-6 w-20 bg-line" />
      </div>
      <div className="h-3 w-32 bg-line" />
    </div>
  );
}
