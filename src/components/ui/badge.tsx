import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "grant" | "challenge" | "scheme" | "mentor" | "tag" | "default";
  size?: "sm" | "md";
}

function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    grant: "bg-grant-bg text-grant-text",
    challenge: "bg-challenge-bg text-challenge-text",
    scheme: "bg-gold-light text-gold-dark",
    mentor: "bg-mentor-bg text-mentor-text",
    tag: "bg-ink text-paper-light",
    default: "bg-line text-muted",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold uppercase tracking-wider",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

// Badge with dot indicator
interface DotBadgeProps extends BadgeProps {
  dotColor?: string;
}

function DotBadge({
  className,
  variant = "default",
  size = "md",
  dotColor,
  children,
  ...props
}: DotBadgeProps) {
  const dotColors = {
    grant: "bg-grant-dot",
    challenge: "bg-challenge-dot",
    scheme: "bg-gold",
    mentor: "bg-mentor-dot",
    tag: "bg-paper-light",
    default: "bg-muted",
  };

  return (
    <Badge variant={variant} size={size} className={cn("gap-1.5", className)} {...props}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          dotColor || dotColors[variant]
        )}
      />
      {children}
    </Badge>
  );
}

export { Badge, DotBadge };
