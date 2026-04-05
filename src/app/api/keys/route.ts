import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get API keys
  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, prefix, name, last_used, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get usage
  const { data: profile } = await supabase
    .from("profiles")
    .select("monthly_limit")
    .eq("id", user.id)
    .single();

  const { data: usageCount } = await supabase.rpc("get_current_usage", {
    p_user_id: user.id,
  });

  const unlimited = isAdmin(user.email);

  return Response.json({
    keys: keys || [],
    usage: {
      count: unlimited ? 0 : (usageCount || 0),
      limit: unlimited ? 999999 : (profile?.monthly_limit || 50),
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name = "Default" } = await request.json();
  const { key, hash, prefix } = generateApiKey();

  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    key_hash: hash,
    prefix,
    name,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ key, prefix });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return Response.json({ success: true });
}
