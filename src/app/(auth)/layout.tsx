"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/ui/brand";
import { useAuth } from "@/lib/auth/context";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isVerified, isOnboarded } = useAuth();
  const router = useRouter();

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (!isVerified) {
        router.push("/verify-email");
      } else if (!isOnboarded) {
        router.push("/onboarding");
      } else {
        router.push("/discover");
      }
    }
  }, [isAuthenticated, isLoading, isVerified, isOnboarded, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse">
          <Brand />
        </div>
      </div>
    );
  }

  // Don't render auth pages for authenticated users (they'll be redirected)
  if (isAuthenticated && isVerified && isOnboarded) {
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(320px,0.8fr)_1.2fr] bg-paper">
      {/* Left side - Story/Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center min-h-screen p-11 bg-sidebar text-sidebar-text relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute w-[440px] h-[440px] border border-sidebar-accent/15 rounded-full -right-[200px] -bottom-[180px] shadow-[0_0_0_55px_rgba(233,183,95,0.025),0_0_0_110px_rgba(233,183,95,0.02)]" />
        
        <Brand inverse />
        
        <p className="mono-label text-sidebar-accent mt-20">
          A PRIVATE DIRECTORY FOR T-HUB FOUNDERS
        </p>
        
        <h1 className="font-serif font-bold text-[clamp(42px,5vw,62px)] leading-[0.98] tracking-[-0.07em] mt-3 mb-4">
          Find the path.<br />
          <em className="text-sidebar-accent not-italic">Make the move.</em>
        </h1>
        
        <p className="max-w-[350px] text-sidebar-muted text-[13px] leading-[1.75] relative z-10">
          Come back to a more focused way to find funding, challenges and people who can help.
        </p>
        
        <span className="mt-20 text-sidebar-muted/70 font-mono text-[10px]">
          For founders, by the ecosystem.
        </span>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-col min-h-screen lg:min-h-0">
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-[440px]">
            {/* Mobile brand - only shown on small screens */}
            <div className="lg:hidden mb-8">
              <Brand />
            </div>
            
            {children}
          </div>
        </div>
        
        {/* Footer - visible on mobile */}
        <div className="lg:hidden py-6 text-center">
          <p className="text-muted text-xs">
            Exclusive to the T-Hub founder community
          </p>
        </div>
      </div>
    </div>
  );
}
