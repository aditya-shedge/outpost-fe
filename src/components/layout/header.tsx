"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/ui/brand";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/discover", label: "Discover", icon: HomeIcon },
  { href: "/grants", label: "Opportunities", icon: GridIcon },
  { href: "/mentors", label: "Mentors", icon: MentorsIcon },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get user initials
  const initials = user?.founderName
    ? user.founderName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-line bg-paper-light">
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 lg:px-10">
        <Brand />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors",
                  isActive ? "text-green" : "text-muted hover:text-ink"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-green" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {/* Search Bar - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 h-9 px-3 bg-paper border border-line text-muted text-sm">
            <SearchIcon className="w-4 h-4" />
            <span>Search</span>
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-paper-light border border-line">
              ⌘K
            </kbd>
          </div>

          {/* User Avatar */}
          <button
            className="w-9 h-9 rounded-full bg-green flex items-center justify-center text-sm font-bold text-white"
            aria-label="User menu"
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
}

// Icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function MentorsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default Header;
