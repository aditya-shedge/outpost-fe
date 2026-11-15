"use client";

import { trackClick, type ContentType } from "@/lib/api/engagement";

interface TrackedLinkProps {
  href: string;
  contentType: ContentType;
  contentId: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

/**
 * External link that tracks clicks for engagement analytics.
 * Fire and forget - doesn't block navigation.
 */
export function TrackedLink({
  href,
  contentType,
  contentId,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
}: TrackedLinkProps) {
  const handleClick = () => {
    // Fire and forget - don't await
    trackClick(contentType, contentId);
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
