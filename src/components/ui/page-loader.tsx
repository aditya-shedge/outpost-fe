"use client";

import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";
import { SkeletonCard, SkeletonText } from "./skeleton";

interface PageLoaderProps {
  variant?: "spinner" | "cards" | "text";
  cardCount?: number;
  className?: string;
}

export function PageLoader({
  variant = "spinner",
  cardCount = 6,
  className,
}: PageLoaderProps) {
  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[400px] gap-4", className)}>
        <LoadingSpinner size="lg" />
        <p className="text-muted text-sm font-mono uppercase tracking-wider">
          Loading...
        </p>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-8", className)}>
        <SkeletonText lines={2} />
        <SkeletonText lines={4} />
        <SkeletonText lines={3} />
      </div>
    );
  }

  return null;
}
