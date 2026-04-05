"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import ProgressLog from "@/components/ProgressLog";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { ResearchReport, SSEEvent } from "@/lib/types";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [markdown, setMarkdown] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (topic: string, mode: string) => {
    setIsLoading(true);
    setProgress([]);
    setReport(null);
    setMarkdown(undefined);
    setError(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mode }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Request failed");
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("No response stream");
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: SSEEvent = JSON.parse(line.slice(6));
            switch (event.type) {
              case "progress":
                if (event.message) setProgress((p) => [...p, event.message!]);
                break;
              case "result":
                if (event.data) setReport(event.data);
                break;
              case "done":
                if (event.markdown) setMarkdown(event.markdown);
                setIsLoading(false);
                break;
              case "error":
                setError(event.message || "Unknown error");
                setIsLoading(false);
                break;
            }
          } catch {
            // skip
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {!report && !isLoading && !error && (
        <div className="pt-16 pb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            What do you want to research?
          </h1>
          <p className="text-text-secondary text-sm">
            Search across 10+ sources. Results scored by relevance, engagement, and recency.
          </p>
        </div>
      )}

      <div className={report || isLoading || error ? "pt-6" : "pt-4"}>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {isLoading && <ProgressLog messages={progress} />}

      {error && (
        <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        </div>
      )}

      {report && <ResultsDashboard report={report} markdown={markdown} />}
    </div>
  );
}
