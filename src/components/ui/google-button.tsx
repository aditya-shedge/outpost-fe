"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
            context?: "signin" | "signup" | "use";
          }) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            getNotDisplayedReason: () => string;
          }) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              type?: "standard" | "icon";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
              shape?: "rectangular" | "pill" | "circle" | "square";
            }
          ) => void;
          cancel: () => void;
        };
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { code?: string; error?: string }) => void;
            ux_mode?: "popup" | "redirect";
          }) => {
            requestCode: () => void;
          };
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface GoogleButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  mode?: "login" | "signup";
}

export function GoogleButton({
  onSuccess,
  onError,
  disabled = false,
  className,
  mode = "login",
}: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setIsLoading(true);
    try {
      const authResponse = await authApi.googleOAuth({ idToken: response.credential });
      
      // Fetch user to check onboarding status
      const user = await authApi.getMe();
      
      onSuccess?.();
      
      // Redirect based on user state
      if (!user.emailVerified) {
        router.push("/verify-email");
      } else if (!user.onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/discover");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Google sign-in failed");
      toast.error(err.message);
      onError?.(err);
      setIsLoading(false);
    }
  }, [onSuccess, onError, router]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
      return;
    }

    // Load Google Identity Services script
    const existingScript = document.getElementById("google-identity-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-identity-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      setIsScriptLoaded(true);
    } else {
      // Script exists but not loaded yet, wait for it
      existingScript.addEventListener("load", () => setIsScriptLoaded(true));
    }
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!isScriptLoaded || !window.google?.accounts?.id || !clientId || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      ux_mode: "popup",
      context: mode === "signup" ? "signup" : "signin",
    });

    // Render Google's button inside our container
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      type: "standard",
      text: mode === "signup" ? "continue_with" : "signin_with",
      width: buttonRef.current.offsetWidth,
      shape: "rectangular",
    });
  }, [isScriptLoaded, handleCredentialResponse, mode]);

  // If script not loaded or no client ID, show our custom button
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId || !isScriptLoaded) {
    return (
      <button
        type="button"
        onClick={() => {
          if (!clientId) {
            toast.error("Google Sign-In is not configured");
          }
        }}
        disabled={disabled || isLoading}
        className={cn(
          "w-full h-12 flex items-center justify-center gap-3",
          "bg-white text-ink font-medium text-sm",
          "border border-line",
          "transition-all hover:bg-gray-50 hover:border-ink/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isLoading ? (
          <div className="size-5 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span>
          {isLoading
            ? "Signing in..."
            : !clientId
            ? "Google Sign-In unavailable"
            : "Loading..."}
        </span>
      </button>
    );
  }

  // Show Google's rendered button
  return (
    <div 
      ref={buttonRef} 
      className={cn("w-full h-12 flex items-center justify-center", className)}
      style={{ minHeight: "48px" }}
    />
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
