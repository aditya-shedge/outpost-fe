"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import type { MentorWithAi } from "@/lib/api/types";

interface MentorCardProps {
  mentor: MentorWithAi;
  variant?: "light" | "dark";
  showAiReason?: boolean;
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MentorCard({ mentor, variant = "light", showAiReason = false }: MentorCardProps) {
  const { id, name, headline, expertise, photoUrl } = mentor;
  
  const isDark = variant === "dark";
  const maxTags = 3;
  const visibleTags = expertise?.slice(0, maxTags) || [];
  const remainingCount = (expertise?.length || 0) - maxTags;

  return (
    <article 
      className={`group p-5 flex flex-col h-full transition-all hover:-translate-y-0.5 ${
        isDark 
          ? "bg-[#1e2b24] border border-[#2d3d33]" 
          : "bg-paper-light border border-line hover:shadow-md"
      }`}
    >
      {/* Photo + Info */}
      <div className="flex items-start gap-4 mb-4">
        {/* Photo */}
        <div className={`shrink-0 w-14 h-14 rounded-full overflow-hidden ${isDark ? "grayscale" : ""}`}>
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={name || "Mentor"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-sm font-semibold ${
              isDark 
                ? "bg-[#2d3d33] text-green-400" 
                : "bg-gold-light text-gold-dark"
            }`}>
              {getInitials(name)}
            </div>
          )}
        </div>

        {/* Name + Role */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-[15px] leading-snug truncate ${
            isDark ? "text-white" : "text-ink"
          }`}>
            {name}
          </h3>
          <p className={`text-sm truncate ${isDark ? "text-green-400" : "text-gold-dark"}`}>
            {headline}
          </p>
        </div>
      </div>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
        {visibleTags.map((tag) => (
          <span 
            key={tag}
            className={`text-[10px] px-2 py-1 rounded-sm ${
              isDark 
                ? "bg-[#2d3d33] text-gray-300" 
                : "bg-line/50 text-muted"
            }`}
          >
            {tag}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className={`text-[10px] px-2 py-1 ${isDark ? "text-gray-500" : "text-muted"}`}>
            +{remainingCount} more
          </span>
        )}
      </div>

      {/* AI Reason */}
      {showAiReason && mentor.aiReason && (
        <div className={`flex items-start gap-2 text-xs px-3 py-2 mb-4 -mx-1 ${
          isDark ? "bg-[#2d3d33] text-gray-300" : "bg-gold-light/50 text-muted"
        }`}>
          <Icon name="sparkles" className={`size-3.5 shrink-0 mt-0.5 ${isDark ? "text-green-400" : "text-gold-dark"}`} />
          <span>{mentor.aiReason}</span>
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/mentors/${id}`}
        className={`inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium transition-colors ${
          isDark
            ? "border border-green-400/30 text-green-400 hover:bg-green-400 hover:text-[#17231c]"
            : "border border-ink text-ink hover:bg-ink hover:text-paper-light"
        }`}
      >
        View profile
        <Icon name="arrow-right" className="size-4" />
      </Link>
    </article>
  );
}
