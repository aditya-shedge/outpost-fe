"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Brand } from "@/components/ui/brand";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isVerified, isOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated -> login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Not verified -> verify email
    if (!isVerified) {
      router.push("/verify-email");
      return;
    }

    // Already onboarded -> discover
    if (isOnboarded) {
      router.push("/discover");
      return;
    }
  }, [isAuthenticated, isLoading, isVerified, isOnboarded, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse">
          <Brand />
        </div>
      </div>
    );
  }

  // Don't render if not in correct state
  if (!isAuthenticated || !isVerified || isOnboarded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Brand />
        </div>
        {children}
      </div>
    </div>
  );
}
