"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getGrantById } from "@/lib/api/grants";
import type { GrantDetailResponse } from "@/lib/api/types";

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [grant, setGrant] = useState<GrantDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGrant() {
      setIsLoading(true);
      setError(null);

      try {
        const id = params.id as string;
        const data = await getGrantById(id);
        setGrant(data);
      } catch (err) {
        console.error("Failed to load grant:", err);
        setError("Grant not found or failed to load.");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      loadGrant();
    }
  }, [params.id]);

  const formatDeadline = (deadline: string | undefined) => {
    if (!deadline) return "No deadline";
    const date = new Date(deadline);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUntilDeadline = () => {
    if (!grant?.deadline || grant.expired) return null;
    const deadline = new Date(grant.deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return null;
    return daysUntil;
  };

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto py-12 px-7">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-line mb-6" />
          <div className="h-10 w-3/4 bg-line mb-4" />
          <div className="h-5 w-1/3 bg-line mb-8" />
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="h-20 bg-line" />
            <div className="h-20 bg-line" />
            <div className="h-20 bg-line" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-line" />
            <div className="h-4 w-full bg-line" />
            <div className="h-4 w-2/3 bg-line" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !grant) {
    return (
      <div className="max-w-[900px] mx-auto py-12 px-7">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted hover:text-ink mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to grants
        </button>
        <div className="py-16 text-center">
          <p className="text-lg text-muted mb-2">{error || "Grant not found"}</p>
          <Link href="/grants" className="text-gold-dark hover:text-gold-hover underline">
            Browse all grants
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilDeadline = getDaysUntilDeadline();

  return (
    <div className="max-w-[900px] mx-auto py-12 px-7">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/grants" className="hover:text-ink transition-colors">
          Grants
        </Link>
        <span>/</span>
        <span className="text-ink truncate max-w-[300px]">{grant.name}</span>
      </nav>

      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-ink mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to grants
      </button>

      {/* Header */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="mono-label px-2 py-1 bg-grant-bg text-grant-text">
            {grant.type}
          </span>
          {grant.expired && (
            <span className="px-2 py-0.5 text-xs font-medium bg-rose-light text-rose-dark">
              Expired
            </span>
          )}
        </div>

        <h1 className="font-serif font-bold text-[clamp(28px,4vw,42px)] leading-[1.1] tracking-[-0.04em] mb-4">
          {grant.name}
        </h1>

        <p className="text-lg text-muted">
          by <span className="text-ink font-medium">{grant.issuingBody}</span>
        </p>
      </section>

      {/* Quick info cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {grant.amountDisplay && (
          <InfoCard
            label="Funding Amount"
            value={grant.amountDisplay}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        )}
        <InfoCard
          label="Deadline"
          value={formatDeadline(grant.deadline)}
          subtext={daysUntilDeadline !== null ? (daysUntilDeadline === 0 ? "Today!" : `${daysUntilDeadline} days left`) : undefined}
          variant={grant.expired ? "danger" : daysUntilDeadline !== null && daysUntilDeadline <= 14 ? "warning" : "default"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <InfoCard
          label="Type"
          value={grant.type ?? "Grant"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left column - details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary */}
          <ContentSection title="Overview">
            <p className="text-ink leading-[1.8]">{grant.summary}</p>
          </ContentSection>

          {/* Eligibility */}
          {grant.eligibility && (
            <ContentSection title="Eligibility">
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: formatContent(grant.eligibility) }} />
            </ContentSection>
          )}

          {/* What is funded */}
          {grant.whatIsFunded && (
            <ContentSection title="What is Funded">
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: formatContent(grant.whatIsFunded) }} />
            </ContentSection>
          )}

          {/* How to apply */}
          {grant.howToApply && (
            <ContentSection title="How to Apply">
              <div className="prose-content" dangerouslySetInnerHTML={{ __html: formatContent(grant.howToApply) }} />
            </ContentSection>
          )}
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Apply CTA */}
          {grant.sourceUrl && (
            <div className="p-5 bg-paper-light border border-line">
              <a
                href={grant.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 bg-gold hover:bg-gold-hover text-white font-semibold text-sm transition-colors"
              >
                Visit Official Source
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="mt-3 text-xs text-muted text-center">
                Opens in a new tab
              </p>
            </div>
          )}

          {/* Applicable stages */}
          {(grant.stages?.length ?? 0) > 0 && (
            <div className="p-5 bg-paper-light border border-line">
              <h3 className="mono-label text-muted mb-3">Startup Stages</h3>
              <div className="flex flex-wrap gap-2">
                {grant.stages?.map((stage) => (
                  <span
                    key={stage}
                    className="px-3 py-1.5 text-sm bg-paper border border-line text-ink"
                  >
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Applicable sectors */}
          {(grant.sectors?.length ?? 0) > 0 && (
            <div className="p-5 bg-paper-light border border-line">
              <h3 className="mono-label text-muted mb-3">Sectors</h3>
              <div className="flex flex-wrap gap-2">
                {grant.sectors?.map((sector) => (
                  <span
                    key={sector}
                    className="px-3 py-1.5 text-sm bg-paper border border-line text-ink"
                  >
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to format plain text content with line breaks
function formatContent(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      // Check for list items
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return `<li>${trimmed.substring(2)}</li>`;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return `<li>${trimmed.replace(/^\d+\.\s/, "")}</li>`;
      }
      return `<p>${trimmed}</p>`;
    })
    .join("");
}

// Info card component
function InfoCard({
  label,
  value,
  subtext,
  icon,
  variant = "default",
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}) {
  const variantClasses = {
    default: "bg-paper-light border-line",
    warning: "bg-gold-light border-gold",
    danger: "bg-rose-light border-rose",
  };

  return (
    <div className={`p-4 border ${variantClasses[variant]}`}>
      <div className="flex items-start gap-3">
        <div className="text-muted">{icon}</div>
        <div>
          <p className="mono-label text-muted mb-1">{label}</p>
          <p className="font-semibold text-ink">{value}</p>
          {subtext && (
            <p className={`text-xs mt-0.5 ${variant === "warning" ? "text-gold-dark" : variant === "danger" ? "text-rose-dark" : "text-muted"}`}>
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Content section component
function ContentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif font-bold text-xl tracking-[-0.02em] mb-4 pb-2 border-b border-line">
        {title}
      </h2>
      <div className="text-ink leading-[1.8] [&_.prose-content_p]:mb-3 [&_.prose-content_li]:ml-4 [&_.prose-content_li]:list-disc [&_.prose-content_li]:mb-1">
        {children}
      </div>
    </section>
  );
}
