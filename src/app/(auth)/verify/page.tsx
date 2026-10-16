"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { Brand } from "@/components/ui/brand";

type VerifyStatus = "loading" | "success" | "error" | "no-token";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>(token ? "loading" : "no-token");
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? "" : "No verification token provided"
  );
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        await authApi.verify({ token });
        setStatus("success");
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.code === "TOKEN_INVALID" || err.code === "TOKEN_EXPIRED") {
            setErrorMessage("This verification link is invalid or has expired.");
          } else {
            setErrorMessage(err.message);
          }
        } else {
          setErrorMessage("Failed to verify email. Please try again.");
        }
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, router]);

  const showError = status === "error" || status === "no-token";

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-8">
      <div className="w-full max-w-[440px]">
        <div className="mb-8">
          <Brand />
        </div>

        <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
          {status === "loading" && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold-light flex items-center justify-center animate-pulse">
                <LoadingIcon />
              </div>
              <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
                Verifying your email
              </h1>
              <p className="text-muted text-sm">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-light flex items-center justify-center">
                <CheckIcon />
              </div>
              <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
                Email verified!
              </h1>
              <p className="text-muted text-sm mb-6">
                Your email has been verified successfully. Redirecting to login...
              </p>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-3 px-6 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
              >
                Go to login
              </Link>
            </>
          )}

          {showError && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-light flex items-center justify-center">
                <ErrorIcon />
              </div>
              <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
                Verification failed
              </h1>
              <p className="text-muted text-sm mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <Link
                  href="/verify-email"
                  className="block w-full h-12 flex items-center justify-center gap-3 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
                >
                  Request new verification link
                </Link>
                <Link
                  href="/login"
                  className="block text-sm text-gold-dark hover:text-ink font-semibold"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingIcon() {
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
      className="text-gold-dark animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
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
