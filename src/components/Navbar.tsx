"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogIn, LogOut, UserCircle, Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const SOLID_PATHS = ["/saved"];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  const handleScroll = useCallback(() => {
    const isScrolled = window.scrollY > 40;
    setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  if (pathname === "/auth") return null;

  const solid = scrolled || SOLID_PATHS.includes(pathname);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-300 ease-out border-b ${
        solid
          ? "bg-brand-navy/95 backdrop-blur-md border-white/5"
          : "bg-transparent backdrop-blur-none border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/assets/logo-white.PNG"
            alt="KnockKnock"
            width={140}
            height={32}
            className="h-11 w-auto"
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/saved" className="text-white/70 hover:text-brand-orange transition-colors" title="Saved">
            <Bookmark size={18} />
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
                <UserCircle size={15} className="text-brand-mint" />
                <span className="text-sm text-white/90 hidden sm:inline">
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 bg-brand-orange hover:bg-[#f0a44e] text-brand-navy font-semibold text-sm px-4 py-2 rounded-full transition-colors"
            >
              <LogIn size={13} />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
