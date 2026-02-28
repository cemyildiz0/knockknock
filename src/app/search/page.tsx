"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Search,
} from "lucide-react";

interface Recommendation {
  neighborhood_id: number;
  neighborhood_name: string;
  score: number;
  reasoning: string;
  highlights: string[];
  neighborhood: {
    id: number;
    name: string;
    image_url: string | null;
    city: string | null;
    state: string | null;
    area_sqmi: number | null;
    rating: number | null;
    review_count: number | null;
    description: string | null;
  } | null;
}

interface SearchResponse {
  query: string;
  summary: string;
  recommendations: Recommendation[];
}

function StarBar({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-gray-200 fill-gray-200" />
            {fill > 0 && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-brand-orange fill-brand-orange" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-red-500/10 text-red-600";
  if (score >= 80) color = "bg-brand-mint/30 text-brand-teal-dark";
  else if (score >= 60) color = "bg-brand-orange/15 text-brand-orange";
  else if (score >= 40) color = "bg-yellow-100 text-yellow-700";

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>
      <Sparkles size={9} />
      {score}%
    </div>
  );
}

function ResultCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  return (
    <Link
      href={`/neighborhood/${rec.neighborhood_id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-teal/25 transition-all duration-200 break-inside-avoid mb-5"
    >
      <div className={`relative w-full overflow-hidden ${rank === 1 ? "h-56" : "h-40"}`}>
        {rec.neighborhood?.image_url ? (
          <Image
            src={rec.neighborhood.image_url}
            alt={rec.neighborhood_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-brand-navy/5 flex items-center justify-center">
            <MapPin size={24} className="text-brand-teal/25" />
          </div>
        )}

        {rec.neighborhood?.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        )}

        <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-brand-navy/80 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold">
          {rank}
        </div>

        <div className="absolute top-3 right-3">
          <ScoreBadge score={rec.score} />
        </div>

        {rank === 1 && (
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-lg font-bold text-white leading-tight">{rec.neighborhood_name}</h3>
            {rec.neighborhood && (rec.neighborhood.city || rec.neighborhood.state) && (
              <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                <MapPin size={10} />
                {[rec.neighborhood.city, rec.neighborhood.state].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        {rank !== 1 && (
          <>
            <h3 className="font-bold text-brand-navy text-base leading-snug mb-1 group-hover:text-brand-teal-dark transition-colors">
              {rec.neighborhood_name}
            </h3>
            {rec.neighborhood && (rec.neighborhood.city || rec.neighborhood.state) && (
              <div className="flex items-center gap-1 text-brand-teal text-xs mb-2">
                <MapPin size={10} />
                {[rec.neighborhood.city, rec.neighborhood.state].filter(Boolean).join(", ")}
              </div>
            )}
          </>
        )}

        {rec.neighborhood?.rating != null && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <StarBar rating={rec.neighborhood.rating} />
            <span className="text-xs font-bold text-brand-navy">{rec.neighborhood.rating.toFixed(1)}</span>
            {rec.neighborhood.review_count != null && (
              <span className="text-[11px] text-brand-teal">({rec.neighborhood.review_count})</span>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">{rec.reasoning}</p>

        <div className="flex flex-wrap gap-1.5">
          {rec.highlights.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-teal-dark bg-brand-teal/10 px-2 py-1 rounded"
            >
              <Check size={9} className="text-brand-teal shrink-0" strokeWidth={3} />
              {h}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newQuery, setNewQuery] = useState(query);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!query) return;
    setNewQuery(query);

    async function fetchRecommendations() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "Something went wrong");
          return;
        }

        const data: SearchResponse = await res.json();
        setResults(data);
      } catch {
        setError("Failed to connect. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [query]);

  const handleSearch = () => {
    const trimmed = newQuery.trim();
    if (trimmed && trimmed !== query) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`;
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      {/* Hero-style search header */}
      <div className="relative w-full overflow-hidden bg-brand-navy">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/assets/hero-neighborhood.jpeg')" }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <Link
              href="/"
              className="text-white/50 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-lg font-bold text-white">AI Search</h1>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden ring-4 ring-white/10">
            <div className="flex items-start gap-3 p-4 pb-2">
              <Sparkles size={18} className="text-brand-navy shrink-0 mt-1" />
              <textarea
                ref={textareaRef}
                value={newQuery}
                onChange={(e) => {
                  setNewQuery(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full text-sm text-brand-navy placeholder-gray-400 bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Describe your ideal neighborhood..."
              />
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-[11px] text-gray-400">
                Press Enter to search
              </span>
              <button
                onClick={handleSearch}
                disabled={!newQuery.trim() || newQuery.trim() === query}
                className="flex items-center gap-1.5 bg-brand-orange hover:bg-[#f0a44e] disabled:opacity-40 disabled:cursor-not-allowed text-brand-navy font-bold text-sm px-5 py-2 transition-colors rounded-lg"
              >
                Find
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading state */}
        {loading && (
          <div>
            <div className="flex items-center gap-3 py-8 mb-6">
              <Loader2 size={18} className="text-brand-teal animate-spin shrink-0" />
              <div>
                <p className="text-brand-navy font-semibold text-sm">Analyzing your preferences</p>
                <p className="text-brand-teal text-xs">Matching against livability data, amenities, and reviews</p>
              </div>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse break-inside-avoid mb-5"
                >
                  <div className={`${i === 0 ? "h-56" : "h-40"} bg-gray-100/60`} />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100/80 rounded w-3/4" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="w-3.5 h-3.5 bg-gray-100/80 rounded-sm" />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100/60 rounded w-full" />
                      <div className="h-3 bg-gray-100/60 rounded w-2/3" />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-5 bg-gray-100/60 rounded w-16" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16">
            <Search size={40} className="text-brand-teal/30 mx-auto mb-3" />
            <p className="text-brand-navy font-medium mb-2">{error}</p>
            <button
              onClick={() => router.push(`/search?q=${encodeURIComponent(query)}&t=${Date.now()}`)}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-orange hover:underline"
            >
              Try again
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* No query */}
        {!query && !loading && (
          <div className="text-center py-16">
            <Search size={40} className="text-brand-teal/30 mx-auto mb-3" />
            <p className="text-brand-navy font-medium mb-1">Describe what you&apos;re looking for</p>
            <p className="text-brand-teal text-sm">Use the search bar above to find your ideal neighborhood.</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results && (
          <>
            {/* AI Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div>
                  <h2 className="text-sm font-bold text-brand-navy">AI Recommendations</h2>
                  <p className="text-[11px] text-brand-teal">{results.recommendations.length} matches found</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mt-3">{results.summary}</p>
            </div>

            {/* Recommendation cards in masonry grid */}
            {results.recommendations.length > 0 ? (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                {results.recommendations.map((rec, i) => (
                  <ResultCard key={rec.neighborhood_id} rec={rec} rank={i + 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapPin size={40} className="text-brand-teal/30 mx-auto mb-3" />
                <p className="text-brand-navy font-medium mb-1">No matches found</p>
                <p className="text-brand-teal text-sm">Try broadening your search criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F8FAF7]">
        <div className="w-full h-52 bg-brand-navy animate-pulse" />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={24} className="text-brand-teal animate-spin" />
        </div>
      </main>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
