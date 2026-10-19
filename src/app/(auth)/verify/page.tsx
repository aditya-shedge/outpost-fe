"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { Brand } from "@/components/ui/brand";
import { Icon, LoadingSpinner } from "@/components/ui";
import { showToast } from "@/components/ui/toast";

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
        showToast.success("Email verified successfully!");
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
              <div className="size-12 mx-auto mb-4 rounded-full bg-gold-light flex items-center justify-center">
                <LoadingSpinner size="md" />
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
              <div className="size-12 mx-auto mb-4 rounded-full bg-green-light flex items-center justify-center">
                <Icon name="check" className="size-6 text-green-dark" />
              </div>
              <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
                Email verified!
              </h1>
              <p className="text-muted text-sm mb-6">
                Your email has been verified successfully. Redirecting to login...
              </p>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center px-6 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
              >
                Go to login
              </Link>
            </>
          )}

          {showError && (
            <>
              <div className="size-12 mx-auto mb-4 rounded-full bg-rose-light flex items-center justify-center">
                <Icon name="alert-circle" className="size-6 text-rose-dark" />
              </div>
              <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
                Verification failed
              </h1>
              <p className="text-muted text-sm mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <Link
                  href="/verify-email"
                  className="flex w-full h-12 items-center justify-center bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
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
