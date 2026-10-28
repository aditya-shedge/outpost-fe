"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBenefit } from "@/lib/api/benefits";
import type { Benefit } from "@/lib/api/benefits";
import { Icon, Badge, PageLoader, Button } from "@/components/ui";

const categoryLabels: Record<string, string> = {
  CLOUD: "Cloud",
  DEV_TOOLS: "Dev Tools",
  BUSINESS_TOOLS: "Business Tools",
  SERVICES: "Services",
};

export default function BenefitDetailPage() {
  const params = useParams();
  const benefitId = params.id as string;

  const [benefit, setBenefit] = useState<Benefit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);

  useEffect(() => {
    const fetchBenefit = async () => {
      const data = await getBenefit(benefitId);
      if (data) {
        setBenefit(data);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    };
    fetchBenefit();
  }, [benefitId]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (notFound || !benefit) {
    return (
      <div className="max-w-[800px] mx-auto py-16 px-7 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-line flex items-center justify-center mb-4">
            <GiftIcon className="size-8 text-muted" />
          </div>
          <h1 className="font-serif font-bold text-2xl tracking-[-0.04em] text-ink mb-2">
            Benefit Not Found
          </h1>
          <p className="text-muted">
            This benefit may have been removed or is no longer available.
          </p>
        </div>
        <Link
          href="/benefits"
          className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:text-ink transition-colors"
        >
          <Icon name="arrow-left" className="size-4" />
          Back to Benefits
        </Link>
      </div>
    );
  }

  const isExpired = benefit.expired || (benefit.validUntil && new Date(benefit.validUntil) < new Date());

  return (
    <div className="max-w-[800px] mx-auto py-12 px-7">
      {/* Back Link */}
      <Link
        href="/benefits"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-8"
      >
        <Icon name="arrow-left" className="size-4" />
        Back to Benefits
      </Link>

      {/* Partner Branding */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-lg bg-paper border border-line flex items-center justify-center overflow-hidden">
          {benefit.partner?.logoUrl ? (
            <img
              src={benefit.partner.logoUrl}
              alt={benefit.partner.name || "Partner"}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-2xl font-bold text-gold-dark">
              {benefit.partner?.name?.charAt(0) || "P"}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted mb-1">Offered by</p>
          <p className="font-semibold text-ink">{benefit.partner?.name}</p>
        </div>
      </div>

      {/* Headline */}
      <h1 className="font-serif font-bold text-3xl tracking-[-0.04em] text-ink mb-4">
        {benefit.headline}
      </h1>

      {/* Category and Status */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {benefit.category && (
          <Badge>{categoryLabels[benefit.category] || benefit.category}</Badge>
        )}
        {isExpired ? (
          <Badge variant="default">Expired</Badge>
        ) : benefit.validUntil ? (
          <Badge variant="scheme">
            Valid until {new Date(benefit.validUntil).toLocaleDateString()}
          </Badge>
        ) : (
          <Badge variant="mentor">Always available</Badge>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-line mb-8" />

      {/* What You Get */}
      {benefit.whatYouGet && (
        <section className="mb-8">
          <h2 className="mono-label text-gold-dark mb-3">WHAT YOU GET</h2>
          <div className="bg-gold-light/30 border border-gold/30 p-5">
            <p className="text-ink leading-relaxed whitespace-pre-wrap">{benefit.whatYouGet}</p>
          </div>
        </section>
      )}

      {/* Eligibility */}
      {benefit.eligibilityNote && (
        <section className="mb-8">
          <h2 className="mono-label text-gold-dark mb-3">ELIGIBILITY</h2>
          <p className="text-muted leading-relaxed whitespace-pre-wrap">{benefit.eligibilityNote}</p>
        </section>
      )}

      {/* How to Claim */}
      {benefit.howToClaim && (
        <section className="mb-8">
          <h2 className="mono-label text-gold-dark mb-3">HOW TO CLAIM</h2>
          <div className="bg-paper-light border border-line p-5">
            <p className="text-ink leading-relaxed whitespace-pre-wrap">{benefit.howToClaim}</p>
          </div>
        </section>
      )}

      {/* Claim Action */}
      {!isExpired && (benefit.claimUrl || benefit.claimCode) && (
        <section className="mt-10 p-6 bg-ink text-white">
          <h2 className="font-serif font-bold text-xl mb-4">Ready to claim?</h2>

          {benefit.claimCode && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Use this code:</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 px-4 py-3 font-mono text-lg">
                  {codeRevealed ? benefit.claimCode : "••••••••••••"}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (codeRevealed && benefit.claimCode) {
                      navigator.clipboard.writeText(benefit.claimCode);
                    } else {
                      setCodeRevealed(true);
                    }
                  }}
                >
                  {codeRevealed ? "Copy" : "Reveal"}
                </Button>
              </div>
            </div>
          )}

          {benefit.claimUrl && (
            <a
              href={benefit.claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-ink font-semibold hover:bg-gold-dark transition-colors"
            >
              Claim this offer
              <ExternalLinkIcon className="size-4" />
            </a>
          )}
        </section>
      )}

      {/* Expired Notice */}
      {isExpired && (
        <div className="mt-10 p-6 bg-gray-100 border border-gray-200 text-center">
          <p className="text-muted">
            This offer expired on {new Date(benefit.validUntil!).toLocaleDateString()}.
          </p>
          <Link
            href="/benefits"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-gold-dark hover:text-ink transition-colors"
          >
            Browse active benefits
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function GiftIcon({ className }: { className?: string }) {
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
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
