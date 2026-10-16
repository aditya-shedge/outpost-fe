"use client";

import { useAuth } from "@/lib/auth/context";

export default function DiscoverPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-[1100px] mx-auto py-12 px-7">
      {/* Hero Section */}
      <section className="mb-12">
        <p className="mono-label text-gold-dark flex items-center gap-2 mb-4">
          <span className="w-[7px] h-[7px] rounded-full bg-gold" />
          WELCOME BACK
        </p>
        
        <h1 className="font-serif font-bold text-[clamp(34px,4vw,49px)] leading-[1.05] tracking-[-0.06em] mb-4">
          Good to see you, {user?.founderName?.split(" ")[0] || "Founder"}.
        </h1>
        
        <p className="max-w-[480px] text-muted leading-[1.75] text-[15px]">
          Find relevant funding, programs and mentors for your startup journey.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 mb-12">
        <StatCard number="12" label="Open Grants" />
        <StatCard number="8" label="Active Challenges" />
        <StatCard number="24" label="Available Mentors" />
      </section>

      {/* Placeholder sections */}
      <section className="mb-12">
        <div className="flex items-end justify-between gap-7 mb-6">
          <div>
            <p className="mono-label text-gold-dark mb-2">OPPORTUNITIES</p>
            <h2 className="font-serif font-bold text-2xl tracking-[-0.04em]">
              Grants & Challenges
            </h2>
          </div>
        </div>
        
        <div className="min-h-[200px] border border-dashed border-line flex items-center justify-center text-muted text-sm">
          Opportunities will be displayed here
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-7 mb-6">
          <div>
            <p className="mono-label text-gold-dark mb-2">CONNECT</p>
            <h2 className="font-serif font-bold text-2xl tracking-[-0.04em]">
              Mentors
            </h2>
          </div>
        </div>
        
        <div className="min-h-[200px] border border-dashed border-line flex items-center justify-center text-muted text-sm">
          Mentors will be displayed here
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-5 border border-line bg-paper-light">
      <div className="font-serif font-bold text-3xl tracking-[-0.04em] text-ink mb-1">
        {number}
      </div>
      <div className="text-muted text-sm">{label}</div>
    </div>
  );
}
