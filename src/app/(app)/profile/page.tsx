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
  ];
  const filledFields = fields.filter(Boolean).length;
  const completeness = Math.round((filledFields / fields.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-green flex items-center justify-center text-2xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ink">{user.founderName || "Founder"}</h1>
            <p className="text-lg text-muted">{user.startupName || "Startup"}</p>
          </div>
        </div>
        <Link
          href="/profile/edit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white font-medium hover:bg-ink/90 transition-colors"
        >
          <Icon name="edit" className="w-4 h-4" />
          Edit profile
        </Link>
      </div>

      {/* Profile Completeness */}
      {completeness < 100 && (
        <div className="mb-8 p-4 bg-gold/10 border border-gold/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Profile completeness</span>
            <span className="text-sm font-bold text-gold">{completeness}%</span>
          </div>
          <div className="h-2 bg-paper-light rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            Complete your profile to help us show you the most relevant opportunities.
          </p>
        </div>
      )}

      {/* Profile Info */}
      <div className="space-y-8">
        {/* Founder & Startup */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Founder & Startup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Founder Name" value={user.founderName} />
            <ProfileField label="Startup Name" value={user.startupName} />
            <ProfileField label="Stage" value={stageName} />
            <ProfileField label="Sector" value={sectorName} />
          </div>
        </section>

        {/* Location & Links */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Location & Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="City" value={user.city} />
            <ProfileField
              label="Website"
              value={user.website}
              isLink
            />
          </div>
        </section>

        {/* Account */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileField label="Email" value={user.email} />
            <div>
              <dt className="text-sm text-muted mb-1">Sign-in methods</dt>
              <dd className="flex flex-wrap gap-2">
                {identities.map((identity) => (
                  <span
                    key={identity.provider}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper border border-line text-sm"
                  >
                    {identity.provider === "GOOGLE" && <GoogleIcon className="w-4 h-4" />}
                    {identity.provider === "EMAIL" && <Icon name="mail" className="w-4 h-4" />}
                    {identity.provider}
                  </span>
                ))}
              </dd>
            </div>
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Security
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {identities.some((i) => i.provider === "EMAIL") && (
              <Link
                href="/profile/security"
                className="inline-flex items-center gap-2 px-4 py-2 border border-line text-ink font-medium hover:bg-paper transition-colors"
              >
                <Icon name="lock" className="w-4 h-4" />
                Change password
              </Link>
            )}
            <Link
              href="/profile/security"
              className="inline-flex items-center gap-2 px-4 py-2 border border-line text-ink font-medium hover:bg-paper transition-colors"
            >
              <Icon name="shield" className="w-4 h-4" />
              Manage sign-in methods
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  return (
    <div>
      <dt className="text-sm text-muted mb-1">{label}</dt>
      <dd className="text-ink">
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
            value
          )
        ) : (
          <span className="text-muted italic">Not set</span>
        )}
      </dd>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
