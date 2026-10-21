"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Icon, Input, showToast } from "@/components/ui";
import { meApi } from "@/lib/api/me";
import type { FounderLink, LinkType, EnrichedProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface BioLinksEditorProps {
  initialBio?: string | null;
  initialLinks?: FounderLink[] | null;
  onSaveSuccess?: (profile: EnrichedProfile) => void;
}

export interface BioLinksEditorRef {
  save: () => Promise<boolean>;
  hasChanges: () => boolean;
}

const MAX_BIO_LENGTH = 2000;
const MAX_LINKS = 5;

const LINK_TYPE_OPTIONS: { value: LinkType; label: string; placeholder: string }[] = [
  { value: "LINKEDIN", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { value: "X", label: "X / Twitter", placeholder: "https://x.com/username" },
  { value: "OTHER", label: "Other", placeholder: "https://example.com" },
];

function validateUrl(url: string, type: LinkType): string | null {
  if (!url.trim()) {
    return "URL is required";
  }

  // Check HTTPS
  if (!url.startsWith("https://")) {
    return "URL must start with https://";
  }

  try {
    const parsed = new URL(url);
    
    // Validate LinkedIn URLs
    if (type === "LINKEDIN" && !parsed.hostname.includes("linkedin.com")) {
      return "Please enter a valid LinkedIn URL";
    }
    
    // Validate X/Twitter URLs
    if (type === "X" && !parsed.hostname.includes("x.com") && !parsed.hostname.includes("twitter.com")) {
      return "Please enter a valid X/Twitter URL";
    }
    
    return null;
  } catch {
    return "Please enter a valid URL";
  }
}

export const BioLinksEditor = forwardRef<BioLinksEditorRef, BioLinksEditorProps>(
  function BioLinksEditor({ initialBio, initialLinks, onSaveSuccess }, ref) {
  const [bio, setBio] = useState(initialBio || "");
  const [links, setLinks] = useState<FounderLink[]>(initialLinks || []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChangesState, setHasChangesState] = useState(false);

  // Track changes
  useEffect(() => {
    const bioChanged = bio !== (initialBio || "");
    const linksChanged = JSON.stringify(links) !== JSON.stringify(initialLinks || []);
    setHasChangesState(bioChanged || linksChanged);
  }, [bio, links, initialBio, initialLinks]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate bio length
    if (bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Bio must be ${MAX_BIO_LENGTH} characters or less`;
    }

    // Validate links
    links.forEach((link, index) => {
      const error = validateUrl(link.url, link.type);
      if (error) {
        newErrors[`link-${index}`] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const save = async (): Promise<boolean> => {
    // Always attempt to save if there are links or bio
    // (hasChangesState may be stale in closure)
    if (!validate()) return false;

    try {
      const result = await meApi.updateEnrichedProfile({
        bio: bio.trim() || null,
        links: links.length > 0 ? links : null,
      });
      
      setHasChangesState(false);
      onSaveSuccess?.(result);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update bio and links";
      showToast.error(message);
      return false;
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    save,
    hasChanges: () => hasChangesState,
  }));

  const handleAddLink = () => {
    if (links.length >= MAX_LINKS) {
      showToast.error(`You can add up to ${MAX_LINKS} links`);
      return;
    }
    setLinks([...links, { type: "OTHER", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
    
    // Clear any errors for this link
    const newErrors = { ...errors };
    delete newErrors[`link-${index}`];
    setErrors(newErrors);
  };

  const handleLinkChange = (index: number, field: "type" | "url", value: string) => {
    const newLinks = [...links];
    if (field === "type") {
      newLinks[index] = { ...newLinks[index], type: value as LinkType };
    } else {
      newLinks[index] = { ...newLinks[index], url: value };
    }
    setLinks(newLinks);
    
    // Clear error when user edits
    if (errors[`link-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`link-${index}`];
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="bio" className="text-sm font-medium text-ink">
            Bio
          </label>
          <span className={cn(
            "text-xs",
            bio.length > MAX_BIO_LENGTH ? "text-red-500" : "text-muted"
          )}>
            {bio.length} / {MAX_BIO_LENGTH}
          </span>
        </div>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself and your startup..."
          rows={5}
          className={cn(
            "w-full px-3 py-2 border bg-white text-ink text-sm",
            "focus:outline-none focus:ring-2 focus:ring-green",
            "resize-none",
            errors.bio ? "border-red-500" : "border-line"
          )}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
        )}
        <p className="mt-1 text-xs text-muted">
          Share your background, what your startup does, and what you're working on.
        </p>
      </div>

      {/* Links Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-ink">
            Links
          </label>
          <span className="text-xs text-muted">
            {links.length} / {MAX_LINKS}
          </span>
        </div>

        {links.length > 0 && (
          <div className="space-y-3 mb-4">
            {links.map((link, index) => (
              <div key={index} className="flex items-start gap-3">
                {/* Link Type Select */}
                <select
                  value={link.type}
                  onChange={(e) => handleLinkChange(index, "type", e.target.value)}
                  className="w-32 h-10 px-2 border border-line bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-green"
                >
                  {LINK_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* URL Input */}
                <div className="flex-1">
                  <Input
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                    placeholder={LINK_TYPE_OPTIONS.find(o => o.value === link.type)?.placeholder}
                    error={!!errors[`link-${index}`]}
                  />
                  {errors[`link-${index}`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`link-${index}`]}</p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="p-2 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Remove link"
                >
                  <Icon name="x" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {links.length < MAX_LINKS && (
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center gap-2 text-sm text-green hover:underline"
          >
            <Icon name="plus" className="w-4 h-4" />
            Add link
          </button>
        )}

        {links.length === 0 && (
          <p className="text-sm text-muted mt-2">
            Add links to your LinkedIn, X/Twitter, or other profiles.
          </p>
        )}
      </div>
    </div>
  );
});
