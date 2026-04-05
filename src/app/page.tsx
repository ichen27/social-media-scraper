import Link from "next/link";

const SOURCES = [
  { icon: "\uD83D\uDCAC", name: "Reddit", desc: "Threads + top comments" },
  { icon: "\uD835\uDD4F", name: "X / Twitter", desc: "Posts + handle resolution" },
  { icon: "\u25B6\uFE0F", name: "YouTube", desc: "Search + transcripts" },
  { icon: "\uD83D\uDD25", name: "Hacker News", desc: "Stories + discussions" },
  { icon: "\uD83D\uDCB0", name: "Polymarket", desc: "Prediction markets" },
  { icon: "\u2601\uFE0F", name: "Bluesky", desc: "AT Protocol search" },
  { icon: "\uD83C\uDFB5", name: "TikTok", desc: "Trending videos" },
  { icon: "\uD83D\uDCF7", name: "Instagram", desc: "Reels + posts" },
  { icon: "\uD83C\uDF10", name: "Web Search", desc: "Exa, Brave, and more" },
];

const FEATURES = [
  {
    icon: "\uD83D\uDD0D",
    title: "Multi-Signal Scoring",
    desc: "Every result is scored on relevance, engagement velocity, source authority, and recency. Cross-platform convergence detection surfaces what matters.",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: "\u26A1",
    title: "Real-Time Intelligence",
    desc: "Research any topic and get results from the last 30 days. Know what people are discussing, recommending, and betting on right now.",
    color: "bg-yellow-500/10 text-yellow-400",
  },
  {
    icon: "\uD83D\uDD11",
    title: "API Access",
    desc: "Integrate Insight Seeker into your apps. Simple REST API with your API key. JSON responses with scores, citations, and engagement metrics.",
    color: "bg-green-500/10 text-green-400",
  },
  {
    icon: "\u2696\uFE0F",
    title: "Comparative Mode",
    desc: 'Ask "X vs Y" and get parallel research passes with a side-by-side comparison table, strengths/weaknesses, and a data-driven verdict.',
    color: "bg-pink-500/10 text-pink-400",
  },
  {
    icon: "\uD83D\uDCC8",
    title: "Prediction Markets",
    desc: "Polymarket integration with 5-factor scoring: text relevance, volume, liquidity, price velocity, and outcome competitiveness.",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: "\uD83D\uDCDA",
    title: "Research History",
    desc: "Every search is saved to your dashboard. Build a personal research library. Re-visit past insights anytime.",
    color: "bg-cyan-500/10 text-cyan-400",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "50 searches / month",
      "All 10+ sources",
      "API access",
      "Research history",
      "Multi-signal scoring",
    ],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    features: [
      "500 searches / month",
      "All 10+ sources",
      "API access",
      "Priority processing",
      "Deep research mode",
      "Comparative analysis",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited searches",
      "Dedicated infrastructure",
      "Custom sources",
      "SLA & support",
      "Team management",
      "Webhooks & integrations",
    ],
    cta: "Contact Us",
    href: "mailto:hello@insightseeker.com",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              IS
            </div>
            <span className="font-bold text-lg">Insight Seeker</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#sources" className="text-sm text-text-secondary hover:text-foreground transition-colors">Sources</a>
            <a href="#features" className="text-sm text-text-secondary hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-text-secondary hover:text-foreground transition-colors">Pricing</a>
            <a href="#api" className="text-sm text-text-secondary hover:text-foreground transition-colors">API</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-secondary hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-light text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,var(--accent-glow)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-surface-2 border border-border rounded-full px-4 py-1.5 text-xs font-medium text-text-secondary mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse-dot_2s_infinite]" />
            10+ sources searched in parallel
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Research anything{" "}
            <span className="bg-gradient-to-r from-[#818cf8] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent">
              before anyone else
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Get the most up-to-date information across Reddit, X, YouTube, Hacker News,
            Polymarket, and more. AI-scored results with real citations, delivered in minutes.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-light text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:translate-y-[-1px]"
            >
              Start Researching Free
            </Link>
            <a
              href="#api"
              className="bg-surface-2 border border-border hover:border-border-hover text-foreground px-8 py-3.5 rounded-xl text-base font-semibold transition-all"
            >
              View API Docs
            </a>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section id="sources" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Data Sources</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              One search. Every platform.
            </h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {SOURCES.map((s) => (
              <div
                key={s.name}
                className="bg-surface border border-border rounded-xl p-4 text-center hover:border-border-hover transition-colors"
              >
                <span className="text-2xl block mb-2">{s.icon}</span>
                <div className="text-xs font-semibold">{s.name}</div>
                <div className="text-[10px] text-text-muted mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              More than search. Intelligence.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-background border border-border rounded-2xl p-6 hover:border-border-hover transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4 ${f.color}`}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API */}
      <section id="api" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Developer API</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Build with real-time research
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                Simple REST API. Send a topic, get scored results with citations.
                Use your API key to integrate Insight Seeker into any application.
              </p>
              <Link
                href="/signup"
                className="inline-flex bg-accent hover:bg-accent-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                Get Your API Key
              </Link>
            </div>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="flex-1 text-center text-xs text-text-muted font-mono">API Request</span>
              </div>
              <pre className="p-5 text-sm font-mono leading-relaxed overflow-x-auto text-text-secondary">
{`curl -X POST https://insightseeker.com/api/v1/research \\
  -H "Authorization: Bearer isk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "AI video generation tools",
    "mode": "quick"
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-light mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Start free. Scale when ready.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 ${
                  plan.highlight
                    ? "bg-accent/10 border-2 border-accent"
                    : "bg-background border border-border"
                }`}
              >
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-text-muted">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="text-green-400 text-xs">&#x2713;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-accent hover:bg-accent-light text-white"
                      : "bg-surface-2 border border-border hover:border-border-hover text-foreground"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-white font-bold text-[10px]">
              IS
            </div>
            <span className="text-sm text-text-muted">Insight Seeker</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="text-sm text-text-muted hover:text-text-secondary transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-text-muted hover:text-text-secondary transition-colors">Pricing</a>
            <a href="#api" className="text-sm text-text-muted hover:text-text-secondary transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
