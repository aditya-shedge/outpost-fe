"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ApiClientError } from "@/lib/api/client";
import { Button, Input, Icon } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Redirect is handled by the auth context based on user state
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_NOT_VERIFIED") {
          // The auth context will redirect to verify-email
          return;
        }
        if (err.status === 401) {
          setError("Invalid email or password");
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
        Welcome back
      </h1>
      <p className="text-muted text-sm mb-8">
        Sign in to find your next opening.
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              autoComplete="current-password"
              className="pr-10"
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
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-gold-dark hover:text-ink font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full"
          size="lg"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-line text-center">
        <p className="text-muted text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gold-dark hover:text-ink font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
