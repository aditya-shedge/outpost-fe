"use client";

import { useState } from "react";
import Link from "next/link";
import { applyMentor } from "@/lib/api/mentors";
import { Icon, LoadingSpinner } from "@/components/ui";
import type { MentorApplicationRequest } from "@/lib/api/types";
import { ApiClientError } from "@/lib/api/client";

const EXPERTISE_OPTIONS = [
  "Fundraising",
  "Product",
  "Marketing",
  "Sales",
  "Operations",
  "Technology",
  "Legal",
  "Finance",
  "HR",
  "Strategy",
  "Design",
  "Growth",
];

export default function MentorApplyPage() {
  const [formData, setFormData] = useState<MentorApplicationRequest>({
    name: "",
    email: "",
    headline: "",
    bio: "",
    expertise: [],
    calcomUrl: "",
    photoUrl: "",
    linkedinUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.headline?.trim()) {
      newErrors.headline = "Headline is required";
    }

    if (!formData.bio?.trim()) {
      newErrors.bio = "Bio is required";
    }

    if (!formData.expertise || formData.expertise.length === 0) {
      newErrors.expertise = "Please select at least 1 area of expertise";
    } else if (formData.expertise.length > 5) {
      newErrors.expertise = "Please select no more than 5 areas of expertise";
    }

    if (!formData.calcomUrl?.trim()) {
      newErrors.calcomUrl = "Cal.com URL is required";
    } else if (!formData.calcomUrl.includes("cal.com")) {
      newErrors.calcomUrl = "Please enter a valid cal.com URL";
    }

    if (formData.photoUrl && !formData.photoUrl.startsWith("http")) {
      newErrors.photoUrl = "Please enter a valid URL";
    }

    if (formData.linkedinUrl && !formData.linkedinUrl.includes("linkedin.com")) {
      newErrors.linkedinUrl = "Please enter a valid LinkedIn URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await applyMentor(formData);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setSubmitError("An application with this email has already been submitted.");
        } else if (err.status === 429) {
          setSubmitError("Too many applications. Please try again later.");
        } else {
          setSubmitError(err.message || "Failed to submit application. Please try again.");
        }
      } else {
        setSubmitError("Failed to submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpertise = (exp: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise?.includes(exp)
        ? prev.expertise.filter((e) => e !== exp)
        : [...(prev.expertise || []), exp],
    }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-light rounded-full flex items-center justify-center">
            <Icon name="check" className="size-8 text-green" />
          </div>
          <h1 className="font-serif font-bold text-2xl mb-3">Application Submitted!</h1>
          <p className="text-muted mb-6">
            Thank you for applying to become a mentor. Our team will review your application
            and get back to you within 5-7 business days.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <p className="mono-label text-green-dark flex items-center justify-center gap-2 mb-4">
            <span className="w-[7px] h-[7px] rounded-full bg-green" />
            BECOME A MENTOR
          </p>
          <h1 className="font-serif font-bold text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.04em] mb-4">
            Share Your Expertise
          </h1>
          <p className="text-muted max-w-md mx-auto">
            Join our community of mentors and help founders navigate their startup journey.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Submit error */}
          {submitError && (
            <div className="p-4 bg-rose-light border border-rose text-rose-dark text-sm">
              {submitError}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
              Full Name <span className="text-rose">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className={`w-full h-11 px-4 bg-paper-light border text-ink text-sm focus:outline-none transition-colors ${
                errors.name ? "border-rose focus:border-rose" : "border-line focus:border-green"
              }`}
              placeholder="Your full name"
            />
            {errors.name && <p className="mt-1 text-xs text-rose">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
              Email <span className="text-rose">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className={`w-full h-11 px-4 bg-paper-light border text-ink text-sm focus:outline-none transition-colors ${
                errors.email ? "border-rose focus:border-rose" : "border-line focus:border-green"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-rose">{errors.email}</p>}
          </div>

          {/* Headline */}
          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-ink mb-1.5">
              Headline <span className="text-rose">*</span>
            </label>
            <input
              id="headline"
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
              className={`w-full h-11 px-4 bg-paper-light border text-ink text-sm focus:outline-none transition-colors ${
                errors.headline ? "border-rose focus:border-rose" : "border-line focus:border-green"
              }`}
              placeholder="e.g., CEO at TechCorp | Ex-Google | Angel Investor"
            />
            {errors.headline && <p className="mt-1 text-xs text-rose">{errors.headline}</p>}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-ink mb-1.5">
              Bio <span className="text-rose">*</span>
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 bg-paper-light border text-ink text-sm focus:outline-none transition-colors resize-none ${
                errors.bio ? "border-rose focus:border-rose" : "border-line focus:border-green"
              }`}
              placeholder="Tell us about your background and what you can help founders with..."
            />
            {errors.bio && <p className="mt-1 text-xs text-rose">{errors.bio}</p>}
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Areas of Expertise <span className="text-rose">*</span>
              <span className="font-normal text-muted ml-1">(select 1-5)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => toggleExpertise(exp)}
                  className={`px-3 py-1.5 text-sm border transition-colors ${
                    formData.expertise?.includes(exp)
                      ? "bg-green text-white border-green"
                      : "bg-paper-light border-line text-muted hover:border-green hover:text-green-dark"
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
            {errors.expertise && <p className="mt-1 text-xs text-rose">{errors.expertise}</p>}
          </div>

          {/* Cal.com URL */}
          <div>
            <label htmlFor="calcomUrl" className="block text-sm font-medium text-ink mb-1.5">
              Cal.com Booking URL <span className="text-rose">*</span>
            </label>
            <input
              id="calcomUrl"
              type="url"
              value={formData.calcomUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, calcomUrl: e.target.value }))}
              className={`w-full h-11 px-4 bg-paper-light border text-ink text-sm focus:outline-none transition-colors ${
                errors.calcomUrl ? "border-rose focus:border-rose" : "border-line focus:border-green"
              }`}
              placeholder="https://cal.com/yourname"
            />
            {errors.calcomUrl && <p className="mt-1 text-xs text-rose">{errors.calcomUrl}</p>}
            <p className="mt-1 text-xs text-muted">
              Don&apos;t have one?{" "}
              <a href="https://cal.com" target="_blank" rel="noopener noreferrer" className="text-green-dark hover:underline">
                Create a free Cal.com account
              </a>
            </p>
          </div>

          {/* Photo URL */}
          <div>
            <label htmlFor="photoUrl" className="block text-sm font-medium text-ink mb-1.5">
              Photo URL <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="photoUrl"
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, photoUrl: e.target.value }))}
              className={`w-full h-11 px-4 bg-paper-light border text-ink text-sm focus:outline-none transition-colors ${
                errors.photoUrl ? "border-rose focus:border-rose" : "border-line focus:border-green"
              }`}
              placeholder="https://example.com/your-photo.jpg"
            />
            {errors.photoUrl && <p className="mt-1 text-xs text-rose">{errors.photoUrl}</p>}
          </div>

          {/* LinkedIn URL */}
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-ink mb-1.5">
              LinkedIn URL <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
              className={`w-full h-11 px-4 bg-paper-light border text-ink text-sm focus:outline-none transition-colors ${
                errors.linkedinUrl ? "border-rose focus:border-rose" : "border-line focus:border-green"
              }`}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {errors.linkedinUrl && <p className="mt-1 text-xs text-rose">{errors.linkedinUrl}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-green text-white text-sm font-medium hover:bg-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
