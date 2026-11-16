"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getEngagementSummary,
  fetchContentName,
  type EngagementSummaryParams,
} from "@/lib/api/admin/engagement";
import type {
  EngagementSummaryResponse,
  ContentStatsWithName,
  ContentType,
} from "@/lib/api/types";
import {
  formatNumber,
  formatLargeNumber,
  formatWeekDate,
  getDefaultDateRange,
} from "@/lib/utils/format";
import { LoadingSpinner } from "@/components/ui";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Date range presets
const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

// Content type filter options
const CONTENT_TYPE_OPTIONS: Array<{ value: ContentType | ""; label: string }> = [
  { value: "", label: "All Content" },
  { value: "GRANT", label: "Grants" },
  { value: "CHALLENGE", label: "Challenges" },
  { value: "MENTOR", label: "Mentors" },
];

// Colors for charts
const SECTOR_COLORS = ["#d4af37", "#b8992f", "#9d8327", "#826d1f", "#675717"];
const STAGE_COLORS = ["#d4af37", "#b8992f", "#9d8327", "#826d1f", "#675717"];

export default function AdminEngagementPage() {
  // Filter state
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() =>
    getDefaultDateRange(30)
  );
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | "">("");
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // Default: 30 days

  // Data state
  const [summary, setSummary] = useState<EngagementSummaryResponse | null>(null);
  const [topViewedWithNames, setTopViewedWithNames] = useState<ContentStatsWithName[]>([]);
  const [topClickedWithNames, setTopClickedWithNames] = useState<ContentStatsWithName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch engagement data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: EngagementSummaryParams = {
        from: dateRange.from,
        to: dateRange.to,
      };

      if (contentTypeFilter) {
        params.contentType = contentTypeFilter;
      }

      const data = await getEngagementSummary(params);
      setSummary(data);

      // Fetch content names
      setIsLoadingNames(true);
      const [topViewedNames, topClickedNames] = await Promise.all([
        enrichWithNames(data.topViewedContent),
        enrichWithNames(data.topClickedContent),
      ]);
      setTopViewedWithNames(topViewedNames);
      setTopClickedWithNames(topClickedNames);
      setIsLoadingNames(false);
    } catch (err) {
      console.error("Failed to fetch engagement data:", err);
      setError("Failed to load engagement data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, contentTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enrich content stats with names
  async function enrichWithNames(
    contentStats: Array<{ contentId: string; contentType: ContentType; viewCount: number; clickCount: number }>
  ): Promise<ContentStatsWithName[]> {
    const promises = contentStats.map(async (stat) => {
      const name = await fetchContentName(stat.contentId, stat.contentType);
      return { ...stat, name };
    });
    return Promise.all(promises);
  }

  // Handle preset selection
  const handlePresetChange = (index: number, days: number) => {
    setSelectedPreset(index);
    setDateRange(getDefaultDateRange(days));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    fetchData();
  };

  // Check if all sections are empty
  const isEmpty =
    summary &&
    summary.topViewedContent.length === 0 &&
    summary.topClickedContent.length === 0 &&
    summary.viewsByWeek.length === 0 &&
    summary.viewsBySector.length === 0 &&
    summary.viewsByStage.length === 0;

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Engagement Dashboard</h1>
        <p className="text-gray-400 text-sm">
          Track founder engagement across grants, challenges, and mentors
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Range Presets */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-2">Date Range</label>
            <div className="flex gap-2">
              {DATE_PRESETS.map((preset, index) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetChange(index, preset.days)}
                  className={`px-4 py-2 text-sm rounded transition-colors ${
                    selectedPreset === index
                      ? "bg-gold text-ink font-medium"
                      : "bg-[#1a1a2e] text-gray-400 hover:text-white border border-[#2d2d4a]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-2">Content Type</label>
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as ContentType | "")}
              className="w-full h-10 px-3 bg-[#1a1a2e] border border-[#2d2d4a] text-white text-sm rounded focus:outline-none focus:border-gold transition-colors"
            >
              {CONTENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="px-6 py-2 bg-gold text-ink font-medium text-sm rounded hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gold text-ink font-medium text-sm rounded hover:bg-gold/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && !isLoading && !error && (
        <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No engagement events were recorded for the selected date range and content type.
            Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && !isEmpty && summary && (
        <div className="space-y-6">
          {/* Top Viewed Content */}
          <ContentTable
            title="Top Viewed Content"
            data={topViewedWithNames}
            isLoading={isLoadingNames}
            emptyIcon="📊"
            emptyMessage="No views recorded for the selected period"
          />

          {/* Top Clicked Content */}
          <ContentTable
            title="Top Clicked Content"
            data={topClickedWithNames}
            isLoading={isLoadingNames}
            emptyIcon="🖱️"
            emptyMessage="No clicks recorded for the selected period"
          />

          {/* Weekly Views Trend */}
          {summary.viewsByWeek.length > 0 && (
            <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Weekly Views Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary.viewsByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2d4a" />
                  <XAxis
                    dataKey="period"
                    stroke="#6b7280"
                    tickFormatter={formatWeekDate}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tickFormatter={formatLargeNumber}
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#16162a",
                      border: "1px solid #2d2d4a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    labelFormatter={(value) => `Week of ${formatWeekDate(value as string)}`}
                    formatter={(value) => [formatNumber(value as number), "Views"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#d4af37"
                    strokeWidth={2}
                    dot={{ fill: "#d4af37", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sector and Stage Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Views by Sector */}
            {summary.viewsBySector.length > 0 && (
              <BreakdownChart
                title="Views by Sector"
                data={summary.viewsBySector}
                colors={SECTOR_COLORS}
              />
            )}

            {/* Views by Stage */}
            {summary.viewsByStage.length > 0 && (
              <BreakdownChart
                title="Views by Stage"
                data={summary.viewsByStage}
                colors={STAGE_COLORS}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Content Table Component
function ContentTable({
  title,
  data,
  isLoading,
  emptyIcon,
  emptyMessage,
}: {
  title: string;
  data: ContentStatsWithName[];
  isLoading: boolean;
  emptyIcon: string;
  emptyMessage: string;
}) {
  if (data.length === 0 && !isLoading) {
    return (
      <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-8 text-center">
        <div className="text-3xl mb-2">{emptyIcon}</div>
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
        <p className="text-gray-500 text-xs mt-1">Try adjusting the date range or content type filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg overflow-hidden">
      <div className="p-6 border-b border-[#2d2d4a]">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d2d4a]">
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Content Name</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-400">Type</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-400">Views</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-400">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <LoadingSpinner size="sm" />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={`${item.contentId}-${index}`}
                  className="border-b border-[#2d2d4a] last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-6">
                    <ContentLink content={item} />
                  </td>
                  <td className="py-3 px-6">
                    <ContentTypeBadge type={item.contentType} />
                  </td>
                  <td className="py-3 px-6 text-right text-white font-medium">
                    {formatNumber(item.viewCount)}
                  </td>
                  <td className="py-3 px-6 text-right text-white font-medium">
                    {formatNumber(item.clickCount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Content Link Component
function ContentLink({ content }: { content: ContentStatsWithName }) {
  const getHref = () => {
    switch (content.contentType) {
      case "GRANT":
        return `/admin/grants/${content.contentId}`;
      case "CHALLENGE":
        return `/admin/challenges/${content.contentId}`;
      case "MENTOR":
        return `/admin/mentors/${content.contentId}`;
    }
  };

  return (
    <Link
      href={getHref()}
      className="text-gold hover:text-gold/80 transition-colors font-medium"
    >
      {content.name}
    </Link>
  );
}

// Content Type Badge Component
function ContentTypeBadge({ type }: { type: ContentType }) {
  const getBadgeStyle = () => {
    switch (type) {
      case "GRANT":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CHALLENGE":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MENTOR":
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-medium rounded border ${getBadgeStyle()}`}
    >
      {type}
    </span>
  );
}

// Breakdown Chart Component (Pie Chart)
function BreakdownChart({
  title,
  data,
  colors,
}: {
  title: string;
  data: Array<{ dimension: string; count: number }>;
  colors: string[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Format data for pie chart with percentages
  const chartData = data.map((item) => ({
    name: item.dimension,
    value: item.count,
    percent: ((item.count / total) * 100).toFixed(1),
  }));

  return (
    <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name} (${entry.percent}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.name === "Unknown" ? "#6b7280" : colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#16162a",
              border: "1px solid #2d2d4a",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value, name, props: any) => [
              `${formatNumber(value as number)} (${props.payload.percent}%)`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
