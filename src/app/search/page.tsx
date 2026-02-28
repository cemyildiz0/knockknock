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
  let color = "bg-red-100 text-red-700";
  if (score >= 80) color = "bg-brand-mint/30 text-brand-teal-dark";
  else if (score >= 60) color = "bg-brand-orange/15 text-brand-orange";
  else if (score >= 40) color = "bg-yellow-100 text-yellow-700";

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${color}`}>
      <Sparkles size={10} />
      {score}% match
    </div>
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
    <main className="min-h-screen bg-[#F8FAF7] pt-16">
      {/* Search bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-brand-teal hover:text-brand-navy transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1 flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-brand-orange transition-colors">
              <Sparkles size={16} className="text-brand-orange shrink-0 mt-0.5" />
              <textarea
                ref={textareaRef}
                value={newQuery}
                onChange={(e) => {
                  setNewQuery(e.target.value);
                  autoResize();
                }}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 text-sm text-brand-navy placeholder-gray-400 bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Describe your ideal neighborhood..."
              />
              <button
                onClick={handleSearch}
                disabled={!newQuery.trim() || newQuery.trim() === query}
                className="bg-brand-orange hover:bg-[#f0a44e] disabled:opacity-30 disabled:cursor-not-allowed text-brand-navy font-bold text-sm px-4 py-1.5 rounded-lg transition-colors shrink-0"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                <Sparkles size={28} className="text-brand-orange" />
              </div>
              <Loader2 size={18} className="absolute -bottom-1 -right-1 text-brand-teal animate-spin" />
            </div>
            <p className="text-brand-navy font-semibold mb-1">Analyzing your preferences</p>
            <p className="text-brand-teal text-sm">Matching against livability data, nearby amenities, and reviews...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button
              onClick={() => router.push(`/search?q=${encodeURIComponent(query)}&t=${Date.now()}`)}
              className="text-sm text-brand-orange hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* No query */}
        {!query && !loading && (
          <div className="text-center py-16">
            <Sparkles size={40} className="text-brand-teal/30 mx-auto mb-3" />
            <p className="text-brand-navy font-medium mb-1">Describe what you&apos;re looking for</p>
            <p className="text-brand-teal text-sm">Use the search bar above to find your ideal neighborhood.</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results && (
          <>
            {/* Summary */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-brand-orange" />
                <h2 className="text-lg font-bold text-brand-navy">AI Recommendations</h2>
              </div>
              <p className="text-sm text-brand-teal leading-relaxed">{results.summary}</p>
            </div>

            {/* Recommendation cards */}
            <div className="space-y-5">
              {results.recommendations.map((rec, i) => (
                <Link
                  key={rec.neighborhood_id}
                  href={`/neighborhood/${rec.neighborhood_id}`}
                  className="group block bg-white rounded-xl border border-gray-100 hover:border-brand-teal/25 overflow-hidden transition-all"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative w-full sm:w-56 h-44 sm:h-auto shrink-0 bg-brand-navy/5">
                      {rec.neighborhood?.image_url ? (
                        <Image
                          src={rec.neighborhood.image_url}
                          alt={rec.neighborhood_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[140px]">
                          <MapPin size={24} className="text-brand-teal/25" />
                        </div>
                      )}
                      {/* Rank badge */}
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-brand-navy/80 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold">
                        {i + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-teal-dark transition-colors">
                            {rec.neighborhood_name}
                          </h3>
                          {rec.neighborhood && (rec.neighborhood.city || rec.neighborhood.state) && (
                            <div className="flex items-center gap-1 text-brand-teal text-xs mt-0.5">
                              <MapPin size={10} />
                              {[rec.neighborhood.city, rec.neighborhood.state].filter(Boolean).join(", ")}
                            </div>
                          )}
                        </div>
                        <ScoreBadge score={rec.score} />
                      </div>

                      {/* Rating */}
                      {rec.neighborhood?.rating != null && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <StarBar rating={rec.neighborhood.rating} />
                          <span className="text-xs font-bold text-brand-navy">{rec.neighborhood.rating.toFixed(1)}</span>
                          {rec.neighborhood.review_count != null && (
                            <span className="text-[11px] text-brand-teal">({rec.neighborhood.review_count} reviews)</span>
                          )}
                        </div>
                      )}

                      {/* AI reasoning */}
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{rec.reasoning}</p>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1.5">
                        {rec.highlights.map((h) => (
                          <span
                            key={h}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-teal bg-brand-teal/6 px-2 py-0.5 rounded"
                          >
                            <Check size={9} className="text-brand-mint" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {results.recommendations.length === 0 && (
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
      <main className="min-h-screen bg-[#F8FAF7] pt-16">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={24} className="text-brand-teal animate-spin" />
        </div>
      </main>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
