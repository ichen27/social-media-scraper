// Engagement uses varying keys per source — use a loose record
export type Engagement = Record<string, number | undefined>;

export interface TopComment {
  score: number;
  date: string | null;
  author: string;
  excerpt: string;
}

export interface SubScores {
  relevance?: number;
  recency?: number;
  engagement?: number;
}

export interface RedditResult {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  date: string;
  date_confidence: string;
  engagement: Engagement;
  top_comments?: TopComment[];
  comment_insights?: string[];
  relevance: number;
  why_relevant: string;
  subs: SubScores;
  score: number;
}

export interface XResult {
  id: string;
  text: string;
  url: string;
  author_handle: string;
  date: string;
  date_confidence: string;
  engagement: Engagement;
  relevance: number;
  why_relevant: string;
  subs: SubScores;
  score: number;
}

export interface YouTubeResult {
  id: string;
  title: string;
  url: string;
  channel: string;
  date: string;
  engagement: Engagement;
  transcript_snippet?: string;
  relevance: number;
  why_relevant: string;
  subs: SubScores;
  score: number;
}

export interface HackerNewsResult {
  id: string;
  title: string;
  url: string;
  hn_url?: string;
  author?: string;
  date: string;
  date_confidence?: string;
  engagement: Engagement;
  top_comments?: TopComment[];
  comment_insights?: string[];
  relevance: number;
  why_relevant: string;
  subs: SubScores;
  score: number;
}

export interface PolymarketResult {
  id: string;
  title: string;
  url: string;
  outcomes?: { name: string; price: number }[];
  volume_24h?: number;
  liquidity?: number;
  relevance: number;
  why_relevant: string;
  subs: SubScores;
  score: number;
}

export interface GenericResult {
  id: string;
  text: string;
  url: string;
  author_name?: string;
  date: string;
  date_confidence?: string;
  engagement: Engagement;
  caption_snippet?: string;
  hashtags?: string[];
  relevance: number;
  why_relevant: string;
  subs: SubScores;
  score: number;
}

export interface ResearchReport {
  topic: string;
  range: { from: string; to: string };
  generated_at: string;
  mode: string;
  openai_model_used: string | null;
  xai_model_used: string | null;
  reddit: RedditResult[];
  x: XResult[];
  web: GenericResult[];
  youtube: YouTubeResult[];
  tiktok: GenericResult[];
  instagram: GenericResult[];
  hackernews: HackerNewsResult[];
  bluesky: GenericResult[];
  truthsocial: GenericResult[];
  polymarket: PolymarketResult[];
  best_practices: string[];
  prompt_pack: string[];
  context_snippet_md: string;
}

export interface SSEEvent {
  type: "progress" | "result" | "error" | "done";
  message?: string;
  source?: string;
  count?: number;
  data?: ResearchReport;
  markdown?: string;
}
