"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError(authError.message);
          return;
        }
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim() || "Anonymous",
            },
          },
        });
        if (authError) {
          setError(authError.message);
          return;
        }
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    if (newMode === mode) return;
    setMode(newMode);
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel -- hero branding */}
      <div className="relative lg:w-[45%] xl:w-[50%] shrink-0 h-48 sm:h-56 lg:h-auto lg:min-h-screen overflow-hidden bg-brand-navy">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('/assets/hero-neighborhood.jpeg')" }}
        />
        <div className="absolute inset-0 bg-brand-navy/30" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 py-10 lg:py-0">
          <Link href="/" className="mb-6">
            <Image
              src="/assets/logo-white.PNG"
              alt="KnockKnock"
              width={340}
              height={80}
              className="h-16 lg:h-20 w-auto"
            />
          </Link>
          <p className="text-white/40 text-sm lg:text-base text-center max-w-xs hidden lg:block">
            Find your perfect neighborhood in Irvine.
          </p>
        </div>
      </div>

      {/* Right panel -- form */}
      <div className="flex-1 flex items-start lg:items-center justify-center bg-[#F8FAF7] px-5 sm:px-8 py-10 lg:py-16">
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-brand-teal text-sm mt-1.5">
              {mode === "login"
                ? "Sign in to continue exploring."
                : "Join the community and start reviewing."}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex mb-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`pb-3 px-1 mr-6 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                mode === "login"
                  ? "border-brand-orange text-brand-navy"
                  : "border-transparent text-brand-teal hover:text-brand-navy"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                mode === "signup"
                  ? "border-brand-orange text-brand-navy"
                  : "border-transparent text-brand-teal hover:text-brand-navy"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label htmlFor="displayName" className="block text-xs font-medium text-brand-navy/70 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-teal/60"
                  />
                  <input
                    id="displayName"
                    type="text"
                    placeholder="How others will see you"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-brand-navy placeholder-gray-400 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-brand-navy/70 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-teal/60"
                />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-brand-navy placeholder-gray-400 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-brand-navy/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-teal/60"
                />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-brand-navy placeholder-gray-400 outline-none transition-all focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-[#f0a44e] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Log In" : "Create Account"}
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-brand-teal">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-brand-orange font-medium hover:underline transition-colors"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
