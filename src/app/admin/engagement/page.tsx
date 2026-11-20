"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getEngagementSummary,
  type ContentType,
  type EngagementSummary,
  type ContentEngagement,
} from "@/lib/api/engagement";
import { getGrantById } from "@/lib/api/grants";
import { getChallengeById } from "@/lib/api/challenges";
import { getMentorById } from "@/lib/api/mentors";
import { Select } from "@/components/ui";
import { toast } from "sonner";

// Get date string in YYYY-MM-DD format
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Get default date range (last 30 days)
function getDefaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from: formatDate(from), to: formatDate(to) };
}

// Content type labels
const contentTypeLabels: Record<ContentType, string> = {
  GRANT: "Grants",
  CHALLENGE: "Challenges",
  MENTOR: "Mentors",
};

// Get link to content detail page
function getContentLink(contentType: ContentType, contentId: string): string {
  switch (contentType) {
    case "GRANT":
      return `/grants/${contentId}`;
    case "CHALLENGE":
      return `/challenges/${contentId}`;
    case "MENTOR":
      return `/mentors/${contentId}`;
  }
}

export default function AdminEngagementPage() {
  const defaultRange = getDefaultDateRange();
  
  const [summary, setSummary] = useState<EngagementSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | "">("");
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [contentNames, setContentNames] = useState<Record<string, string>>({});

  // Fetch content names for the items in the summary
  const fetchContentNames = useCallback(async (data: EngagementSummary) => {
    const allItems = [...data.topByViews, ...data.topByClicks];
    const uniqueItems = allItems.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.contentId === item.contentId)
    );

    const names: Record<string, string> = {};

    await Promise.all(
      uniqueItems.map(async (item) => {
        try {
          if (item.contentType === "GRANT") {
            const grant = await getGrantById(item.contentId);
            if (grant?.name) names[item.contentId] = grant.name;
          } else if (item.contentType === "CHALLENGE") {
            const challenge = await getChallengeById(item.contentId);
            if (challenge?.title) names[item.contentId] = challenge.title;
          } else if (item.contentType === "MENTOR") {
            const mentor = await getMentorById(item.contentId);
            if (mentor?.name) names[item.contentId] = mentor.name;
          }
        } catch {
          // Silently fail - will show ID instead
        }
      })
    );

    setContentNames(names);
  }, []);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEngagementSummary({
        contentType: contentTypeFilter || undefined,
        from: fromDate,
        to: toDate,
      });
      setSummary(data);
      // Fetch content names after getting summary
      if (data.topByViews.length > 0 || data.topByClicks.length > 0) {
        fetchContentNames(data);
      }
    } catch (error) {
      console.error("Failed to fetch engagement summary:", error);
      toast.error("Failed to load engagement data");
    } finally {
      setIsLoading(false);
    }
  }, [contentTypeFilter, fromDate, toDate, fetchContentNames]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const hasData = summary && (
    summary.topByViews.length > 0 ||
    summary.topByClicks.length > 0 ||
    summary.viewsByWeek.length > 0 ||
    summary.bySector.length > 0 ||
    summary.byStage.length > 0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Engagement Dashboard</h1>
        <p className="text-gray-400">Track founder engagement with grants, challenges, and mentors</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Content Type</label>
          <Select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value as ContentType | "")}
            className="h-10 w-40 bg-[#16162a] border-[#2d2d4a] text-white text-sm"
          >
            <option value="">All Types</option>
            <option value="GRANT">Grants</option>
            <option value="CHALLENGE">Challenges</option>
            <option value="MENTOR">Mentors</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 px-3 bg-[#16162a] border border-[#2d2d4a] text-white text-sm rounded focus:outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 px-3 bg-[#16162a] border border-[#2d2d4a] text-white text-sm rounded focus:outline-none focus:border-gold"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setContentTypeFilter("");
            setFromDate(defaultRange.from);
            setToDate(defaultRange.to);
          }}
          className="h-10 px-4 text-sm text-gray-400 hover:text-white border border-[#2d2d4a] hover:border-gray-500 rounded transition-colors"
        >
          Clear filters
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* Top Content Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopContentTable
              title="Top 10 by Views"
              data={summary!.topByViews}
              sortBy="views"
              contentNames={contentNames}
            />
            <TopContentTable
              title="Top 10 by Clicks"
              data={summary!.topByClicks}
              sortBy="clicks"
              contentNames={contentNames}
            />
          </div>

          {/* Weekly Trend Chart */}
          {summary!.viewsByWeek.length > 0 && (
            <WeeklyTrendChart data={summary!.viewsByWeek} />
          )}

          {/* Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {summary!.bySector.length > 0 && (
              <BreakdownChart title="Views by Sector" data={summary!.bySector} />
            )}
            {summary!.byStage.length > 0 && (
              <BreakdownChart title="Views by Stage" data={summary!.byStage} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2d2d4a] flex items-center justify-center">
        <BarChartIcon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No engagement data</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        There is no engagement data for the selected date range and filters. 
        Try adjusting your filters or check back later.
      </p>
    </div>
  );
}

function TopContentTable({
  title,
  data,
  sortBy,
  contentNames,
}: {
  title: string;
  data: ContentEngagement[];
  sortBy: "views" | "clicks";
  contentNames: Record<string, string>;
}) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d2d4a]">
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2d2d4a]">
            <th className="text-left px-4 py-2 text-xs font-medium text-gray-400">Content</th>
            <th className="text-left px-4 py-2 text-xs font-medium text-gray-400">Type</th>
            <th className="text-right px-4 py-2 text-xs font-medium text-gray-400">Views</th>
            <th className="text-right px-4 py-2 text-xs font-medium text-gray-400">Clicks</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={`${item.contentId}-${index}`} className="border-b border-[#2d2d4a] last:border-0 hover:bg-[#1e1e3a]">
              <td className="px-4 py-2">
                <Link
                  href={getContentLink(item.contentType, item.contentId)}
                  className="text-sm text-white hover:text-gold transition-colors"
                  target="_blank"
                >
                  {contentNames[item.contentId] || item.contentId.slice(0, 8) + "..."}
                </Link>
              </td>
              <td className="px-4 py-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.contentType === "GRANT" ? "bg-gold/20 text-gold" :
                  item.contentType === "CHALLENGE" ? "bg-orange-500/20 text-orange-400" :
                  "bg-green-500/20 text-green-400"
                }`}>
                  {contentTypeLabels[item.contentType]}
                </span>
              </td>
              <td className={`px-4 py-2 text-right text-sm ${sortBy === "views" ? "text-white font-medium" : "text-gray-400"}`}>
                {item.views.toLocaleString()}
              </td>
              <td className={`px-4 py-2 text-right text-sm ${sortBy === "clicks" ? "text-white font-medium" : "text-gray-400"}`}>
                {item.clicks.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeeklyTrendChart({ data }: { data: { period: string; count: number }[] }) {
  // Get last 8 weeks
  const weeks = data.slice(-8);
  const maxCount = Math.max(...weeks.map((w) => w.count), 1);

  return (
    <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-4">
      <h3 className="font-semibold text-white mb-4">Weekly Views (Last 8 Weeks)</h3>
      <div className="flex items-end gap-2 h-48">
        {weeks.map((week) => {
          const height = (week.count / maxCount) * 100;
          return (
            <div key={week.period} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-40">
                <span className="text-xs text-gray-400 mb-1">{week.count}</span>
                <div
                  className="w-full bg-gold rounded-t transition-all"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 truncate w-full text-center">
                {formatWeekLabel(week.period)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BreakdownChart({ title, data }: { title: string; data: { name: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-4">
      <h3 className="font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item) => {
          const width = (item.count / maxCount) * 100;
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">{item.name}</span>
                <span className="text-gray-400">{item.count.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-[#2d2d4a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${Math.max(width, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatWeekLabel(dateStr: string): string {
  const startDate = new Date(dateStr);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const formatDay = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  
  return `${formatDay(startDate)} - ${formatDay(endDate)}`;
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
