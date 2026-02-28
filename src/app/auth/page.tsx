"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
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
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-100">
            knock knock.
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {mode === "login" ? "Welcome back." : "Create your account."}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8">
          <div className="flex mb-8 border-b border-neutral-800">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                mode === "login"
                  ? "text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Log In
              {mode === "login" && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-neutral-100" />
              )}
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                mode === "signup"
                  ? "text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Sign Up
              {mode === "signup" && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-neutral-100" />
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label htmlFor="displayName" className="sr-only">
                  Display Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    id="displayName"
                    type="text"
                    placeholder="Display name (optional)"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-3 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-colors focus:border-neutral-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-3 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-colors focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-3 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-600 outline-none transition-colors focus:border-neutral-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-100 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        <p className="mt-6 text-center text-xs text-neutral-600">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
