# Insight Seeker

Real-time research aggregator that searches 10+ social media platforms in parallel and returns AI-scored results with citations.

## Architecture

```
Next.js App (TypeScript + Tailwind)
├── Landing page with pricing tiers
├── Auth (Supabase email/password)
├── Dashboard
│   ├── Research UI (SSE streaming)
│   ├── Search history
│   └── Settings (API keys, usage)
├── REST API (/api/v1/research)
└── Python research engine (child process)

Supabase (Postgres + Auth)
├── profiles (plans, limits)
├── api_keys (hashed, prefixed isk_)
├── searches (history + full JSON results)
└── usage (per-user monthly counters)
```

### Flow

1. User enters a topic via the dashboard or REST API
2. Server spawns the Python research engine as a child process
3. Engine searches Reddit, X, YouTube, Hacker News, Polymarket, Bluesky, TikTok, Instagram, and web sources in parallel
4. Progress streams back to the dashboard via Server-Sent Events (SSE)
5. Results are scored on relevance, recency, and engagement, then stored in Postgres

### Database

Four tables with Row Level Security:

| Table | Purpose |
|-------|---------|
| `profiles` | User plans and limits (auto-created on signup via trigger) |
| `api_keys` | SHA-256 hashed keys with `isk_` prefix |
| `searches` | Research history with full JSON results |
| `usage` | Per-user monthly search counters |

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Auth & DB:** Supabase (Postgres, Auth, RLS)
- **Research Engine:** Python (spawned as child process)
- **Streaming:** Server-Sent Events (SSE)
