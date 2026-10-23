"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, showToast } from "@/components/ui";
import { api } from "@/lib/api/client";

interface MentorApplicationRequest {
  name: string;
  email: string;
  headline: string;
  bio: string;
  expertise: string[];
  calcomUrl?: string;
  photoUrl?: string;
  linkedinUrl?: string;
}

const EXPERTISE_OPTIONS = [
  "Product",
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Fundraising",
  "Operations",
  "Legal",
  "Finance",
  "HR",
  "Strategy",
  "Growth",
];

export default function BecomeMentorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.headline.trim()) {
      newErrors.headline = "Headline is required";
    }
    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    }
    if (formData.expertise.length === 0) {
      newErrors.expertise = "Select at least one area of expertise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/v1/mentors/apply", {
        ...formData,
        calcomUrl: formData.calcomUrl || undefined,
        photoUrl: formData.photoUrl || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
      });
      showToast.success("Application submitted! We'll review it and get back to you.");
      router.push("/mentors");
    } catch (error) {
      showToast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpertise = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise],
    }));
    if (errors.expertise) {
      setErrors((prev) => ({ ...prev, expertise: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2">Become a Mentor</h1>
        <p className="text-muted">
          Share your expertise with early-stage founders. Fill out this form and our team will review your application.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Headline */}
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-ink mb-1">
            Headline <span className="text-red-500">*</span>
          </label>
          <Input
            id="headline"
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="VP of Product at TechCorp"
            className={errors.headline ? "border-red-500" : ""}
          />
          <p className="text-xs text-muted mt-1">Your current role and company</p>
          {errors.headline && <p className="text-sm text-red-500 mt-1">{errors.headline}</p>}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-ink mb-1">
            Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell founders about your experience and how you can help them..."
            rows={4}
            className={`w-full px-3 py-2 border bg-paper text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent ${
              errors.bio ? "border-red-500" : "border-line"
            }`}
          />
          {errors.bio && <p className="text-sm text-red-500 mt-1">{errors.bio}</p>}
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Areas of Expertise <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_OPTIONS.map((expertise) => (
              <button
                key={expertise}
                type="button"
                onClick={() => toggleExpertise(expertise)}
                className={`px-3 py-1.5 text-sm border transition-colors ${
                  formData.expertise.includes(expertise)
                    ? "bg-green text-white border-green"
                    : "bg-paper text-ink border-line hover:border-ink"
                }`}
              >
                {expertise}
              </button>
            ))}
          </div>
          {errors.expertise && <p className="text-sm text-red-500 mt-1">{errors.expertise}</p>}
        </div>

        {/* Cal.com URL */}
        <div>
          <label htmlFor="calcomUrl" className="block text-sm font-medium text-ink mb-1">
            Cal.com Booking URL
          </label>
          <Input
            id="calcomUrl"
            type="url"
            value={formData.calcomUrl}
            onChange={(e) => setFormData({ ...formData, calcomUrl: e.target.value })}
            placeholder="https://cal.com/yourname"
          />
          <p className="text-xs text-muted mt-1">
            Your Cal.com scheduling link for founders to book sessions
          </p>
        </div>

        {/* LinkedIn URL */}
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-ink mb-1">
            LinkedIn Profile
          </label>
          <Input
            id="linkedinUrl"
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        {/* Photo URL */}
        <div>
          <label htmlFor="photoUrl" className="block text-sm font-medium text-ink mb-1">
            Photo URL
          </label>
          <Input
            id="photoUrl"
            type="url"
            value={formData.photoUrl}
            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            placeholder="https://example.com/your-photo.jpg"
          />
          <p className="text-xs text-muted mt-1">
            Link to your professional photo (we recommend a square image)
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
