"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button, Input, Icon } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({ email });
      setIsSuccess(true);
    } catch {
      // Always show success to not reveal if email exists
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
        <div className="size-12 mx-auto mb-4 rounded-full bg-gold-light flex items-center justify-center">
          <Icon name="mail" className="size-6 text-gold-dark" />
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

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full"
          size="lg"
        >
          Send reset link
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
