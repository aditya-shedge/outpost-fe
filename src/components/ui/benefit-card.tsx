"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";
import type { Benefit } from "@/lib/api/benefits";

interface BenefitCardProps {
  benefit: Benefit;
}

const categoryLabels: Record<string, string> = {
  CLOUD: "Cloud",
  DEV_TOOLS: "Dev Tools",
  BUSINESS_TOOLS: "Business Tools",
  SERVICES: "Services",
};

const categoryColors: Record<string, string> = {
  CLOUD: "bg-blue-100 text-blue-800",
  DEV_TOOLS: "bg-purple-100 text-purple-800",
  BUSINESS_TOOLS: "bg-amber-100 text-amber-800",
  SERVICES: "bg-green-100 text-green-800",
};

export function BenefitCard({ benefit }: BenefitCardProps) {
  const isExpired = benefit.expired || (benefit.validUntil && new Date(benefit.validUntil) < new Date());

  return (
    <Link
      href={`/benefits/${benefit.id}`}
      className={`group block border border-line bg-paper-light p-5 transition-all hover:border-gold hover:shadow-sm ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Partner Logo */}
        <div className="shrink-0 w-12 h-12 rounded-lg bg-paper border border-line flex items-center justify-center overflow-hidden">
          {benefit.partner?.logoUrl ? (
            <Image
              src={benefit.partner.logoUrl}
              alt={benefit.partner.name || "Partner"}
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          ) : benefit.partner?.name ? (
            <span className="text-lg font-bold text-gold-dark">
              {benefit.partner.name.charAt(0)}
            </span>
          ) : (
            <GiftIcon className="w-6 h-6 text-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted mb-1">{benefit.partner?.name}</p>
          <h3 className="font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-gold-dark transition-colors">
            {benefit.headline}
          </h3>
        </div>
      </div>

      {/* Category Badge */}
      {benefit.category && (
        <div className="mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
              categoryColors[benefit.category] || "bg-gray-100 text-gray-800"
            }`}
          >
            {categoryLabels[benefit.category] || benefit.category}
          </span>
        </div>
      )}

      {/* Eligibility Note Preview */}
      {benefit.eligibilityNote && (
        <p className="text-xs text-muted line-clamp-2 mb-4">{benefit.eligibilityNote}</p>
      )}

      {/* AI Reason */}
      {benefit.aiApplied && benefit.aiReason && (
        <p className="text-xs text-gold-dark italic mb-4 line-clamp-2">
          ✨ {benefit.aiReason}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-line">
        {isExpired ? (
          <Badge variant="default">Expired</Badge>
        ) : benefit.validUntil ? (
          <span className="text-xs text-muted">
            Valid until {new Date(benefit.validUntil).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-xs text-green">Always available</span>
        )}

        <span className="text-xs font-medium text-gold-dark group-hover:translate-x-1 transition-transform">
          View offer →
        </span>
      </div>
    </Link>
  );
}

export function BenefitCardSkeleton() {
  return (
    <div className="border border-line bg-paper-light p-5">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 mb-3 rounded" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-line">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
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

export default BenefitCard;
