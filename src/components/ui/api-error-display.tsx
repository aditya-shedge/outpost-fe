"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Button } from "./button";
import type { ApiError } from "@/lib/api/types";

interface ApiErrorDisplayProps {
  error: ApiError | Error | null;
  onRetry?: () => void;
  className?: string;
  variant?: "inline" | "block";
}

const friendlyMessages: Record<string, string> = {
  NETWORK_ERROR: "Unable to connect. Please check your internet connection.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource could not be found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
};

function getErrorMessage(error: ApiError | Error | null): string {
  if (!error) return "An unexpected error occurred.";

  if ("code" in error && error.code) {
    return friendlyMessages[error.code] || error.message || "An error occurred.";
  }

  return error.message || "An unexpected error occurred.";
}

export function ApiErrorDisplay({
  error,
  onRetry,
  className,
  variant = "block",
}: ApiErrorDisplayProps) {
  if (!error) return null;

  const message = getErrorMessage(error);
  const fieldErrors = "errors" in error && error.errors ? error.errors : [];

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-rose text-sm",
          className
        )}
        role="alert"
      >
        <Icon name="alert-circle" className="size-4 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-rose-light border border-rose/20 p-4",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon name="alert-circle" className="size-5 text-rose shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-rose-dark font-medium">{message}</p>
          {fieldErrors.length > 0 && (
            <ul className="mt-2 text-sm text-rose-dark space-y-1">
              {fieldErrors.map((fieldError: string, i: number) => (
                <li key={i}>
                  {fieldError}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="text-rose-dark hover:bg-rose/10"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
