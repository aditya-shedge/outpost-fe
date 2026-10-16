"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/ui/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/discover", label: "Discover" },
  { href: "/grants", label: "Grants" },
  { href: "/challenges", label: "Challenges" },
  { href: "/mentors", label: "Mentors" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-[63px] flex items-center justify-between px-[4.7vw] bg-paper-light border-b border-line">
      <Brand />
      
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "text-gold-dark"
                  : "text-muted hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        {/* Placeholder for user menu - will be implemented in later story */}
        <div className="w-9 h-9 rounded-full bg-gold-light flex items-center justify-center text-sm font-bold text-gold-dark">
          ?
        </div>
      </div>
    </header>
  );
}

export default Header;
