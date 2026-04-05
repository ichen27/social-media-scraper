"use client";

import type { ResearchReport, Engagement } from "@/lib/types";
import SourceCard from "./SourceCard";
import { useState } from "react";

interface ResultsDashboardProps {
  report: ResearchReport;
  markdown?: string;
}

const SOURCE_ICONS: Record<string, string> = {
  reddit: "\uD83D\uDCAC",
  x: "\uD835\uDD4F",
  youtube: "\u25B6\uFE0F",
  hackernews: "\uD83D\uDD25",
  polymarket: "\uD83D\uDCB0",
  bluesky: "\u2601\uFE0F",
  tiktok: "\uD83C\uDFB5",
  instagram: "\uD83D\uDCF7",
  web: "\uD83C\uDF10",
  truthsocial: "\uD83C\uDDFA\uD83C\uDDF8",
};

type TabKey = "all" | "reddit" | "x" | "youtube" | "hackernews" | "polymarket" | "bluesky" | "tiktok" | "instagram" | "web" | "truthsocial" | "markdown";

export default function ResultsDashboard({
  report,
  markdown,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // Collect all results with source tag
  type TaggedResult = {
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
  };

  const allResults: TaggedResult[] = [];

  for (const r of report.reddit) {
    allResults.push({
      source: "reddit",
      icon: SOURCE_ICONS.reddit,
      title: r.title,
      url: r.url,
      subtitle: `r/${r.subreddit}`,
      engagement: r.engagement,
      score: r.score,
      relevance: r.relevance,
      whyRelevant: r.why_relevant,
      date: r.date,
      extras:
        r.comment_insights && r.comment_insights.length > 0 ? (
          <div className="mb-2 space-y-1">
            {r.comment_insights.slice(0, 2).map((c, i) => (
              <div
                key={i}
                className="text-[11px] text-text-secondary bg-surface-2 rounded-lg px-3 py-1.5 line-clamp-2"
              >
                {c}
              </div>
            ))}
          </div>
        ) : undefined,
    });
  }

  for (const r of report.x) {
    allResults.push({
      source: "x",
      icon: SOURCE_ICONS.x,
      title: r.text,
      url: r.url,
      subtitle: `@${r.author_handle}`,
      engagement: r.engagement,
      score: r.score,
      relevance: r.relevance,
      whyRelevant: r.why_relevant,
      date: r.date,
    });
  }

  for (const r of report.youtube) {
    allResults.push({
      source: "youtube",
      icon: SOURCE_ICONS.youtube,
      title: r.title,
      url: r.url,
      subtitle: r.channel,
      engagement: r.engagement,
      score: r.score,
      relevance: r.relevance,
      whyRelevant: r.why_relevant,
      date: r.date,
    });
  }

  for (const r of report.hackernews) {
    allResults.push({
      source: "hackernews",
      icon: SOURCE_ICONS.hackernews,
      title: r.title,
      url: r.url,
      engagement: r.engagement,
      score: r.score,
      relevance: r.relevance,
      whyRelevant: r.why_relevant,
      date: r.date,
    });
  }

  for (const r of report.polymarket) {
    allResults.push({
      source: "polymarket",
      icon: SOURCE_ICONS.polymarket,
      title: r.title,
      url: r.url,
      engagement: {},
      score: r.score,
      relevance: r.relevance,
      whyRelevant: r.why_relevant,
      extras:
        r.outcomes && r.outcomes.length > 0 ? (
          <div className="flex gap-2 mb-2 flex-wrap">
            {r.outcomes.slice(0, 4).map((o, i) => (
              <span
                key={i}
                className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5"
              >
                {o.name}: {(o.price * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        ) : undefined,
    });
  }

  const socialSources = [
    { key: "bluesky" as const, data: report.bluesky },
    { key: "tiktok" as const, data: report.tiktok },
    { key: "instagram" as const, data: report.instagram },
    { key: "truthsocial" as const, data: report.truthsocial },
    { key: "web" as const, data: report.web },
  ];

  for (const { key, data } of socialSources) {
    for (const r of data) {
      allResults.push({
        source: key,
        icon: SOURCE_ICONS[key],
        title: r.text,
        url: r.url,
        subtitle: r.author_name,
        engagement: r.engagement,
        score: r.score,
        relevance: r.relevance,
        whyRelevant: r.why_relevant,
        date: r.date,
        extras:
          r.hashtags && r.hashtags.length > 0 ? (
            <div className="flex gap-1 mb-2 flex-wrap">
              {r.hashtags.slice(0, 5).map((h, i) => (
                <span
                  key={i}
                  className="text-[10px] text-accent-light bg-accent-glow rounded-full px-2 py-0.5"
                >
                  #{h}
                </span>
              ))}
            </div>
          ) : undefined,
      });
    }
  }

  // Sort by score descending
  allResults.sort((a, b) => b.score - a.score);

  // Count per source
  const sourceCounts: Record<string, number> = {};
  for (const r of allResults) {
    sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1;
  }

  const filtered =
    activeTab === "all" || activeTab === "markdown"
      ? allResults
      : allResults.filter((r) => r.source === activeTab);

  // Source tabs
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All", count: allResults.length },
  ];
  for (const [source, count] of Object.entries(sourceCounts).sort(
    (a, b) => b[1] - a[1]
  )) {
    tabs.push({
      key: source as TabKey,
      label: source.charAt(0).toUpperCase() + source.slice(1),
      count,
    });
  }
  if (markdown) {
    tabs.push({ key: "markdown", label: "Full Report" });
  }

  const totalResults = allResults.length;
  const range = report.range;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">{report.topic}</h2>
          <p className="text-sm text-text-muted mt-1">
            {totalResults} results &middot;{" "}
            {new Date(range.from).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            &ndash;{" "}
            {new Date(range.to).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            &middot; {Object.keys(sourceCounts).length} sources
          </p>
        </div>
        <div className="text-xs text-text-muted font-mono">
          {new Date(report.generated_at).toLocaleString()}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-accent text-white"
                : "bg-surface-2 text-text-secondary hover:text-foreground hover:bg-surface-3"
            }`}
          >
            {tab.key !== "all" && tab.key !== "markdown" && (
              <span className="text-sm">
                {SOURCE_ICONS[tab.key] || ""}
              </span>
            )}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-xs ${
                  activeTab === tab.key
                    ? "text-white/70"
                    : "text-text-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Markdown view */}
      {activeTab === "markdown" && markdown ? (
        <div className="bg-surface border border-border rounded-xl p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm text-text-secondary leading-relaxed">
            {markdown}
          </pre>
        </div>
      ) : (
        /* Results grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r, i) => (
            <SourceCard
              key={`${r.source}-${i}`}
              source={r.source}
              icon={r.icon}
              title={r.title}
              url={r.url}
              subtitle={r.subtitle}
              engagement={r.engagement}
              score={r.score}
              relevance={r.relevance}
              whyRelevant={r.whyRelevant}
              date={r.date}
              extras={r.extras}
            />
          ))}
        </div>
      )}

      {/* Best practices & prompt pack */}
      {activeTab === "all" &&
        (report.best_practices.length > 0 ||
          report.prompt_pack.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {report.best_practices.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="text-green-400">&#x2713;</span> Best
                  Practices
                </h3>
                <ul className="space-y-2">
                  {report.best_practices.map((bp, i) => (
                    <li
                      key={i}
                      className="text-sm text-text-secondary leading-relaxed"
                    >
                      {bp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.prompt_pack.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="text-accent-light">&#x2318;</span> Prompt
                  Pack
                </h3>
                <ul className="space-y-2">
                  {report.prompt_pack.map((pp, i) => (
                    <li
                      key={i}
                      className="text-sm text-text-secondary font-mono leading-relaxed"
                    >
                      {pp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
