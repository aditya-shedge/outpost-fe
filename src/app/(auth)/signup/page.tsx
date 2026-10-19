"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ApiClientError } from "@/lib/api/client";
import { Button, Input, Icon } from "@/components/ui";

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(email, password);
      // Redirect is handled by the auth context
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_TAKEN") {
          setFieldErrors({ email: "An account with this email already exists" });
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg">
      <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
        Join the founder directory
      </h1>
      <p className="text-muted text-sm mb-8">
        Use your email to get started.
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
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={!!fieldErrors.email}
            placeholder="you@example.com"
            autoComplete="email"
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1.5 text-sm text-rose-dark" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            Password
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
            Confirm password
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
              placeholder="Confirm your password"
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
          Create account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-line text-center">
        <p className="text-muted text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-dark hover:text-ink font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
