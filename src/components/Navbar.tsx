"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-neutral-900 text-neutral-100 px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold">
        <Link href="/">knock knock.</Link>
      </div>

      <div className="flex items-center gap-6 text-neutral-200">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        <Link href="/mapOverview" className="hover:text-white transition">
          Explore
        </Link>
        <Link href="/" className="hover:text-white transition">
          Saved
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <UserCircle size={18} className="text-neutral-500" />
              <span>{user.user_metadata?.display_name || user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
            >
              <LogOut size={16} />
              <span className="text-sm">Log Out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:border-neutral-500 hover:text-white transition"
          >
            <LogIn size={16} />
            <span>Log In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
