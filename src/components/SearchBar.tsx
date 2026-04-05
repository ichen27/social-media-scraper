"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (topic: string, mode: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("default");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSearch(topic.trim(), mode);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="flex items-center bg-surface border border-border rounded-2xl overflow-hidden focus-within:border-accent-light transition-colors">
          <div className="pl-5 text-text-muted">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Research any topic... e.g. AI video generation tools"
            className="flex-1 bg-transparent px-4 py-4 text-[16px] text-foreground placeholder:text-text-muted outline-none"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 pr-3">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-surface-2 border border-border text-text-secondary text-sm rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-border-hover transition-colors"
            >
              <option value="quick">Quick</option>
              <option value="default">Default</option>
              <option value="deep">Deep</option>
            </select>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Researching
                </span>
              ) : (
                "Research"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3 justify-center flex-wrap">
        {[
          "AI video generation tools",
          "Claude Code vs Cursor",
          "best new React frameworks",
          "startup fundraising trends",
        ].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              setTopic(suggestion);
              if (!isLoading) onSearch(suggestion, mode);
            }}
            className="text-xs text-text-muted bg-surface-2 border border-border rounded-full px-3 py-1.5 hover:text-text-secondary hover:border-border-hover transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </form>
  );
}
