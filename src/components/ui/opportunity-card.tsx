"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import type { GrantWithAi, ChallengeWithAi } from "@/lib/api/types";

type OpportunityType = "grant" | "challenge";

interface OpportunityCardProps {
  type: OpportunityType;
  data: GrantWithAi | ChallengeWithAi;
  showAiReason?: boolean;
}

function isGrant(data: GrantWithAi | ChallengeWithAi): data is GrantWithAi {
  return "issuingBody" in data;
}

function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return "Rolling";
  const date = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days left`;
  
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function isExpired(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export function OpportunityCard({ type, data, showAiReason = false }: OpportunityCardProps) {
  const grant = isGrant(data) ? data : null;
  const challenge = !isGrant(data) ? data : null;
  
  const id = data.id;
  const deadline = data.deadline;
  const expired = isExpired(deadline);
  
  // Type-specific fields
  const title = grant?.name || challenge?.title || "";
  const summary = grant?.summary || challenge?.problemStatement || "";
  const organization = grant?.issuingBody || challenge?.corporateName || "";
  const amount = grant?.amountDisplay;
  
  // Challenge-specific fields
  const challengeStatus = challenge?.status;
  const isClosed = challengeStatus === "CLOSED" || expired;
  
  const href = type === "grant" ? `/grants/${id}` : `/challenges/${id}`;
  
  const badgeColors = {
    grant: "bg-gold-light text-gold-dark",
    challenge: "bg-sky-100 text-sky-700",
  };

  return (
    <article 
      className={`group bg-paper-light border border-line p-5 flex flex-col h-full transition-all hover:shadow-md hover:-translate-y-0.5 ${isClosed ? "opacity-60" : ""}`}
    >
      {/* Header: Badge + Bookmark */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 ${badgeColors[type]}`}>
          {type === "grant" ? "Grant" : "Challenge"}
        </span>
        <BookmarkButton
          item={{
            id: id!,
            type: type,
            name: title,
          }}
        />
      </div>

      {/* Organization */}
      <p className="text-xs text-muted mb-1 truncate">{organization}</p>

      {/* Title */}
      <h3 className="font-semibold text-ink text-[15px] leading-snug mb-2 line-clamp-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2 flex-1">
        {summary}
      </p>

      {/* Meta: Amount + Deadline */}
      <div className="flex items-center gap-4 text-xs text-muted mb-4">
        {type === "grant" && amount && (
          <span className="flex items-center gap-1">
            <Icon name="currency" className="size-3.5" />
            {amount}
          </span>
        )}
        <span className={`flex items-center gap-1 ${expired ? "text-rose-dark" : ""}`}>
          <Icon name="calendar" className="size-3.5" />
          {formatDeadline(deadline)}
        </span>
        {isClosed && (
          <span className="text-rose-dark font-medium">Closed</span>
        )}
      </div>

      {/* AI Reason */}
      {showAiReason && data.aiReason && (
        <div className="flex items-start gap-2 text-xs text-muted bg-gold-light/50 px-3 py-2 mb-4 -mx-1">
          <Icon name="sparkles" className="size-3.5 text-gold-dark shrink-0 mt-0.5" />
          <span>{data.aiReason}</span>
        </div>
      )}

      {/* CTA */}
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium border border-ink text-ink hover:bg-ink hover:text-paper-light transition-colors"
      >
        View opportunity
        <Icon name="arrow-right" className="size-4" />
      </Link>
    </article>
  );
}
