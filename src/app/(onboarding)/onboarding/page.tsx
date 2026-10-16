"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { meApi } from "@/lib/api/me";
import { getStages, getSectors } from "@/lib/api/lookups";
import { ApiClientError } from "@/lib/api/client";
import type { LookupResponse } from "@/lib/api/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser, isOnboarded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lookups
  const [stages, setStages] = useState<LookupResponse[]>([]);
  const [sectors, setSectors] = useState<LookupResponse[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);

  const [formData, setFormData] = useState({
    founderName: "",
    startupName: "",
    stageId: "",
    sectorId: "",
    city: "",
    website: "",
  });

  // Guard: if already onboarded, redirect to discover
  useEffect(() => {
    if (isOnboarded) {
      router.replace("/discover");
    }
  }, [isOnboarded, router]);

  // Fetch lookups on mount
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [stagesData, sectorsData] = await Promise.all([
          getStages(),
          getSectors(),
        ]);
        setStages(stagesData);
        setSectors(sectorsData);
      } catch (err) {
        console.error("Failed to fetch lookups:", err);
      } finally {
        setLookupsLoading(false);
      }
    };
    fetchLookups();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guard: don't submit if already onboarded
    if (isOnboarded) {
      router.replace("/discover");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      await meApi.completeOnboarding({
        founderName: formData.founderName,
        startupName: formData.startupName,
        stageId: formData.stageId,
        sectorId: formData.sectorId,
        city: formData.city || undefined,
        website: formData.website || undefined,
      });

      await refreshUser();
      router.push("/discover");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to complete onboarding. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.founderName &&
    formData.startupName &&
    formData.stageId &&
    formData.sectorId;

  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg">
      <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
        Complete your profile
      </h1>
      <p className="text-muted text-sm mb-6">
        Tell us a bit about yourself and your startup so we can personalize your
        experience.
      </p>

      {error && (
        <div className="bg-rose-light border border-rose/20 text-rose-dark text-sm p-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="founderName"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            Your name <span className="text-rose">*</span>
          </label>
          <input
            type="text"
            id="founderName"
            name="founderName"
            value={formData.founderName}
            onChange={handleChange}
            required
            className="w-full h-12 px-4 border border-line bg-paper-light text-ink placeholder:text-placeholder focus:outline-none focus:border-ink transition-colors"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label
            htmlFor="startupName"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            Startup name <span className="text-rose">*</span>
          </label>
          <input
            type="text"
            id="startupName"
            name="startupName"
            value={formData.startupName}
            onChange={handleChange}
            required
            className="w-full h-12 px-4 border border-line bg-paper-light text-ink placeholder:text-placeholder focus:outline-none focus:border-ink transition-colors"
            placeholder="Acme Inc"
          />
        </div>

        <div>
          <label
            htmlFor="stageId"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            Stage <span className="text-rose">*</span>
          </label>
          <select
            id="stageId"
            name="stageId"
            value={formData.stageId}
            onChange={handleChange}
            required
            disabled={lookupsLoading}
            className="w-full h-12 px-4 border border-line bg-paper-light text-ink focus:outline-none focus:border-ink transition-colors disabled:opacity-50"
          >
            <option value="">
              {lookupsLoading ? "Loading..." : "Select a stage"}
            </option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="sectorId"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            Sector <span className="text-rose">*</span>
          </label>
          <select
            id="sectorId"
            name="sectorId"
            value={formData.sectorId}
            onChange={handleChange}
            required
            disabled={lookupsLoading}
            className="w-full h-12 px-4 border border-line bg-paper-light text-ink focus:outline-none focus:border-ink transition-colors disabled:opacity-50"
          >
            <option value="">
              {lookupsLoading ? "Loading..." : "Select a sector"}
            </option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full h-12 px-4 border border-line bg-paper-light text-ink placeholder:text-placeholder focus:outline-none focus:border-ink transition-colors"
            placeholder="Hyderabad"
          />
        </div>

        <div>
          <label
            htmlFor="website"
            className="block text-sm font-semibold text-ink mb-1.5"
          >
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full h-12 px-4 border border-line bg-paper-light text-ink placeholder:text-placeholder focus:outline-none focus:border-ink transition-colors"
            placeholder="https://example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full h-12 flex items-center justify-center gap-3 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Complete setup"}
        </button>
      </form>
    </div>
  );
}
