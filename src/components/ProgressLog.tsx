"use client";

interface ProgressLogProps {
  messages: string[];
}

export default function ProgressLog({ messages }: ProgressLogProps) {
  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 border-b border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse-dot_2s_infinite]" />
          <span className="text-xs font-medium text-text-secondary">
            Research in progress...
          </span>
        </div>
        <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${
                i === messages.length - 1
                  ? "text-accent-light"
                  : "text-text-muted"
              }`}
            >
              <span className="text-text-muted select-none mr-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
