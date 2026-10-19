"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { meApi } from "@/lib/api/me";
import { useStages, useSectors } from "@/lib/hooks/useLookups";
import { ApiClientError } from "@/lib/api/client";
import { Button, Input, Icon } from "@/components/ui";
import { showToast } from "@/components/ui/toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser, isOnboarded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the cached lookup hooks
  const { data: stages, isLoading: stagesLoading, error: stagesError, retry: retryStages } = useStages();
  const { data: sectors, isLoading: sectorsLoading, error: sectorsError, retry: retrySectors } = useSectors();

  const [formData, setFormData] = useState({
    founderName: "",
    startupName: "",
    stageId: "",
    sectorId: "",
    city: "",
    website: "",
  });

  // Track current step for visual progress
  const [currentStep, setCurrentStep] = useState(1);

  // Guard: if already onboarded, redirect to discover
  useEffect(() => {
    if (isOnboarded) {
      router.replace("/discover");
    }
  }, [isOnboarded, router]);

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
      showToast.success("Welcome to Outpost! Let's find opportunities for you.");
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

  // Step validation
  const isStep1Valid = formData.founderName.trim() !== "" && formData.startupName.trim() !== "";
  const isStep2Valid = formData.stageId !== "" && formData.sectorId !== "";
  const isFormValid = isStep1Valid && isStep2Valid;

  // Update current step based on filled fields
  useEffect(() => {
    if (isStep2Valid) {
      setCurrentStep(3);
    } else if (isStep1Valid) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [isStep1Valid, isStep2Valid]);

  const lookupsLoading = stagesLoading || sectorsLoading;

  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg">
      <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
        Complete your profile
      </h1>
      <p className="text-muted text-sm mb-6">
        Tell us a bit about yourself and your startup so we can personalize your
        experience.
      </p>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step <= currentStep
                  ? "bg-ink text-paper-light"
                  : "bg-line text-muted"
              }`}
            >
              {step < currentStep ? (
                <Icon name="check" className="size-4" />
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-colors ${
                  step < currentStep ? "bg-ink" : "bg-line"
                }`}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted">
          {currentStep === 1 && "About you"}
          {currentStep === 2 && "Your startup"}
          {currentStep === 3 && "Location"}
        </span>
      </div>

      {error && (
        <div 
          className="bg-rose-light border border-rose/20 text-rose-dark text-sm p-3 mb-6 flex items-start gap-2"
          role="alert"
        >
          <Icon name="alert-circle" className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Founder and Startup name */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted uppercase tracking-wider">
            <span className="bg-ink text-paper-light w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
            About you
          </div>
          
          <div>
            <label
              htmlFor="founderName"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Your name <span className="text-rose">*</span>
            </label>
            <Input
              type="text"
              id="founderName"
              name="founderName"
              value={formData.founderName}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label
              htmlFor="startupName"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Startup name <span className="text-rose">*</span>
            </label>
            <Input
              type="text"
              id="startupName"
              name="startupName"
              value={formData.startupName}
              onChange={handleChange}
              required
              placeholder="Acme Inc"
            />
          </div>
        </div>

        {/* Step 2: Stage and Sector */}
        <div className="space-y-4 pt-4 border-t border-line">
          <div className="flex items-center gap-2 text-xs font-medium text-muted uppercase tracking-wider">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isStep1Valid ? 'bg-ink text-paper-light' : 'bg-line text-muted'}`}>2</span>
            Your startup
          </div>
          
          <div>
            <label
              htmlFor="stageId"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Stage <span className="text-rose">*</span>
            </label>
            {stagesError ? (
              <div className="flex items-center gap-2 text-sm text-rose-dark">
                <span>Failed to load stages.</span>
                <button
                  type="button"
                  onClick={retryStages}
                  className="underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                id="stageId"
                name="stageId"
                value={formData.stageId}
                onChange={handleChange}
                required
                disabled={stagesLoading}
                className="w-full h-12 px-4 border border-line bg-paper-light text-ink focus:outline-none focus:border-ink transition-colors disabled:opacity-50"
              >
                <option value="">
                  {stagesLoading ? "Loading stages..." : "Select your startup stage"}
                </option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="sectorId"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Sector <span className="text-rose">*</span>
            </label>
            {sectorsError ? (
              <div className="flex items-center gap-2 text-sm text-rose-dark">
                <span>Failed to load sectors.</span>
                <button
                  type="button"
                  onClick={retrySectors}
                  className="underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                id="sectorId"
                name="sectorId"
                value={formData.sectorId}
                onChange={handleChange}
                required
                disabled={sectorsLoading}
                className="w-full h-12 px-4 border border-line bg-paper-light text-ink focus:outline-none focus:border-ink transition-colors disabled:opacity-50"
              >
                <option value="">
                  {sectorsLoading ? "Loading sectors..." : "Select your sector"}
                </option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Step 3: City and Website */}
        <div className="space-y-4 pt-4 border-t border-line">
          <div className="flex items-center gap-2 text-xs font-medium text-muted uppercase tracking-wider">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isStep2Valid ? 'bg-ink text-paper-light' : 'bg-line text-muted'}`}>3</span>
            Location (optional)
          </div>
          
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              City
            </label>
            <Input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Hyderabad"
            />
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Website
            </label>
            <Input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid || lookupsLoading}
          loading={isSubmitting}
          className="w-full"
          size="lg"
        >
          Complete setup
        </Button>
      </form>
    </div>
  );
}
