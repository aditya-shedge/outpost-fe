"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { Brand } from "@/components/ui/brand";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
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
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "TOKEN_INVALID" || err.code === "TOKEN_EXPIRED") {
          setError("This reset link is invalid or has expired. Please request a new one.");
        } else {
          setError(err.message);
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
      <div className="min-h-screen flex items-center justify-center bg-paper p-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <Brand />
          </div>
          <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-light flex items-center justify-center">
              <ErrorIcon />
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
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <Brand />
          </div>
          <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-light flex items-center justify-center">
              <CheckIcon />
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
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-rose-light border border-rose/20 text-rose-dark text-sm p-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: "" }));
            }}
            className={`w-full h-11 px-3 border bg-paper-light text-ink text-sm placeholder:text-placeholder focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 ${
              fieldErrors.password ? "border-rose" : "border-line"
            }`}
            placeholder="At least 10 characters"
            required
            autoComplete="new-password"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-rose-dark">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1.5">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            className={`w-full h-11 px-3 border bg-paper-light text-ink text-sm placeholder:text-placeholder focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 ${
              fieldErrors.confirmPassword ? "border-rose" : "border-line"
            }`}
            placeholder="Confirm your new password"
            required
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-rose-dark">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 flex items-center justify-center gap-3 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-line text-center">
        <Link href="/login" className="text-sm text-gold-dark hover:text-ink font-semibold">
          Back to login
        </Link>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-dark"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-rose-dark"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
