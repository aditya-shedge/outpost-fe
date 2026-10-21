"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { getGrants } from "@/lib/api/grants";
import { getChallenges } from "@/lib/api/challenges";
import { getMentors } from "@/lib/api/mentors";
import { getSpotlight, type SpotlightFounder } from "@/lib/api/spotlight";
import { Icon, OpportunityCard, MentorCard, SkeletonCard, EmptyState, SpotlightSection } from "@/components/ui";
import type { GrantWithAi, ChallengeWithAi, MentorWithAi } from "@/lib/api/types";

type OpportunityFilter = "all" | "grant" | "challenge";

interface Opportunity {
  type: "grant" | "challenge";
  data: GrantWithAi | ChallengeWithAi;
  deadline: Date | null;
}

export default function DiscoverPage() {
  const { user } = useAuth();
  
  // Data state
  const [grants, setGrants] = useState<GrantWithAi[]>([]);
  const [challenges, setChallenges] = useState<ChallengeWithAi[]>([]);
  const [mentors, setMentors] = useState<MentorWithAi[]>([]);
  // Spotlight feature not yet implemented in backend
  // const [spotlight, setSpotlight] = useState<SpotlightFounder | null>(null);
  
  // Loading state
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  
  // Filter state
  const [opportunityFilter, setOpportunityFilter] = useState<OpportunityFilter>("all");

  // Spotlight feature not yet implemented in backend
  // useEffect(() => {
  //   const fetchSpotlight = async () => {
  //     const spotlightData = await getSpotlight();
  //     setSpotlight(spotlightData);
  //   };
  //   fetchSpotlight();
  // }, []);

  // Fetch opportunities on mount
  useEffect(() => {
    const fetchOpportunities = async () => {
      // Fetch grants and challenges independently so one failure doesn't break both
      try {
        const grantsRes = await getGrants({ size: 6 });
        setGrants(grantsRes.content);
      } catch (err) {
        console.error("Failed to fetch grants:", err);
      }

      try {
        const challengesRes = await getChallenges({ size: 6, status: "OPEN" });
        setChallenges(challengesRes.content);
      } catch (err) {
        // Challenges endpoint has backend issues - fail silently
        console.error("Failed to fetch challenges:", err);
      }

      setIsLoadingOpportunities(false);
    };
    fetchOpportunities();
  }, []);

  // Fetch mentors on mount
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const mentorsRes = await getMentors({ size: 3 });
        setMentors(mentorsRes.content);
      } catch (err) {
        console.error("Failed to fetch mentors:", err);
      } finally {
        setIsLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  // Combine and sort opportunities by deadline
  const allOpportunities: Opportunity[] = [
    ...grants.map((g) => ({
      type: "grant" as const,
      data: g,
      deadline: g.deadline ? new Date(g.deadline) : null,
    })),
    ...challenges.map((c) => ({
      type: "challenge" as const,
      data: c,
      deadline: c.deadline ? new Date(c.deadline) : null,
    })),
  ].sort((a, b) => {
    // Rolling deadlines (null) go last
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.getTime() - b.deadline.getTime();
  });

  // Filter opportunities
  const filteredOpportunities = allOpportunities.filter((opp) => {
    if (opportunityFilter === "all") return true;
    return opp.type === opportunityFilter;
  }).slice(0, 6);

  // Stats
  const stats = {
    openCalls: grants.length + challenges.length,
    mentors: mentors.length,
    closingSoon: allOpportunities.filter((opp) => {
      if (!opp.deadline) return false;
      const daysUntil = Math.ceil((opp.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    }).length,
  };

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      {/* FE-016: Hero Section */}
      <section className="mb-12">
        <p className="mono-label text-gold-dark flex items-center gap-2 mb-4">
          <Icon name="sparkles" className="size-4" />
          CURATED FOR T-HUB FOUNDERS
        </p>
        
        <h1 className="font-serif font-bold text-[clamp(34px,4vw,49px)] leading-[1.05] tracking-[-0.06em] mb-4">
          What will move your startup forward?
        </h1>
        
        <p className="max-w-[520px] text-muted leading-[1.75] text-[15px]">
          Discover funding opportunities, corporate challenges, and connect with mentors 
          who&apos;ve been where you are. All curated for T-Hub founders like you, {user?.founderName?.split(" ")[0] || "Founder"}.
        </p>
      </section>

      {/* FE-039: Spotlight Section - not yet implemented in backend */}
      {/* {spotlight && <SpotlightSection founder={spotlight} />} */}

      {/* FE-016: Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <StatCard 
          number={isLoadingOpportunities ? "..." : String(stats.openCalls)} 
          label="Open calls" 
          icon="grid"
        />
        <StatCard 
          number={isLoadingMentors ? "..." : String(stats.mentors)} 
          label="Mentors" 
          icon="mentors"
        />
        <StatCard 
          number={isLoadingOpportunities ? "..." : String(stats.closingSoon)} 
          label="Closing soon" 
          icon="clock"
        />
      </section>

      {/* Divider */}
      <div className="h-px bg-line mb-12" />

      {/* FE-017: Opportunities Section */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="mono-label text-gold-dark mb-2">OPEN NOW</p>
            <h2 className="font-serif font-bold text-2xl tracking-[-0.04em]">
              Opportunities for you
            </h2>
          </div>
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <FilterPill 
              active={opportunityFilter === "all"} 
              onClick={() => setOpportunityFilter("all")}
            >
              All opportunities
            </FilterPill>
            <FilterPill 
              active={opportunityFilter === "grant"} 
              onClick={() => setOpportunityFilter("grant")}
            >
              Grants
            </FilterPill>
            <FilterPill 
              active={opportunityFilter === "challenge"} 
              onClick={() => setOpportunityFilter("challenge")}
            >
              Challenges
            </FilterPill>
          </div>
        </div>

        {/* Opportunity Cards Grid */}
        {isLoadingOpportunities ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <EmptyState
            icon="grid"
            title="No opportunities found"
            description="Check back soon for new grants and challenges."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={`${opp.type}-${opp.data.id}`}
                type={opp.type}
                data={opp.data}
              />
            ))}
          </div>
        )}

        {/* Explore All Link */}
        <div className="mt-8 text-center">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold-dark transition-colors"
          >
            Explore all opportunities
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      </section>

      {/* FE-018: Mentors Section (Dark) */}
      <section className="bg-[#17231c] -mx-7 px-7 py-12 lg:-mx-[calc((100vw-1100px)/2+28px)] lg:px-[calc((100vw-1100px)/2+28px)]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="mono-label text-green-400 mb-2">FOUNDER TO FOUNDER</p>
              <h2 className="font-serif font-bold text-2xl tracking-[-0.04em] text-white">
                Meet mentors who&apos;ve been there
              </h2>
              <p className="text-gray-400 text-sm mt-2 max-w-md">
                Get guidance from operators, investors, and domain experts who understand 
                the founder journey.
              </p>
            </div>
            
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-white transition-colors"
            >
              Browse all mentors
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>

          {/* Mentor Cards Grid */}
          {isLoadingMentors ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#1e2b24] border border-[#2d3d33] p-5 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#2d3d33]" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#2d3d33] rounded w-24 mb-2" />
                      <div className="h-3 bg-[#2d3d33] rounded w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-[#2d3d33] rounded w-16" />
                    <div className="h-6 bg-[#2d3d33] rounded w-20" />
                  </div>
                  <div className="h-10 bg-[#2d3d33] rounded" />
                </div>
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No mentors available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} variant="dark" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Stat Card Component
function StatCard({ number, label, icon }: { number: string; label: string; icon: "grid" | "mentors" | "clock" }) {
  return (
    <div className="p-5 border border-line bg-paper-light flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center">
        <Icon name={icon} className="size-5 text-gold-dark" />
      </div>
      <div>
        <div className="font-serif font-bold text-3xl tracking-[-0.04em] text-ink">
          {number}
        </div>
        <div className="text-muted text-sm">{label}</div>
      </div>
    </div>
  );
}

// Filter Pill Component
function FilterPill({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-ink text-paper-light"
          : "bg-paper-light border border-line text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
