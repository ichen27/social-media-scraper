"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-text-muted hover:text-foreground bg-surface-2 border border-border px-3 py-1.5 rounded-lg transition-colors"
    >
      Log out
    </button>
  );
}
