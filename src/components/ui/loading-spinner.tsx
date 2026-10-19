import { cn } from "@/lib/utils";
import { Icon } from "./icon";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Icon
      name="loader"
      className={cn(sizes[size], "text-gold", className)}
    />
  );
}
