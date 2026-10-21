"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { meApi } from "@/lib/api/me";
import { getStages, getSectors } from "@/lib/api/lookups";
import { Icon, PageLoader, ApiErrorDisplay } from "@/components/ui";
import type { IdentityResponse, LookupResponse } from "@/lib/api/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const [identities, setIdentities] = useState<IdentityResponse[]>([]);
  const [stages, setStages] = useState<LookupResponse[]>([]);
  const [sectors, setSectors] = useState<LookupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [identitiesData, stagesData, sectorsData] = await Promise.all([
          meApi.getIdentities(),
          getStages(),
          getSectors(),
        ]);
        setIdentities(identitiesData);
        setStages(stagesData);
        setSectors(sectorsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load profile"));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <ApiErrorDisplay error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user initials for avatar
  const initials = user.founderName
    ? user.founderName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Look up stage and sector names
  const stageName = stages.find((s) => s.id === user.stageId)?.name;
  const sectorName = sectors.find((s) => s.id === user.sectorId)?.name;

  // Calculate profile completeness
  const fields = [
    user.founderName,
    user.startupName,
    user.stageId,
    user.sectorId,
    user.city,
    user.website,
    user.profile?.bio,
  ];
  const filledFields = fields.filter(Boolean).length;
  const completeness = Math.round((filledFields / fields.length) * 100);

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-green/10 via-paper to-gold/5 border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green to-green/80 flex items-center justify-center text-3xl font-bold text-white shadow-lg flex-shrink-0">
              {initials}
            </div>
            
            {/* Name & Startup */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-ink">
                {user.founderName || "Founder"}
              </h1>
              <p className="text-base text-muted">
                {user.startupName || "Startup"}
              </p>
              {(stageName || sectorName) && (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {stageName && (
                    <span className="px-3 py-1 bg-paper text-ink text-sm font-medium border border-line">
                      {stageName}
                    </span>
                  )}
                  {sectorName && (
                    <span className="px-3 py-1 bg-gold/10 text-gold-dark text-sm font-medium">
                      {sectorName}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Edit Button */}
            <Link
              href="/profile/edit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white font-medium hover:bg-ink/90 transition-colors shadow-sm"
            >
              <Icon name="edit" className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Completeness */}
        {completeness < 100 && (
          <div className="mb-8 p-5 bg-white border border-gold/30 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="info" className="w-5 h-5 text-gold" />
                <span className="font-medium text-ink">Complete your profile</span>
              </div>
              <span className="text-sm font-bold text-gold">{completeness}%</span>
            </div>
            <div className="h-2 bg-paper rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold/80 transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted">
              A complete profile helps us show you the most relevant grants and challenges.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio Card */}
            <div className="bg-white border border-line p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-3 flex items-center gap-2">
                <Icon name="user" className="w-4 h-4 text-green" />
                About
              </h2>
              {user.profile?.bio ? (
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {user.profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted italic">
                  No bio added yet. Tell others about yourself and your startup.
                </p>
              )}
            </div>

            {/* Details Card */}
            <div className="bg-white border border-line p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-3 flex items-center gap-2">
                <Icon name="info" className="w-4 h-4 text-green" />
                Details
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Location" value={user.city} />
                <DetailItem 
                  label="Website" 
                  value={user.website}
                  isLink 
                />
                <DetailItem label="Email" value={user.email} />
                <DetailItem 
                  label="Member since" 
                  value={new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} 
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Social Links Card */}
            <div className="bg-white border border-line p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-3 flex items-center gap-2">
                <Icon name="link" className="w-4 h-4 text-green" />
                Links
              </h2>
              {user.profile?.links && user.profile.links.length > 0 ? (
                <div className="space-y-2">
                  {user.profile.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-paper hover:bg-paper-light border border-line transition-colors group"
                    >
                      {link.type === "LINKEDIN" && <LinkedInIcon className="w-5 h-5" />}
                      {link.type === "X" && <XIcon className="w-5 h-5" />}
                      {link.type === "OTHER" && <Icon name="external-link" className="w-5 h-5 text-muted" />}
                      <span className="flex-1 text-sm text-ink group-hover:text-green truncate">
                        {link.type === "LINKEDIN" ? "LinkedIn" : link.type === "X" ? "X / Twitter" : new URL(link.url).hostname}
                      </span>
                      <Icon name="arrow-right" className="w-4 h-4 text-muted group-hover:text-green" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted italic">No links added yet.</p>
              )}
            </div>

            {/* Connected Accounts Card */}
            <div className="bg-white border border-line p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink mb-3 flex items-center gap-2">
                <Icon name="shield" className="w-4 h-4 text-green" />
                Account
              </h2>
              <div className="space-y-2">
                <p className="text-xs text-muted mb-2">Sign-in methods</p>
                {identities.map((identity) => (
                  <div
                    key={identity.provider}
                    className="flex items-center gap-3 p-3 bg-paper border border-line"
                  >
                    {identity.provider === "GOOGLE" && <GoogleIcon className="w-5 h-5" />}
                    {identity.provider === "EMAIL" && <Icon name="mail" className="w-5 h-5 text-ink" />}
                    {identity.provider === "LINKEDIN" && <LinkedInIcon className="w-5 h-5" />}
                    <span className="text-sm font-medium text-ink">
                      {identity.provider === "EMAIL" ? "Email & Password" : identity.provider}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/profile/security"
                className="mt-4 flex items-center gap-2 text-sm text-green hover:underline"
              >
                Manage security settings
                <Icon name="arrow-right" className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  return (
    <div className="p-3 bg-paper rounded">
      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
      {value ? (
        isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-ink font-medium">{value}</p>
        )
      ) : (
        <p className="text-muted italic">Not set</p>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
