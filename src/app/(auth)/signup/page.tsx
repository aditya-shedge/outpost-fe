"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ApiClientError } from "@/lib/api/client";

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-rose-light border border-rose/20 text-rose-dark text-sm p-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            className={`w-full h-11 px-3 border bg-paper-light text-ink text-sm placeholder:text-placeholder focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 ${
              fieldErrors.email ? "border-rose" : "border-line"
            }`}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-rose-dark">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            Password
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
            Confirm password
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
            placeholder="Confirm your password"
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
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
