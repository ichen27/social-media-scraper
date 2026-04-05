# Insight Seeker

Real-time research aggregator that searches 10+ social media platforms in parallel and returns AI-scored results with citations.

## What It Does

Enter any topic and Insight Seeker searches across multiple platforms simultaneously, scores each result on relevance/recency/engagement, and returns a consolidated research report.

**Sources searched:**
- Reddit (threads + top comments)
- X / Twitter (posts + handle resolution)
- YouTube (search + transcripts)
- Hacker News (stories + discussions)
- Polymarket (prediction markets)
- Bluesky (AT Protocol search)
- TikTok (trending videos)
- Instagram (reels + posts)
- Web Search (Exa, Brave, and more)

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

## How It Works

### Web Dashboard
1. User signs up / logs in via Supabase Auth
2. Enters a research topic with mode selection (Quick / Default / Deep)
3. Server spawns the Python research engine as a child process
4. Progress streams back via Server-Sent Events (SSE)
5. Results render as scored cards grouped by source, with engagement metrics
6. Search is saved to history for later reference

### REST API
```bash
curl -X POST https://your-domain.com/api/v1/research \
  -H "Authorization: Bearer isk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"topic": "AI video generation tools", "mode": "quick"}'
```

**Modes:** `quick`, `default`, `deep`

**Response:** JSON with scored results per source, engagement metrics, citations, and usage info.

### API Key System
- Keys use `isk_` prefix with 32 random bytes
- Only SHA-256 hashes are stored in the database
- Keys are managed in the dashboard settings page
- Each request authenticates via Bearer token, checks usage limits, then runs research

### Usage Limits
- **Free:** 50 searches/month
- **Pro:** 500 searches/month
- **Enterprise:** Unlimited
- Usage tracked per-user per-month in a dedicated table with upsert

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- [last30days research engine](https://github.com/mvanhorn/last30days-skill) installed
- Supabase project

### 1. Clone and install

```bash
git clone https://github.com/ichen27/social-media-scraper.git
cd social-media-scraper
npm install
```

### 2. Configure Supabase

Create a Supabase project, then run the schema:

```bash
# Copy the schema to Supabase SQL Editor and execute
# Or use the CLI:
npx supabase db query --linked < supabase-schema.sql
```

### 3. Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Install the research engine

The app expects the [last30days Python script](https://github.com/mvanhorn/last30days-skill) at one of:
- `~/.claude/plugins/marketplaces/last30days-skill/scripts/last30days.py`
- `~/.claude/skills/last30days/scripts/last30days.py`
- `~/.claude/plugins/cache/last30days-skill/*/scripts/last30days.py`

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Auth & DB:** Supabase (Postgres, Auth, RLS)
- **Research Engine:** Python (spawned as child process)
- **Streaming:** Server-Sent Events (SSE)

## Database Schema

Four tables with Row Level Security:

| Table | Purpose |
|-------|---------|
| `profiles` | User plans, limits (auto-created on signup via trigger) |
| `api_keys` | Hashed API keys with `isk_` prefix |
| `searches` | Research history with full JSON results |
| `usage` | Monthly search counters per user |

See `supabase-schema.sql` for the full schema including RLS policies, triggers, and functions.
