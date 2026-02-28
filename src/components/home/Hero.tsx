"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const EXAMPLE_QUERIES = [
  "Quiet area near parks with good schools under $800K",
  "Walkable neighborhood with restaurants and nightlife",
  "Family-friendly with low crime and a community pool",
  "Near UCI with affordable rent and grocery stores",
];

export default function HeroSection() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/hero-neighborhood.jpeg')" }}
      />
      <div className="absolute inset-0 bg-[#091425]/70" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug tracking-tight text-white mb-3">
          Describe your{" "}
          <span className="text-brand-orange">dream neighborhood.</span>
        </h1>
        <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
          Tell us what you&apos;re looking for in plain English and we&apos;ll find the best matches in Irvine.
        </p>

        <div className="bg-white rounded-2xl overflow-hidden max-w-lg mx-auto ring-4 ring-white/10">
          <div className="flex items-start gap-3 p-4 pb-2">
            <Sparkles size={18} className="text-brand-black shrink-0 mt-1" />
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder={EXAMPLE_QUERIES[placeholderIndex]}
              rows={2}
              className="w-full text-sm text-brand-navy placeholder-gray-400 bg-transparent focus:outline-none resize-none leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-[11px] text-gray-400">
              Press Enter to search
            </span>
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="flex items-center gap-1.5 bg-brand-orange hover:bg-[#f0a44e] disabled:opacity-40 disabled:cursor-not-allowed text-brand-navy font-bold text-sm px-5 py-2 transition-colors rounded-lg"
            >
              Find
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
