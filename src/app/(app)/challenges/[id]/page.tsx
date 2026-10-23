"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { getChallengeById } from "@/lib/api/challenges";
import { Icon, LoadingSpinner } from "@/components/ui";
import type { ChallengeResponse } from "@/lib/api/types";

function formatDeadline(deadline: string | undefined): string | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChallengeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChallenge() {
      try {
        const data = await getChallengeById(id);
        setChallenge(data);
      } catch (err) {
        console.error("Failed to load challenge:", err);
        setError("Challenge not found or unavailable.");
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenge();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto py-12 px-7">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-[900px] mx-auto py-12 px-7">
        <div className="text-center py-16">
          <p className="text-xl text-muted mb-4">{error || "Challenge not found"}</p>
          <Link
            href="/challenges"
            className="text-blue-dark hover:text-blue underline underline-offset-2"
          >
            ← Back to challenges
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = challenge.status === "CLOSED";

  return (
    <div className="max-w-[900px] mx-auto py-12 px-7">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/challenges" className="hover:text-ink transition-colors">
          Challenges
        </Link>
        <Icon name="chevron-right" className="size-4" />
        <span className="text-ink truncate max-w-[300px]">{challenge.title}</span>
      </nav>

      {/* Closed banner */}
      {isClosed && (
        <div className="mb-6 p-4 bg-muted/10 border border-muted/30 text-muted">
          <p className="font-medium">This challenge is closed</p>
          <p className="text-sm">Applications are no longer being accepted.</p>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          {challenge.corporateLogoUrl ? (
            <img
              src={challenge.corporateLogoUrl}
              alt={`${challenge.corporateName} logo`}
              className="w-16 h-16 object-contain bg-white border border-line p-2 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-light border border-line flex items-center justify-center text-blue-dark font-bold text-xl shrink-0">
              {challenge.corporateName?.charAt(0) || "C"}
            </div>
          )}
          
          <div className="flex-1">
            <p className="text-sm text-muted mb-1">{challenge.corporateName}</p>
            <h1 className="font-serif font-bold text-[clamp(28px,3.5vw,40px)] leading-[1.1] tracking-[-0.04em]">
              {challenge.title}
            </h1>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-sm font-medium ${
              isClosed
                ? "bg-muted/10 text-muted"
                : "bg-green-light text-green-dark"
            }`}
          >
            {isClosed ? "Closed" : "Open for applications"}
          </span>
          {challenge.offerType && (
            <span className="px-3 py-1 text-sm font-medium bg-blue-light text-blue-dark">
              {challenge.offerType}
            </span>
          )}
        </div>
      </header>

      {/* Key info cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="p-4 bg-paper-light border border-line">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Sector</p>
          <p className="font-medium text-ink">{challenge.sectorName || "Any"}</p>
        </div>
        <div className="p-4 bg-paper-light border border-line">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Theme</p>
          <p className="font-medium text-ink">{challenge.theme || "General"}</p>
        </div>
        <div className="p-4 bg-paper-light border border-line">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Deadline</p>
          <p className={`font-medium ${isClosed ? "text-muted line-through" : "text-ink"}`}>
            {challenge.deadline ? formatDeadline(challenge.deadline) : "Rolling"}
          </p>
        </div>
        <div className="p-4 bg-paper-light border border-line">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Opportunity</p>
          <p className="font-medium text-ink">{challenge.offerType || "Open"}</p>
        </div>
      </section>

      {/* Content - only show full details if hasDetail is true */}
      {challenge.hasDetail ? (
        <div className="space-y-8 mb-10">
          {/* Problem Statement */}
          {challenge.problemStatement && (
            <section>
              <h2 className="font-serif font-bold text-xl mb-3 text-ink">Problem Statement</h2>
              <div className="prose prose-sm max-w-none text-ink/90 leading-relaxed whitespace-pre-wrap">
                {challenge.problemStatement}
              </div>
            </section>
          )}

          {/* What They're Looking For */}
          {challenge.lookingFor && (
            <section>
              <h2 className="font-serif font-bold text-xl mb-3 text-ink">What They&apos;re Looking For</h2>
              <div className="prose prose-sm max-w-none text-ink/90 leading-relaxed whitespace-pre-wrap">
                {challenge.lookingFor}
              </div>
            </section>
          )}

          {/* Eligibility */}
          {challenge.eligibility && (
            <section>
              <h2 className="font-serif font-bold text-xl mb-3 text-ink">Eligibility</h2>
              <div className="prose prose-sm max-w-none text-ink/90 leading-relaxed whitespace-pre-wrap">
                {challenge.eligibility}
              </div>
            </section>
          )}

          {/* Timeline */}
          {challenge.timeline && (
            <section>
              <h2 className="font-serif font-bold text-xl mb-3 text-ink">Timeline</h2>
              <div className="prose prose-sm max-w-none text-ink/90 leading-relaxed whitespace-pre-wrap">
                {challenge.timeline}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="mb-10 p-6 bg-paper-light border border-line">
          <p className="text-muted text-center">
            Limited details are available for this challenge. Click the button below to learn more and apply.
          </p>
        </div>
      )}

      {/* CTA */}
      <section className="flex items-center gap-4 pt-6 border-t border-line">
        {challenge.applyUrl && (
          <a
            href={challenge.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              isClosed
                ? "bg-muted/20 text-muted cursor-not-allowed pointer-events-none"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
            aria-disabled={isClosed}
          >
            {isClosed ? "Applications Closed" : "Apply Now"}
            {!isClosed && <Icon name="arrow" className="size-4" />}
          </a>
        )}

        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 px-4 py-3 text-sm text-muted hover:text-ink transition-colors"
        >
          <Icon name="chevron-left" className="size-4" />
          Back to challenges
        </Link>
      </section>
    </div>
  );
}
