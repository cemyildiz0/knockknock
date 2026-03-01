"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogIn, LogOut, Bookmark, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { User, Session } from "@supabase/supabase-js";

const SOLID_PATHS = ["/saved"];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
    supabase.auth.getUser().then((response: { data: { user: User | null } }) => {
      setUser(response.data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (pathname === "/auth") return null;

  const solid = scrolled || SOLID_PATHS.includes(pathname);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1001] transition-[background-color,border-color] duration-300 ease-out border-b ${
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
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm transition-colors"
              >
                <span className="text-sm text-white/90">
                  {user.user_metadata?.display_name || user.email?.split("@")[0]}
                </span>
                <ChevronDown size={13} className={`text-white/50 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-brand-navy border border-white/10 shadow-lg overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
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
