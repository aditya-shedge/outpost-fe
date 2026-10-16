"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Brand } from "@/components/ui/brand";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isVerified, isOnboarded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isVerified) {
      router.push("/verify-email");
      return;
    }

    if (!isOnboarded) {
      router.push("/onboarding");
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

  // Don't render if not fully authenticated
  if (!isAuthenticated || !isVerified || !isOnboarded) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
