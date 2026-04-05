import { spawn } from "child_process";
import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";

// Locate the last30days script
function findScript(): string {
  const candidates = [
    path.join(
      process.env.HOME || "~",
      ".claude/plugins/marketplaces/last30days-skill/scripts/last30days.py"
    ),
    path.join(
      process.env.HOME || "~",
      ".claude/skills/last30days/scripts/last30days.py"
    ),
  ];

  // Also check the cache directory with glob-like search
  const cacheBase = path.join(
    process.env.HOME || "~",
    ".claude/plugins/cache/last30days-skill"
  );
  if (fs.existsSync(cacheBase)) {
    try {
      const versions = fs.readdirSync(cacheBase);
      for (const dir of versions) {
        const sub = fs.readdirSync(path.join(cacheBase, dir));
        for (const s of sub) {
          candidates.push(
            path.join(cacheBase, dir, s, "scripts/last30days.py")
          );
        }
      }
    } catch {
      // ignore
    }
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error(
    "Research engine not found on server"
  );
}

export async function POST(request: NextRequest) {
  const { topic, mode = "default", sources = "auto" } = await request.json();

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Topic is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let scriptPath: string;
  try {
    scriptPath = findScript();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Script not found";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      }

      send({ type: "progress", message: `Researching "${topic.trim()}"...` });

      const args = [scriptPath, topic.trim(), `--emit=json`];
      if (mode === "quick") args.push("--quick");
      if (mode === "deep") args.push("--deep");
      if (sources !== "auto") args.push(`--sources=${sources}`);

      const home = process.env.HOME || "~";
      const proc = spawn("python3", args, {
        env: {
          ...process.env,
          PYTHONUNBUFFERED: "1",
          // Ensure Codex auth is discoverable
          CODEX_AUTH_FILE:
            process.env.CODEX_AUTH_FILE ||
            path.join(home, ".codex/auth.json"),
          // Inherit HOME so the script can find ~/.config/last30days/.env
          // and ~/.codex/auth.json automatically
          HOME: home,
        },
        cwd: path.dirname(scriptPath),
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stdout += text;

        // Parse progress lines from stderr-like patterns in stdout
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.trim()) {
            // Try to detect source progress
            const sourceMatch = line.match(
              /(?:searching|fetching|found|enriching)\s+(\w+)/i
            );
            if (sourceMatch) {
              send({
                type: "progress",
                message: line.trim(),
                source: sourceMatch[1].toLowerCase(),
              });
            }
          }
        }
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stderr += text;

        // Forward progress-like messages
        const lines = text.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("Traceback")) {
            send({ type: "progress", message: trimmed });
          }
        }
      });

      proc.on("close", (code) => {
        if (code !== 0) {
          send({
            type: "error",
            message: stderr || `Process exited with code ${code}`,
          });
          controller.close();
          return;
        }

        try {
          const data = JSON.parse(stdout);
          send({ type: "result", data });

          // Also try to read the markdown report
          const mdPath = path.join(
            process.env.HOME || "~",
            ".local/share/last30days/out/report.md"
          );
          if (fs.existsSync(mdPath)) {
            const markdown = fs.readFileSync(mdPath, "utf-8");
            send({ type: "done", markdown });
          } else {
            send({ type: "done" });
          }
        } catch {
          // stdout might not be valid JSON — try reading from the output file
          const jsonPath = path.join(
            process.env.HOME || "~",
            ".local/share/last30days/out/report.json"
          );
          if (fs.existsSync(jsonPath)) {
            try {
              const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
              send({ type: "result", data });
            } catch {
              send({
                type: "error",
                message: "Failed to parse research results",
              });
            }
          } else {
            send({
              type: "error",
              message: "No results produced. Check your API keys.",
            });
          }

          const mdPath = path.join(
            process.env.HOME || "~",
            ".local/share/last30days/out/report.md"
          );
          if (fs.existsSync(mdPath)) {
            const markdown = fs.readFileSync(mdPath, "utf-8");
            send({ type: "done", markdown });
          } else {
            send({ type: "done" });
          }
        }

        controller.close();
      });

      proc.on("error", (err) => {
        send({ type: "error", message: err.message });
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
