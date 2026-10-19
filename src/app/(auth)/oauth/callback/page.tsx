"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/ui/brand";
import { Icon, LoadingSpinner } from "@/components/ui";
import { setTokens } from "@/lib/auth/storage";
import { useAuth } from "@/lib/auth/context";

type CallbackStatus = "loading" | "success" | "error";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      // Check for tokens in URL params (backend redirects with these)
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      if (error) {
        // Handle specific OAuth errors
        if (error === "EMAIL_UNVERIFIED_LINK") {
          setErrorMessage(
            "An account with this email already exists but isn't verified. Please verify your email first or sign in with your password."
          );
        } else {
          setErrorMessage(error);
        }
        setStatus("error");
        return;
      }

      if (!accessToken || !refreshToken) {
        setErrorMessage("Missing authentication tokens. Please try again.");
        setStatus("error");
        return;
      }

      try {
        // Store the tokens
        setTokens(accessToken, refreshToken);
        
        // Refresh user data
        await refreshUser();
        
        setStatus("success");
        
        // Small delay to show success state, then redirect
        setTimeout(() => {
          router.push("/discover");
        }, 1000);
      } catch {
        setErrorMessage("Failed to complete sign in. Please try again.");
        setStatus("error");
      }
    };

    processCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="bg-paper-light border border-line p-8 shadow-lg text-center">
      {status === "loading" && (
        <>
          <div className="size-12 mx-auto mb-4 rounded-full bg-gold-light flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
          <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
            Signing you in
          </h1>
          <p className="text-muted text-sm">
            Please wait while we complete your sign in...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="size-12 mx-auto mb-4 rounded-full bg-green-light flex items-center justify-center">
            <Icon name="check" className="size-6 text-green-dark" />
          </div>
          <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
            Welcome!
          </h1>
          <p className="text-muted text-sm">
            Redirecting you to the app...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="size-12 mx-auto mb-4 rounded-full bg-rose-light flex items-center justify-center">
            <Icon name="alert-circle" className="size-6 text-rose-dark" />
          </div>
          <h1 className="font-serif font-bold text-2xl tracking-tight text-ink mb-2">
            Sign in failed
          </h1>
          <p className="text-muted text-sm mb-6">{errorMessage}</p>
          <a
            href="/login"
            className="inline-flex h-12 items-center justify-center gap-3 px-6 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258]"
          >
            Back to login
          </a>
        </>
      )}
    </div>
  );
}

function OAuthCallbackLoading() {
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

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-8">
      <div className="w-full max-w-[440px]">
        <div className="mb-8">
          <Brand />
        </div>
        <Suspense fallback={<OAuthCallbackLoading />}>
          <OAuthCallbackContent />
        </Suspense>
      </div>
    </div>
  );
}
