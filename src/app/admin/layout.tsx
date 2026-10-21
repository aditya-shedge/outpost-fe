"use client";

import { useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { PageLoader } from "@/components/ui";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/grants", label: "Grants", icon: GrantsIcon },
  { href: "/admin/challenges", label: "Challenges", icon: ChallengesIcon },
  { href: "/admin/mentors", label: "Mentors", icon: MentorsIcon },
];

function AdminNav() {
  const pathname = usePathname();
  
  return (
    <nav className="space-y-1 px-3">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== "/admin" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
              isActive
                ? "bg-gold/20 text-gold"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace("/discover");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Admin Header */}
      <header className="h-14 bg-[#16162a] border-b border-[#2d2d4a] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gold flex items-center justify-center">
              <span className="text-sm font-bold text-ink">O</span>
            </div>
            <span className="font-semibold text-white">Outpost Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/discover" 
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to App
          </Link>
          <div className="text-sm text-gray-400">
            {user?.email}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-[calc(100vh-56px)] bg-[#16162a] border-r border-[#2d2d4a] py-4">
          <Suspense fallback={<div className="px-3 py-2 text-gray-400">Loading...</div>}>
            <AdminNav />
          </Suspense>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Admin Icons
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

function GrantsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ChallengesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function MentorsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
