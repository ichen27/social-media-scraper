import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: searches } = await supabase
    .from("searches")
    .select("id, topic, mode, result_count, sources_used, duration_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="text-2xl font-bold mb-6">Research History</h1>

      {!searches || searches.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg mb-2">No research yet</p>
          <p className="text-text-muted text-sm">
            Your search results will appear here after your first research.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {searches.map((s) => (
            <div
              key={s.id}
              className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between hover:border-border-hover transition-colors"
            >
              <div>
                <div className="font-medium text-sm">{s.topic}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">
                    {s.result_count} results
                  </span>
                  <span className="text-xs text-text-muted">
                    {s.mode} mode
                  </span>
                  {s.duration_ms && (
                    <span className="text-xs text-text-muted">
                      {(s.duration_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-text-muted">
                {new Date(s.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
