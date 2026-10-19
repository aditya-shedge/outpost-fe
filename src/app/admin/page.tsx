"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Grants"
          description="Manage grants and schemes"
          href="/admin/grants"
          icon={<GrantsIcon />}
        />
        <DashboardCard
          title="Challenges"
          description="Manage corporate challenges"
          href="/admin/challenges"
          icon={<ChallengesIcon />}
        />
        <DashboardCard
          title="Mentors"
          description="Review and approve mentors"
          href="/admin/mentors"
          icon={<MentorsIcon />}
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block p-6 bg-[#16162a] border border-[#2d2d4a] rounded-lg hover:border-gold/50 transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center text-gold mb-4">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  );
}

function GrantsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ChallengesIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function MentorsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
