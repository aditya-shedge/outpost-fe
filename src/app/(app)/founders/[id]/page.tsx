"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getFounderProfile, type PublicFounderProfile } from "@/lib/api/founders";
import { Icon, PageLoader } from "@/components/ui";

export default function FounderProfilePage() {
  const params = useParams();
  const founderId = params.id as string;

  const [founder, setFounder] = useState<PublicFounderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchFounder = async () => {
      const profile = await getFounderProfile(founderId);
      if (profile) {
        setFounder(profile);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    };
    fetchFounder();
  }, [founderId]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (notFound || !founder) {
    return (
      <div className="max-w-[800px] mx-auto py-16 px-7 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-line flex items-center justify-center mb-4">
            <Icon name="user" className="size-8 text-muted" />
          </div>
          <h1 className="font-serif font-bold text-2xl tracking-[-0.04em] text-ink mb-2">
            Profile Not Found
          </h1>
          <p className="text-muted">
            This founder profile is not currently accessible.
          </p>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:text-ink transition-colors"
        >
          <Icon name="arrow-left" className="size-4" />
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto py-12 px-7">
      {/* Back Link */}
      <Link
        href="/discover"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-8"
      >
        <Icon name="arrow-left" className="size-4" />
        Back to Discover
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        {/* Photo */}
        {founder.photoUrl ? (
          <Image
            src={founder.photoUrl}
            alt={founder.founderName}
            width={120}
            height={120}
            className="size-[120px] rounded-full object-cover border-2 border-gold"
          />
        ) : (
          <div className="size-[120px] rounded-full bg-gold-light border-2 border-gold flex items-center justify-center">
            <span className="text-4xl font-bold text-gold-dark">
              {founder.founderName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <h1 className="font-serif font-bold text-3xl tracking-[-0.04em] text-ink mb-1">
            {founder.founderName}
          </h1>
          <p className="text-lg font-medium text-gold-dark mb-4">
            {founder.startupName}
          </p>

          {/* Stage & Sector Tags */}
          <div className="flex flex-wrap gap-2">
            {founder.stage && (
              <span className="inline-flex items-center px-3 py-1 bg-paper-light border border-line text-xs font-medium text-muted">
                {founder.stage}
              </span>
            )}
            {founder.sector && (
              <span className="inline-flex items-center px-3 py-1 bg-paper-light border border-line text-xs font-medium text-muted">
                {founder.sector}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-line mb-8" />

      {/* One-liner */}
      {founder.oneLiner && (
        <div className="mb-8">
          <h2 className="mono-label text-gold-dark mb-3">ABOUT</h2>
          <p className="text-lg text-ink leading-relaxed italic">
            &ldquo;{founder.oneLiner}&rdquo;
          </p>
        </div>
      )}

      {/* Bio */}
      {founder.bio && (
        <div className="mb-8">
          <h2 className="mono-label text-gold-dark mb-3">BIO</h2>
          <div className="prose prose-ink max-w-none">
            <p className="text-muted leading-relaxed whitespace-pre-wrap">
              {founder.bio}
            </p>
          </div>
        </div>
      )}

      {/* Links */}
      {(founder.linkedinUrl || founder.twitterUrl || founder.websiteUrl) && (
        <div>
          <h2 className="mono-label text-gold-dark mb-3">CONNECT</h2>
          <div className="flex flex-wrap gap-3">
            {founder.linkedinUrl && (
              <a
                href={founder.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-line text-sm font-medium text-ink hover:border-ink hover:bg-paper-light transition-colors"
              >
                <LinkedInIcon className="size-4" />
                LinkedIn
              </a>
            )}
            {founder.twitterUrl && (
              <a
                href={founder.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-line text-sm font-medium text-ink hover:border-ink hover:bg-paper-light transition-colors"
              >
                <TwitterIcon className="size-4" />
                Twitter
              </a>
            )}
            {founder.websiteUrl && (
              <a
                href={founder.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-line text-sm font-medium text-ink hover:border-ink hover:bg-paper-light transition-colors"
              >
                <GlobeIcon className="size-4" />
                Website
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
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
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
