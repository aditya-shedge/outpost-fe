"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminChallenge, updateChallenge, publishChallenge, unpublishChallenge } from "@/lib/api/admin";
import { getSectors } from "@/lib/api/lookups";
import type { ChallengeResponse, ChallengeRequest, LookupResponse } from "@/lib/api/types";
import { Button, Input, Select, LoadingSpinner } from "@/components/ui";
import { toast } from "sonner";

export default function AdminChallengeEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sectors, setSectors] = useState<LookupResponse[]>([]);

  const [formData, setFormData] = useState<ChallengeRequest>({
    corporateName: "",
    corporateLogoUrl: "",
    title: "",
    sectorId: "",
    theme: "",
    deadline: "",
    applyUrl: "",
    problemStatement: "",
    lookingFor: "",
    eligibility: "",
    timeline: "",
    offerType: undefined,
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [challengeData, sectorsData] = await Promise.all([
          getAdminChallenge(id),
          getSectors(),
        ]);

        if (!challengeData) {
          toast.error("Challenge not found");
          router.push("/admin/challenges");
          return;
        }

        setChallenge(challengeData);
        setSectors(sectorsData);

        setFormData({
          corporateName: challengeData.corporateName || "",
          corporateLogoUrl: challengeData.corporateLogoUrl || "",
          title: challengeData.title || "",
          sectorId: challengeData.sectorId || "",
          theme: challengeData.theme || "",
          deadline: challengeData.deadline || "",
          applyUrl: challengeData.applyUrl || "",
          problemStatement: challengeData.problemStatement || "",
          lookingFor: challengeData.lookingFor || "",
          eligibility: challengeData.eligibility || "",
          timeline: challengeData.timeline || "",
          offerType: challengeData.offerType,
        });
      } catch (error) {
        console.error("Failed to load challenge:", error);
        toast.error("Failed to load challenge");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateChallenge(id, formData);
      toast.success("Challenge updated");
      router.push("/admin/challenges");
    } catch (error) {
      console.error("Failed to update challenge:", error);
      toast.error("Failed to update challenge");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!challenge) return;
    try {
      if (challenge.published) {
        await unpublishChallenge(id);
        toast.success("Challenge unpublished");
      } else {
        await publishChallenge(id);
        toast.success("Challenge published");
      }
      const updated = await getAdminChallenge(id);
      setChallenge(updated);
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  const isClosed = challenge.status === "CLOSED";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/challenges"
            className="text-sm text-gray-400 hover:text-white mb-2 inline-block"
          >
            ← Back to Challenges
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Challenge</h1>
          {isClosed && (
            <p className="text-sm text-orange-400 mt-1">This challenge is closed and cannot be edited.</p>
          )}
        </div>
        {!isClosed && (
          <Button variant="secondary" onClick={handlePublishToggle}>
            {challenge.published ? "Unpublish" : "Publish"}
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              required
              disabled={isClosed}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Corporate Name *
              </label>
              <Input
                value={formData.corporateName}
                onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                required
                disabled={isClosed}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Corporate Logo URL
              </label>
              <Input
                type="url"
                value={formData.corporateLogoUrl}
                onChange={(e) => setFormData({ ...formData, corporateLogoUrl: e.target.value })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                disabled={isClosed}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sector *
              </label>
              <Select
                value={formData.sectorId}
                onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                required
                disabled={isClosed}
              >
                <option value="">Select a sector</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Theme *
              </label>
              <Input
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                required
                disabled={isClosed}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Deadline *
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                required
                disabled={isClosed}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Offer Type
              </label>
              <Select
                value={formData.offerType || ""}
                onChange={(e) => setFormData({ ...formData, offerType: e.target.value as ChallengeRequest["offerType"] || undefined })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                disabled={isClosed}
              >
                <option value="">Select offer type</option>
                <option value="PILOT">Pilot</option>
                <option value="POC">POC</option>
                <option value="PARTNERSHIP">Partnership</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Apply URL *
            </label>
            <Input
              type="url"
              value={formData.applyUrl}
              onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
              className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              required
              disabled={isClosed}
            />
          </div>
        </div>

        <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Problem Statement
            </label>
            <textarea
              value={formData.problemStatement}
              onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              disabled={isClosed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              What We&apos;re Looking For
            </label>
            <textarea
              value={formData.lookingFor}
              onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              disabled={isClosed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Eligibility
            </label>
            <textarea
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              disabled={isClosed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Timeline
            </label>
            <textarea
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              disabled={isClosed}
            />
          </div>
        </div>

        {!isClosed && (
          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/challenges">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
