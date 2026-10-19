"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { Button, Icon } from "@/components/ui";

export default function VerifyEmailPage() {
  const { user, isVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend rate limiting
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!user?.email || countdown > 0) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await authApi.resendVerification({ email: user.email });
      setResendSuccess(true);
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "RATE_LIMITED") {
          setResendError("Too many requests. Please wait a minute before trying again.");
          setCountdown(60);
        } else {
          setResendError(err.message);
        }
      } else {
        setResendError("Failed to resend verification email");
      }
    } finally {
      setIsResending(false);
    }
  };

  // If already verified, show success
  if (isVerified) {
    return (
      <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
        <div className="size-12 mx-auto mb-4 rounded-full bg-green-light flex items-center justify-center">
          <Icon name="check" className="size-6 text-green-dark" />
        </div>
        <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
          Email verified
        </h1>
        <p className="text-muted text-sm mb-6">
          Your email has been verified successfully.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex h-12 items-center justify-center px-6 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
        >
          Continue to onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
      <div className="size-12 mx-auto mb-4 rounded-full bg-gold-light flex items-center justify-center">
        <Icon name="mail" className="size-6 text-gold-dark" />
      </div>
      
      <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
        Check your email
      </h1>
      
      <p className="text-muted text-sm mb-2">
        We&apos;ve sent a verification link to
      </p>
      
      <p className="text-ink font-semibold mb-6">
        {user?.email || "your email address"}
      </p>

      <p className="text-muted text-sm mb-6">
        Click the link in the email to verify your account. 
        If you don&apos;t see it, check your spam folder.
      </p>

      {resendSuccess && (
        <div 
          className="bg-green-light border border-green/20 text-green-dark text-sm p-3 mb-4 flex items-center justify-center gap-2"
          role="status"
        >
          <Icon name="check" className="size-4" />
          <span>Verification email sent! Check your inbox.</span>
        </div>
      )}

      {resendError && (
        <div 
          className="bg-rose-light border border-rose/20 text-rose-dark text-sm p-3 mb-4 flex items-center justify-center gap-2"
          role="alert"
        >
          <Icon name="alert-circle" className="size-4" />
          <span>{resendError}</span>
        </div>
      )}

      <Button
        onClick={handleResend}
        disabled={isResending || countdown > 0}
        loading={isResending}
        className="w-full"
        size="lg"
      >
        {countdown > 0 ? `Resend in ${countdown}s` : "Resend verification email"}
      </Button>

      <div className="mt-6 pt-6 border-t border-line">
        <p className="text-muted text-sm mb-3">
          Already verified?{" "}
          <Link href="/login" className="text-gold-dark hover:text-ink font-semibold">
            Back to login
          </Link>
        </p>
        <p className="text-muted text-sm">
          Wrong email?{" "}
          <Link href="/signup" className="text-gold-dark hover:text-ink font-semibold">
            Sign up with a different email
          </Link>
        </p>
      </div>
    </div>
  );
}
