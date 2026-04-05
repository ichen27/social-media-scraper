import { spawn } from "child_process";
import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { hashApiKey } from "@/lib/api-keys";
import path from "path";
import fs from "fs";

// Use service role for API key lookups (bypasses RLS)
function getServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function findScript(): string {
  const home = process.env.HOME || "~";
  const candidates = [
    path.join(home, ".claude/plugins/marketplaces/last30days-skill/scripts/last30days.py"),
    path.join(home, ".claude/skills/last30days/scripts/last30days.py"),
  ];
  const cacheBase = path.join(home, ".claude/plugins/cache/last30days-skill");
  if (fs.existsSync(cacheBase)) {
    try {
      for (const dir of fs.readdirSync(cacheBase)) {
        for (const s of fs.readdirSync(path.join(cacheBase, dir))) {
          candidates.push(path.join(cacheBase, dir, s, "scripts/last30days.py"));
        }
      }
    } catch { /* ignore */ }
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error("Research engine not found on server");
}

async function authenticateApiKey(
  request: NextRequest
): Promise<{ userId: string; error?: string } | { userId?: string; error: string }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing Authorization header. Use: Bearer isk_your_key" };
  }

  const key = authHeader.slice(7);
  if (!key.startsWith("isk_")) {
    return { error: "Invalid API key format" };
  }

  const keyHash = hashApiKey(key);
  const supabase = getServiceClient();

  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("id, user_id")
    .eq("key_hash", keyHash)
    .single();

  if (!apiKey) {
    return { error: "Invalid API key" };
  }

  // Update last_used
  await supabase
    .from("api_keys")
    .update({ last_used: new Date().toISOString() })
    .eq("id", apiKey.id);

  return { userId: apiKey.user_id };
}

async function checkUsageLimit(userId: string): Promise<{ ok: boolean; count: number; limit: number }> {
  const supabase = getServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("monthly_limit, email")
    .eq("id", userId)
    .single();

  // Unlimited accounts bypass limits
  const { isAdmin } = await import("@/lib/admin");
  if (isAdmin(profile?.email)) {
    return { ok: true, count: 0, limit: 999999 };
  }

  const limit = profile?.monthly_limit || 50;

  const { data: currentCount } = await supabase.rpc("get_current_usage", {
    p_user_id: userId,
  });

  const count = currentCount || 0;
  return { ok: count < limit, count, limit };
}

export async function POST(request: NextRequest) {
  // Authenticate
  const auth = await authenticateApiKey(request);
  if (auth.error) {
    return Response.json({ error: auth.error }, { status: 401 });
  }

  // Check usage
  const usage = await checkUsageLimit(auth.userId!!);
  if (!usage.ok) {
    return Response.json(
      {
        error: "Monthly usage limit reached",
        usage: { count: usage.count, limit: usage.limit },
      },
      { status: 429 }
    );
  }

  // Parse request
  const body = await request.json();
  const { topic, mode = "default" } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return Response.json({ error: "topic is required" }, { status: 400 });
  }

  // Find script
  let scriptPath: string;
  try {
    scriptPath = findScript();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return Response.json({ error: msg }, { status: 500 });
  }

  // Run research
  const startTime = Date.now();

  const result = await new Promise<{ data?: Record<string, unknown>; error?: string }>((resolve) => {
    const args = [scriptPath, topic.trim(), "--emit=json"];
    if (mode === "quick") args.push("--quick");
    if (mode === "deep") args.push("--deep");

    const home = process.env.HOME || "~";
    const proc = spawn("python3", args, {
      env: {
        ...process.env,
        PYTHONUNBUFFERED: "1",
        CODEX_AUTH_FILE: process.env.CODEX_AUTH_FILE || path.join(home, ".codex/auth.json"),
        HOME: home,
      },
      cwd: path.dirname(scriptPath),
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        resolve({ error: stderr || `Process exited with code ${code}` });
        return;
      }
      try {
        resolve({ data: JSON.parse(stdout) });
      } catch {
        // Try reading from file
        const jsonPath = path.join(home, ".local/share/last30days/out/report.json");
        if (fs.existsSync(jsonPath)) {
          try {
            resolve({ data: JSON.parse(fs.readFileSync(jsonPath, "utf-8")) });
          } catch {
            resolve({ error: "Failed to parse results" });
          }
        } else {
          resolve({ error: "No results produced" });
        }
      }
    });

    proc.on("error", (err) => resolve({ error: err.message }));
  });

  const durationMs = Date.now() - startTime;

  if (result.error) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  // Increment usage and save search
  const supabase = getServiceClient();
  await supabase.rpc("increment_usage", { p_user_id: auth.userId! });

  const report = result.data as Record<string, unknown>;
  const sourceCounts: string[] = [];
  for (const key of ["reddit", "x", "youtube", "hackernews", "polymarket", "tiktok", "instagram", "bluesky", "web", "truthsocial"]) {
    const arr = report[key];
    if (Array.isArray(arr) && arr.length > 0) sourceCounts.push(key);
  }

  let totalResults = 0;
  for (const key of sourceCounts) {
    const arr = report[key];
    if (Array.isArray(arr)) totalResults += arr.length;
  }

  await supabase.from("searches").insert({
    user_id: auth.userId!,
    topic: topic.trim(),
    mode,
    result_count: totalResults,
    sources_used: sourceCounts,
    duration_ms: durationMs,
    results_json: report,
  });

  return Response.json({
    topic: report.topic,
    range: report.range,
    generated_at: report.generated_at,
    result_count: totalResults,
    sources_used: sourceCounts,
    duration_ms: durationMs,
    results: report,
    usage: {
      count: (usage.count || 0) + 1,
      limit: usage.limit,
    },
  });
}
