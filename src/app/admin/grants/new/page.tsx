"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createGrant } from "@/lib/api/admin";
import { getStages, getSectors } from "@/lib/api/lookups";
import type { GrantRequest, LookupResponse } from "@/lib/api/types";
import { Button, Input, Select, LoadingSpinner } from "@/components/ui";
import { toast } from "sonner";

export default function AdminGrantNewPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stages, setStages] = useState<LookupResponse[]>([]);
  const [sectors, setSectors] = useState<LookupResponse[]>([]);

  const [formData, setFormData] = useState<GrantRequest>({
    name: "",
    issuingBody: "",
    issuingBodyType: "CENTRAL",
    type: "GRANT",
    amountMin: undefined,
    amountMax: undefined,
    amountDisplay: "",
    deadline: undefined,
    summary: "",
    eligibility: "",
    whatIsFunded: "",
    howToApply: "",
    sourceUrl: "",
    stageIds: [],
    sectorIds: [],
  });

  useEffect(() => {
    async function loadLookups() {
      try {
        const [stagesData, sectorsData] = await Promise.all([
          getStages(),
          getSectors(),
        ]);
        setStages(stagesData);
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

    if (!formData.stageIds?.length || !formData.sectorIds?.length) {
      toast.error("Please select at least one stage and one sector");
      return;
    }

    setIsSaving(true);

    try {
      await createGrant(formData);
      toast.success("Grant created");
      router.push("/admin/grants");
    } catch (error) {
      console.error("Failed to create grant:", error);
      toast.error("Failed to create grant");
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
          href="/admin/grants"
          className="text-sm text-gray-400 hover:text-white mb-2 inline-block"
        >
          ← Back to Grants
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Grant</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Grant Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Issuing Body *
              </label>
              <Input
                value={formData.issuingBody}
                onChange={(e) => setFormData({ ...formData, issuingBody: e.target.value })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Issuing Body Type *
              </label>
              <Select
                value={formData.issuingBodyType}
                onChange={(e) => setFormData({ ...formData, issuingBodyType: e.target.value as GrantRequest["issuingBodyType"] })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              >
                <option value="CENTRAL">Central Government</option>
                <option value="STATE">State Government</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Type *
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as GrantRequest["type"] })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              >
                <option value="GRANT">Grant</option>
                <option value="SUBSIDY">Subsidy</option>
                <option value="SCHEME">Scheme</option>
                <option value="INCENTIVE">Incentive</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Deadline
              </label>
              <Input
                type="date"
                value={formData.deadline || ""}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value || undefined })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount Min (₹)
              </label>
              <Input
                type="number"
                value={formData.amountMin || ""}
                onChange={(e) => setFormData({ ...formData, amountMin: e.target.value ? Number(e.target.value) : undefined })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount Max (₹)
              </label>
              <Input
                type="number"
                value={formData.amountMax || ""}
                onChange={(e) => setFormData({ ...formData, amountMax: e.target.value ? Number(e.target.value) : undefined })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount Display
              </label>
              <Input
                value={formData.amountDisplay}
                onChange={(e) => setFormData({ ...formData, amountDisplay: e.target.value })}
                className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
                placeholder="e.g., Up to ₹50 Lakhs"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Eligibility *
            </label>
            <textarea
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              What is Funded *
            </label>
            <textarea
              value={formData.whatIsFunded}
              onChange={(e) => setFormData({ ...formData, whatIsFunded: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              How to Apply *
            </label>
            <textarea
              value={formData.howToApply}
              onChange={(e) => setFormData({ ...formData, howToApply: e.target.value })}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm resize-none h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Source URL *
            </label>
            <Input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="bg-[#1a1a2e] border-[#2d2d4a] text-white"
              required
            />
          </div>
        </div>

        <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Targeting *</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stages (select at least one)
            </label>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    const ids = formData.stageIds || [];
                    setFormData({
                      ...formData,
                      stageIds: ids.includes(stage.id!)
                        ? ids.filter((id) => id !== stage.id)
                        : [...ids, stage.id!],
                    });
                  }}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    formData.stageIds?.includes(stage.id!)
                      ? "bg-gold text-ink border-gold"
                      : "bg-transparent text-gray-400 border-[#2d2d4a] hover:border-gold"
                  }`}
                >
                  {stage.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sectors (select at least one)
            </label>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => {
                    const ids = formData.sectorIds || [];
                    setFormData({
                      ...formData,
                      sectorIds: ids.includes(sector.id!)
                        ? ids.filter((id) => id !== sector.id)
                        : [...ids, sector.id!],
                    });
                  }}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    formData.sectorIds?.includes(sector.id!)
                      ? "bg-gold text-ink border-gold"
                      : "bg-transparent text-gray-400 border-[#2d2d4a] hover:border-gold"
                  }`}
                >
                  {sector.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/grants">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Grant"}
          </Button>
        </div>
      </form>
    </div>
  );
}
