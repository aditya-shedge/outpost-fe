"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { meApi } from "@/lib/api/me";
import { Icon, Input, Button, PageLoader, showToast } from "@/components/ui";
import type { IdentityResponse } from "@/lib/api/types";

export default function SecurityPage() {
  const { user } = useAuth();
  const [identities, setIdentities] = useState<IdentityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Unlink state
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState<string | null>(null);

  const hasEmailIdentity = identities.some((i) => i.provider === "EMAIL");
  const canUnlink = identities.length > 1;

  useEffect(() => {
    async function fetchIdentities() {
      try {
        setLoading(true);
        const data = await meApi.getIdentities();
        setIdentities(data);
      } catch (err) {
        showToast.error("Failed to load sign-in methods");
      } finally {
        setLoading(false);
      }
    }
    fetchIdentities();
  }, []);

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 10) {
      errors.newPassword = "Password must be at least 10 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    try {
      setChangingPassword(true);
      await meApi.changePassword({
        currentPassword,
        newPassword,
      });
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      
      showToast.success("Password changed successfully");
    } catch (err: any) {
      if (err.status === 400) {
        setPasswordErrors({ currentPassword: "Current password is incorrect" });
      } else {
        showToast.error("Failed to change password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUnlink = async (provider: string) => {
    try {
      setUnlinking(provider);
      await meApi.unlinkIdentity(provider);
      
      // Update local state
      setIdentities(identities.filter((i) => i.provider !== provider));
      setShowUnlinkConfirm(null);
      
      showToast.success(`${provider} sign-in method unlinked`);
    } catch (err: any) {
      if (err.status === 409) {
        showToast.error("Cannot unlink your last sign-in method");
      } else {
        showToast.error("Failed to unlink sign-in method");
      }
    } finally {
      setUnlinking(null);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/profile"
          className="p-2 hover:bg-paper transition-colors"
          aria-label="Back to profile"
        >
          <Icon name="chevron-left" className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-ink">Security</h1>
      </div>

      <div className="space-y-10">
        {/* Change Password Section */}
        {hasEmailIdentity && (
          <section>
            <h2 className="text-lg font-semibold text-ink mb-4">Change Password</h2>
            <p className="text-muted mb-6">
              Update your password to keep your account secure.
            </p>
            
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-ink mb-1">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  error={!!passwordErrors.currentPassword}
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-ink mb-1">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  error={!!passwordErrors.newPassword}
                />
                {passwordErrors.newPassword ? (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted">Minimum 10 characters</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-1">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  error={!!passwordErrors.confirmPassword}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>
              
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Changing..." : "Change password"}
              </Button>
            </form>
          </section>
        )}

        {/* Sign-in Methods Section */}
        <section>
          <h2 className="text-lg font-semibold text-ink mb-4">Sign-in Methods</h2>
          <p className="text-muted mb-6">
            Manage how you sign in to your account. You must have at least one sign-in method.
          </p>
          
          <div className="space-y-4">
            {identities.map((identity) => (
              <div
                key={identity.provider}
                className="flex items-center justify-between p-4 border border-line bg-white"
              >
                <div className="flex items-center gap-3">
                  {identity.provider === "GOOGLE" && (
                    <div className="w-10 h-10 rounded-full bg-paper-light flex items-center justify-center">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                  )}
                  {identity.provider === "EMAIL" && (
                    <div className="w-10 h-10 rounded-full bg-paper-light flex items-center justify-center">
                      <Icon name="mail" className="w-5 h-5 text-ink" />
                    </div>
                  )}
                  {identity.provider === "LINKEDIN" && (
                    <div className="w-10 h-10 rounded-full bg-paper-light flex items-center justify-center">
                      <LinkedInIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-ink">
                      {identity.provider === "EMAIL" ? "Email & Password" : `${identity.provider}`}
                    </p>
                    {identity.linkedAt && (
                      <p className="text-sm text-muted">
                        Linked {new Date(identity.linkedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {showUnlinkConfirm === identity.provider ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUnlink(identity.provider!)}
                      disabled={unlinking === identity.provider}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      {unlinking === identity.provider ? "Unlinking..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setShowUnlinkConfirm(null)}
                      className="px-3 py-1.5 text-sm text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  canUnlink && (
                    <button
                      onClick={() => setShowUnlinkConfirm(identity.provider!)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Unlink
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
          
          {!canUnlink && (
            <p className="mt-4 text-sm text-muted">
              You cannot unlink your only sign-in method.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#0A66C2"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}
