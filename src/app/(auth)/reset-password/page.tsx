"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { Brand } from "@/components/ui/brand";
import { Button, Input, Icon, LoadingSpinner } from "@/components/ui";
import { showToast } from "@/components/ui/toast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 10) {
      errors.password = "Password must be at least 10 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({ token, newPassword: password });
      setIsSuccess(true);
      showToast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "TOKEN_INVALID" || err.code === "TOKEN_EXPIRED") {
          setError("This reset link is invalid or has expired. Please request a new one.");
        } else {
          setError(err.message || "Failed to reset password");
        }
      } else {
        setError("Failed to reset password. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
        <div className="size-12 mx-auto mb-4 rounded-full bg-rose-light flex items-center justify-center">
          <Icon name="alert-circle" className="size-6 text-rose-dark" />
        </div>
        <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
          Invalid reset link
        </h1>
        <p className="text-muted text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex h-12 items-center justify-center gap-3 px-6 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
        <div className="size-12 mx-auto mb-4 rounded-full bg-green-light flex items-center justify-center">
          <Icon name="check" className="size-6 text-green-dark" />
        </div>
        <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
          Password reset!
        </h1>
        <p className="text-muted text-sm mb-6">
          Your password has been reset successfully. Redirecting to login...
        </p>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center gap-3 px-6 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg">
      <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
        Set new password
      </h1>
      <p className="text-muted text-sm mb-8">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div 
            className="bg-rose-light border border-rose/20 text-rose-dark text-sm p-3 flex items-start gap-2"
            role="alert"
          >
            <Icon name="alert-circle" className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            New password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={!!fieldErrors.password}
              placeholder="At least 10 characters"
              autoComplete="new-password"
              className="pr-10"
              aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
              aria-invalid={!!fieldErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} className="size-4" />
            </button>
          </div>
          {fieldErrors.password ? (
            <p id="password-error" className="mt-1.5 text-sm text-rose-dark" role="alert">
              {fieldErrors.password}
            </p>
          ) : (
            <p id="password-hint" className="mt-1.5 text-xs text-muted">
              Must be at least 10 characters
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">
            Confirm new password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              error={!!fieldErrors.confirmPassword}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className="pr-10"
              aria-describedby={fieldErrors.confirmPassword ? "confirm-error" : undefined}
              aria-invalid={!!fieldErrors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="size-4" />
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p id="confirm-error" className="mt-1.5 text-sm text-rose-dark" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full"
          size="lg"
        >
          Reset password
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-line text-center">
        <Link href="/login" className="text-sm text-gold-dark hover:text-ink font-semibold">
          Back to login
        </Link>
      </div>
    </div>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
      <div className="size-12 mx-auto mb-4 rounded-full bg-gold-light flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
      <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
        Loading...
      </h1>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-8">
      <div className="w-full max-w-[440px]">
        <div className="mb-8">
          <Brand />
        </div>
        <Suspense fallback={<ResetPasswordLoading />}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
