"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({ email });
      setIsSuccess(true);
    } catch (err) {
      // Always show success to not reveal if email exists
      // But log the error for debugging
      console.error("Forgot password error:", err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-light flex items-center justify-center">
          <MailIcon />
        </div>
        <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
          Check your email
        </h1>
        <p className="text-muted text-sm mb-6">
          If an account exists with <strong className="text-ink">{email}</strong>, 
          we&apos;ve sent a password reset link. Check your spam folder if you don&apos;t see it.
        </p>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center gap-3 px-6 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg">
      <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
        Reset your password
      </h1>
      <p className="text-muted text-sm mb-8">
        Enter your email and we&apos;ll send you a reset link.
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3 border border-line bg-paper-light text-ink text-sm placeholder:text-placeholder focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 flex items-center justify-center gap-3 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
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

function MailIcon() {
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
      className="text-gold-dark"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
