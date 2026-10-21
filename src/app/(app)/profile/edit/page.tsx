"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { meApi } from "@/lib/api/me";
import { getStages, getSectors } from "@/lib/api/lookups";
import { Icon, Input, Button, PageLoader, showToast, PitchDeckUpload } from "@/components/ui";
import { BioLinksEditor, BioLinksEditorRef } from "@/components/ui/bio-links-editor";
import type { LookupResponse, ProfilePatchRequest, PitchDeckResponse } from "@/lib/api/types";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const bioLinksRef = useRef<BioLinksEditorRef>(null);
  
  // Form state
  const [founderName, setFounderName] = useState("");
  const [startupName, setStartupName] = useState("");
  const [stageId, setStageId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  
  // Lookup data
  const [stages, setStages] = useState<LookupResponse[]>([]);
  const [sectors, setSectors] = useState<LookupResponse[]>([]);
  
  // Enriched profile data (bio, links, pitch deck)
  const [pitchDeck, setPitchDeck] = useState<PitchDeckResponse | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form with existing values
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [stagesData, sectorsData] = await Promise.all([
          getStages(),
          getSectors(),
        ]);
        setStages(stagesData);
        setSectors(sectorsData);
        
        // Set current values from user
        if (user) {
          setFounderName(user.founderName || "");
          setStartupName(user.startupName || "");
          setStageId(user.stageId || "");
          setSectorId(user.sectorId || "");
          setCity(user.city || "");
          setWebsite(user.website || "");
        }
        
        // Load pitch deck
        try {
          const deck = await meApi.hasPitchDeck();
          setPitchDeck(deck);
        } catch {
          // Pitch deck may not exist yet
        }
      } catch (err) {
        showToast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!founderName.trim()) {
      newErrors.founderName = "Founder name is required";
    }
    if (!startupName.trim()) {
      newErrors.startupName = "Startup name is required";
    }
    if (!stageId) {
      newErrors.stageId = "Stage is required";
    }
    if (!sectorId) {
      newErrors.sectorId = "Sector is required";
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
    }
    if (website && !isValidUrl(website)) {
      newErrors.website = "Please enter a valid URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setSaving(true);
      
      const data: ProfilePatchRequest = {
        founderName: founderName.trim(),
        startupName: startupName.trim(),
        stageId,
        sectorId,
        city: city.trim(),
        website: website.trim() || undefined,
      };
      
      // Save main profile and bio/links in parallel
      const [, bioLinksSaved] = await Promise.all([
        meApi.updateProfile(data),
        bioLinksRef.current?.save() ?? true,
      ]);
      
      if (!bioLinksSaved) {
        // Bio/links validation failed, don't navigate
        return;
      }
      
      await refreshUser();
      
      showToast.success("Profile updated successfully");
      router.push("/profile");
    } catch (err) {
      showToast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/profile");
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/profile"
          className="p-2 hover:bg-paper transition-colors"
          aria-label="Back to profile"
        >
          <Icon name="chevron-left" className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-ink">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Founder & Startup */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Founder & Startup
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="founderName" className="block text-sm font-medium text-ink mb-1">
                Founder Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="founderName"
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="Your name"
                error={!!errors.founderName}
              />
              {errors.founderName && (
                <p className="mt-1 text-sm text-red-500">{errors.founderName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="startupName" className="block text-sm font-medium text-ink mb-1">
                Startup Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="startupName"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="Your startup's name"
                error={!!errors.startupName}
              />
              {errors.startupName && (
                <p className="mt-1 text-sm text-red-500">{errors.startupName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-ink mb-1">
                Stage <span className="text-red-500">*</span>
              </label>
              <select
                id="stage"
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className={`w-full h-10 px-3 border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-green ${
                  errors.stageId ? "border-red-500" : "border-line"
                }`}
              >
                <option value="">Select stage</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              {errors.stageId && (
                <p className="mt-1 text-sm text-red-500">{errors.stageId}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-ink mb-1">
                Sector <span className="text-red-500">*</span>
              </label>
              <select
                id="sector"
                value={sectorId}
                onChange={(e) => setSectorId(e.target.value)}
                className={`w-full h-10 px-3 border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-green ${
                  errors.sectorId ? "border-red-500" : "border-line"
                }`}
              >
                <option value="">Select sector</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              {errors.sectorId && (
                <p className="mt-1 text-sm text-red-500">{errors.sectorId}</p>
              )}
            </div>
          </div>
        </section>

        {/* Location & Links */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Location & Links
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-ink mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Hyderabad"
                error={!!errors.city}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-ink mb-1">
                Website
              </label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                error={!!errors.website}
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-500">{errors.website}</p>
              )}
            </div>
          </div>
        </section>

        {/* Email - Read Only */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Account
          </h2>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
              Email
            </label>
            <Input
              id="email"
              value={user.email || ""}
              disabled
              className="bg-paper-light text-muted cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-muted">
              Email cannot be changed. Contact support if you need to update your email address.
            </p>
          </div>
        </section>

        {/* Bio & Links */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Bio & Links
          </h2>
          <BioLinksEditor
            ref={bioLinksRef}
            initialBio={user.profile?.bio || ""}
            initialLinks={user.profile?.links || []}
          />
        </section>

        {/* Pitch Deck */}
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Pitch Deck
          </h2>
          <PitchDeckUpload
            initialPitchDeck={pitchDeck}
            onUploadSuccess={(deck) => {
              setPitchDeck(deck);
              showToast.success("Pitch deck uploaded");
            }}
            onDeleteSuccess={() => {
              setPitchDeck(null);
              showToast.success("Pitch deck removed");
            }}
          />
        </section>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-6 border-t border-line">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
