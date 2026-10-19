"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMentorById } from "@/lib/api/mentors";
import { Icon, LoadingSpinner } from "@/components/ui";
import type { MentorDetailResponse } from "@/lib/api/types";

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getLinkIcon(linkType: string): string {
  const type = linkType.toLowerCase();
  if (type.includes("linkedin")) return "LinkedIn";
  if (type.includes("twitter") || type.includes("x")) return "X/Twitter";
  if (type.includes("github")) return "GitHub";
  return linkType;
}

export default function MentorDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [mentor, setMentor] = useState<MentorDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMentor() {
      try {
        const data = await getMentorById(id);
        setMentor(data);
      } catch (err) {
        console.error("Failed to load mentor:", err);
        setError("Mentor not found or unavailable.");
      } finally {
        setIsLoading(false);
      }
    }
    loadMentor();
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

  if (error || !mentor) {
    return (
      <div className="max-w-[900px] mx-auto py-12 px-7">
        <div className="text-center py-16">
          <p className="text-xl text-muted mb-4">{error || "Mentor not found"}</p>
          <Link
            href="/mentors"
            className="text-green-dark hover:text-green underline underline-offset-2"
          >
            ← Back to mentors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto py-12 px-7">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/mentors" className="hover:text-ink transition-colors">
          Mentors
        </Link>
        <Icon name="chevron-right" className="size-4" />
        <span className="text-ink truncate max-w-[300px]">{mentor.name}</span>
      </nav>

      {/* Header with photo */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Large photo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 bg-gold-light">
            {mentor.photoUrl ? (
              <img
                src={mentor.photoUrl}
                alt={mentor.name || "Mentor"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gold-dark">
                {getInitials(mentor.name)}
              </div>
            )}
          </div>

          {/* Name + Headline */}
          <div className="flex-1">
            <h1 className="font-serif font-bold text-[clamp(28px,3.5vw,40px)] leading-[1.1] tracking-[-0.04em] mb-2">
              {mentor.name}
            </h1>
            <p className="text-lg text-green-dark mb-4">{mentor.headline}</p>

            {/* Book a call CTA */}
            {mentor.bookingUrl && (
              <a
                href={mentor.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green text-white text-sm font-medium hover:bg-green-dark transition-colors"
              >
                <Icon name="calendar" className="size-4" />
                Book a call
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="grid md:grid-cols-3 gap-10">
        {/* Left column - Bio & Experience */}
        <div className="md:col-span-2 space-y-8">
          {/* Bio */}
          {mentor.bio && (
            <section>
              <h2 className="font-serif font-bold text-xl mb-3 text-ink">About</h2>
              <div className="prose prose-sm max-w-none text-ink/90 leading-relaxed whitespace-pre-wrap">
                {mentor.bio}
              </div>
            </section>
          )}

          {/* Experience */}
          {mentor.experience && (
            <section>
              <h2 className="font-serif font-bold text-xl mb-3 text-ink">Experience</h2>
              <div className="prose prose-sm max-w-none text-ink/90 leading-relaxed whitespace-pre-wrap">
                {mentor.experience}
              </div>
            </section>
          )}
        </div>

        {/* Right column - Expertise & Links */}
        <div className="space-y-8">
          {/* Expertise */}
          {mentor.expertise && mentor.expertise.length > 0 && (
            <section>
              <h2 className="font-serif font-bold text-lg mb-3 text-ink">Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-sm bg-green-light text-green-dark border border-green/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {mentor.links && mentor.links.length > 0 && (
            <section>
              <h2 className="font-serif font-bold text-lg mb-3 text-ink">Links</h2>
              <ul className="space-y-2">
                {mentor.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-green-dark hover:text-green transition-colors"
                    >
                      <Icon name="external-link" className="size-4" />
                      {getLinkIcon(link.linkType || "Website")}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Booking info */}
          <section className="p-4 bg-paper-light border border-line">
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Booking</p>
            <p className="text-sm text-ink mb-3">
              Sessions are scheduled via Cal.com. Outpost does not store booking data.
            </p>
            {mentor.bookingUrl && (
              <a
                href={mentor.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-dark hover:text-green transition-colors"
              >
                <Icon name="external-link" className="size-4" />
                Open booking page
              </a>
            )}
          </section>
        </div>
      </div>

      {/* Back link */}
      <section className="mt-10 pt-6 border-t border-line">
        <Link
          href="/mentors"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <Icon name="chevron-left" className="size-4" />
          Back to mentors
        </Link>
      </section>
    </div>
  );
}
