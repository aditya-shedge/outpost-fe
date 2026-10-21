"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createChallenge } from "@/lib/api/admin";
import { getSectors } from "@/lib/api/lookups";
import type { ChallengeRequest, LookupResponse } from "@/lib/api/types";
import { Button, Input, Select, LoadingSpinner } from "@/components/ui";
import { toast } from "sonner";

export default function AdminChallengeNewPage() {
  const router = useRouter();

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
    async function loadLookups() {
      try {
        const sectorsData = await getSectors();
        setSectors(sectorsData);
      } catch (error) {
        console.error("Failed to load lookups:", error);
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    }

    loadLookups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await createChallenge(formData);
      toast.success("Challenge created");
      router.push("/admin/challenges");
    } catch (error) {
      console.error("Failed to create challenge:", error);
      toast.error("Failed to create challenge");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/challenges"
          className="text-sm text-gray-400 hover:text-white mb-2 inline-block"
        >
          ← Back to Challenges
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Challenge</h1>
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
            />
          </div>
        </div>

        <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Details (optional)</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Problem Statement
            </label>
            <textarea
              value={formData.problemStatement}
              onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
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
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/challenges">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Challenge"}
          </Button>
        </div>
      </form>
    </div>
  );
}
