"use client";

import type { Engagement } from "@/lib/types";

interface SourceCardProps {
  source: string;
  icon: string;
  title: string;
  url: string;
  subtitle?: string;
  engagement: Engagement;
  score: number;
  relevance: number;
  whyRelevant: string;
  date?: string;
  extras?: React.ReactNode;
}

function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null) return "";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// Map raw engagement keys to display labels
const ENGAGEMENT_LABELS: Record<string, string> = {
  score: "score",
  upvotes: "upvotes",
  likes: "likes",
  points: "points",
  views: "views",
  num_comments: "comments",
  comments: "comments",
  retweets: "retweets",
  reposts: "reposts",
  replies: "replies",
  plays: "plays",
  shares: "shares",
  saves: "saves",
  upvote_ratio: "ratio",
};

function engagementPills(engagement: Engagement | undefined | null) {
  const pills: { label: string; value: string }[] = [];
  if (!engagement) return pills;
  for (const [key, val] of Object.entries(engagement)) {
    if (val && typeof val === "number" && ENGAGEMENT_LABELS[key]) {
      pills.push({
        label: ENGAGEMENT_LABELS[key],
        value: key === "upvote_ratio" ? `${(val * 100).toFixed(0)}%` : formatNumber(val),
      });
    }
  }
  return pills;
}

const SOURCE_COLORS: Record<string, string> = {
  reddit: "border-orange-500/30 bg-orange-500/5",
  x: "border-blue-400/30 bg-blue-400/5",
  youtube: "border-red-500/30 bg-red-500/5",
  hackernews: "border-orange-400/30 bg-orange-400/5",
  polymarket: "border-green-500/30 bg-green-500/5",
  bluesky: "border-sky-500/30 bg-sky-500/5",
  tiktok: "border-pink-500/30 bg-pink-500/5",
  instagram: "border-purple-500/30 bg-purple-500/5",
  web: "border-gray-500/30 bg-gray-500/5",
  truthsocial: "border-blue-600/30 bg-blue-600/5",
};

const SCORE_COLORS: Record<string, string> = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-text-muted",
};

function scoreColor(score: number) {
  if (score >= 0.7) return SCORE_COLORS.high;
  if (score >= 0.4) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

export default function SourceCard({
  source,
  icon,
  title,
  url,
  subtitle,
  engagement,
  score,
  relevance,
  whyRelevant,
  date,
  extras,
}: SourceCardProps) {
  const pills = engagementPills(engagement);
  const colorClass = SOURCE_COLORS[source] || SOURCE_COLORS.web;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border rounded-xl p-4 transition-all hover:translate-y-[-1px] hover:shadow-lg ${colorClass}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {source}
          </span>
        </div>
        <div
          className={`text-xs font-mono font-bold shrink-0 ${scoreColor(score)}`}
        >
          {(score * 100).toFixed(0)}
        </div>
      </div>

      <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">
        {title}
      </h3>

      {subtitle && (
        <p className="text-xs text-text-muted mb-2 line-clamp-1">{subtitle}</p>
      )}

      <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-2">
        {whyRelevant}
      </p>

      {extras}

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2 flex-wrap">
          {pills.slice(0, 3).map((p) => (
            <span
              key={p.label}
              className="text-[10px] text-text-muted bg-surface-2 rounded-full px-2 py-0.5"
            >
              {p.value} {p.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {date && (
            <span className="text-[10px] text-text-muted">
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          <span className="text-[10px] text-text-muted">
            rel: {(relevance * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </a>
  );
}
