"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface ApiKey {
  id: string;
  prefix: string;
  name: string;
  last_used: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<{ count: number; limit: number } | null>(null);
  const [newKeyName, setNewKeyName] = useState("Default");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/keys");
    if (res.ok) {
      const data = await res.json();
      setApiKeys(data.keys || []);
      setUsage(data.usage || null);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function generateKey() {
    setLoading(true);
    setGeneratedKey(null);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });
    const data = await res.json();
    if (data.key) {
      setGeneratedKey(data.key);
      setNewKeyName("Default");
      loadData();
    }
    setLoading(false);
  }

  async function revokeKey(id: string) {
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
    if (generatedKey) setGeneratedKey(null);
  }

  return (
    <div className="max-w-3xl mx-auto pt-8 space-y-10">
      {/* Usage */}
      <section>
        <h2 className="text-xl font-bold mb-4">Usage</h2>
        <div className="bg-surface border border-border rounded-xl p-5">
          {usage ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary">
                  Searches this month
                </span>
                <span className="text-sm font-mono font-bold">
                  {usage.count} / {usage.limit}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{
                    width: `${Math.min((usage.count / usage.limit) * 100, 100)}%`,
                  }}
                />
              </div>
              {usage.count >= usage.limit && (
                <p className="text-xs text-orange-400 mt-2">
                  Monthly limit reached. Upgrade to Pro for 500 searches/month.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-text-muted">Loading usage...</p>
          )}
        </div>
      </section>

      {/* API Keys */}
      <section>
        <h2 className="text-xl font-bold mb-4">API Keys</h2>

        {/* Generate new key */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name"
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-light transition-colors"
            />
            <button
              onClick={generateKey}
              disabled={loading}
              className="bg-accent hover:bg-accent-light disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {loading ? "Generating..." : "Generate Key"}
            </button>
          </div>

          {generatedKey && (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-xs text-green-400 mb-2 font-semibold">
                Copy this key now - it won&apos;t be shown again:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-green-300 bg-surface-2 px-3 py-2 rounded-lg break-all">
                  {generatedKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                  }}
                  className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing keys */}
        {apiKeys.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            No API keys yet. Generate one above.
          </p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{key.name}</span>
                    <code className="text-xs font-mono text-text-muted bg-surface-2 px-2 py-0.5 rounded">
                      {key.prefix}...
                    </code>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-muted">
                      Created{" "}
                      {new Date(key.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {key.last_used && (
                      <span className="text-xs text-text-muted">
                        Last used{" "}
                        {new Date(key.last_used).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* API Usage Example */}
      <section>
        <h2 className="text-xl font-bold mb-4">API Documentation</h2>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-surface-2 border-b border-border">
            <span className="text-xs font-mono text-text-muted">
              POST /api/v1/research
            </span>
          </div>
          <pre className="p-5 text-sm font-mono text-text-secondary leading-relaxed overflow-x-auto">
{`curl -X POST http://localhost:4000/api/v1/research \\
  -H "Authorization: Bearer isk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"topic": "AI video tools", "mode": "quick"}'

# Response: JSON with scored results from all sources`}
          </pre>
        </div>
      </section>
    </div>
  );
}
