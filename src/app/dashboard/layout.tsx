import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center text-white font-bold text-[10px]">
                IS
              </div>
              <span className="font-bold">Insight Seeker</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="text-sm text-text-secondary hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
              >
                Research
              </Link>
              <Link
                href="/dashboard/history"
                className="text-sm text-text-secondary hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
              >
                History
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-sm text-text-secondary hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="flex-1 px-6 pb-16">{children}</main>
    </div>
  );
}
