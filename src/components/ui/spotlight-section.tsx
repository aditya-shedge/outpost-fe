"use client";

import Link from "next/link";
import Image from "next/image";
import type { SpotlightFounder } from "@/lib/api/spotlight";

interface SpotlightSectionProps {
  founder: SpotlightFounder;
}

export function SpotlightSection({ founder }: SpotlightSectionProps) {
  return (
    <section className="mb-12" data-testid="spotlight-section">
      <div className="relative border border-gold bg-gradient-to-br from-gold-light/30 to-paper-light p-6 sm:p-8">
        {/* Founder of the Day label */}
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold text-white text-xs font-semibold tracking-wide uppercase">
            <StarIcon className="size-3" />
            Founder of the Day
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6 mt-2">
          {/* Founder Photo */}
          <div className="shrink-0">
            {founder.photoUrl ? (
              <Image
                src={founder.photoUrl}
                alt={founder.founderName}
                width={80}
                height={80}
                className="size-20 rounded-full object-cover border-2 border-gold"
              />
            ) : (
              <div className="size-20 rounded-full bg-gold-light border-2 border-gold flex items-center justify-center">
                <span className="text-2xl font-bold text-gold-dark">
                  {founder.founderName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Founder Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-bold text-xl tracking-[-0.02em] text-ink mb-1">
              {founder.founderName}
            </h3>
            <p className="text-sm font-medium text-gold-dark mb-3">
              {founder.startupName}
            </p>
            <p className="text-muted text-sm leading-relaxed line-clamp-2">
              {founder.oneLiner}
            </p>
          </div>

          {/* View Profile Link */}
          <div className="shrink-0 self-center">
            <Link
              href={`/founders/${founder.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gold text-gold-dark text-sm font-medium hover:bg-gold hover:text-white transition-colors"
            >
              View profile
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default SpotlightSection;
