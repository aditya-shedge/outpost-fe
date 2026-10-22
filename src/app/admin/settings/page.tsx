"use client";

import { useState, useEffect } from "react";
import { getAiSettings, updateAiSettings, AiFeatureFlags } from "@/lib/api/admin";
import { showToast } from "@/components/ui";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AiFeatureFlags>({
    grants: false,
    challenges: false,
    mentors: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getAiSettings();
        setSettings(data);
      } catch (err) {
        showToast.error("Failed to load AI settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof AiFeatureFlags) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSaving(true);

    try {
      await updateAiSettings(newSettings);
      showToast.success(`AI ranking for ${key} ${newSettings[key] ? "enabled" : "disabled"}`);
    } catch (err) {
      // Revert on error
      setSettings(settings);
      showToast.error("Failed to update AI settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage platform-wide settings</p>
      </div>

      {/* AI Ranking Settings */}
      <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <SparklesIcon className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold text-white">AI Ranking</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Enable or disable AI-powered ranking for each module. When disabled, users won&apos;t see the AI toggle option on listing pages.
        </p>

        <div className="space-y-4">
          <ToggleRow
            label="Grants"
            description="AI ranking for grants listing"
            enabled={settings.grants ?? false}
            onToggle={() => handleToggle("grants")}
            disabled={saving}
          />
          <ToggleRow
            label="Challenges"
            description="AI ranking for challenges listing"
            enabled={settings.challenges ?? false}
            onToggle={() => handleToggle("challenges")}
            disabled={saving}
          />
          <ToggleRow
            label="Mentors"
            description="AI ranking for mentors listing"
            enabled={settings.mentors ?? false}
            onToggle={() => handleToggle("mentors")}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  disabled,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2d2d4a] last:border-0">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? "bg-gold" : "bg-[#2d2d4a]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5.5 8.5l13 7M18.5 8.5l-13 7" />
    </svg>
  );
}
