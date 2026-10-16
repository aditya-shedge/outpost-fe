"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { ApiClientError } from "@/lib/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-3 border border-line bg-paper-light text-ink text-sm placeholder:text-placeholder focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="••••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-gold-dark hover:text-ink font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 flex items-center justify-center gap-3 bg-ink text-paper-light font-semibold text-sm border border-ink transition-all hover:bg-[#304258] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
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
