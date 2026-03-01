"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  ArrowLeft,
  PenLine,
  ChevronRight,
  UserCircle,
  Ruler,
  MessageSquare,
} from "lucide-react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import type { Review } from "@/types/review";
import type { LivabilityRegion } from "@/types/livability";
import type { PoiCounts } from "@/types/poi";
import StarRating from "@/components/StarRating";
import LikeButton from "@/components/LikeButton";
import NeighborhoodStats from "@/components/NeighborhoodStats";

function StarBar({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-gray-200 fill-gray-200" />
            {fill > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star size={size} className="text-brand-orange fill-brand-orange" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = Math.max(0, Math.min(4, Math.round(r.rating) - 1));
    counts[idx]++;
  });
  const total = reviews.length;

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = counts[stars - 1];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={stars} className="flex items-center gap-2 text-xs">
            <span className="text-brand-teal w-3 text-right">{stars}</span>
            <Star size={10} className="text-brand-orange fill-brand-orange shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-orange transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-brand-teal w-4 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

interface ReviewsPayload {
  data: Review[];
  average_rating: number | null;
  total: number;
}

export default function NeighborhoodPage() {
  const params = useParams();
  const [neighborhood, setNeighborhood] = useState<CommunityNeighborhood | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{ average: number | null; total: number }>({
    average: null,
    total: 0,
  });
  const [livability, setLivability] = useState<LivabilityRegion | null>(null);
  const [poiCounts, setPoiCounts] = useState<PoiCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeighborhood() {
      const id = Number(params.id);
      if (isNaN(id)) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/neighborhoods/${id}?include=reviews,livability,pois`);
        if (!res.ok) {
          console.error("Error fetching neighborhood:", res.statusText);
        } else {
          const json: {
            neighborhood: CommunityNeighborhood;
            reviews?: ReviewsPayload;
            livability?: LivabilityRegion | null;
            poi_counts?: PoiCounts | null;
          } = await res.json();

          setNeighborhood(json.neighborhood);
          setLivability(json.livability ?? null);
          setPoiCounts(json.poi_counts ?? null);

          if (json.reviews) {
            setReviews(json.reviews.data);
            setReviewStats({
              average: json.reviews.average_rating,
              total: json.reviews.total,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching neighborhood:", err);
      }

      setLoading(false);
    }

    fetchNeighborhood();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF7]">
        {/* Skeleton hero */}
        <div className="w-full h-72 bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-100 rounded w-1/3" />
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 bg-gray-100 rounded-xl" />
                ))}
              </div>
              <div className="h-80 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!neighborhood) {
    return (
      <main className="min-h-screen bg-[#F8FAF7] flex items-center justify-center pt-16">
        <div className="text-center">
          <MapPin size={48} className="text-brand-teal/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-navy mb-2">Neighborhood not found</h2>
          <p className="text-brand-teal text-sm mb-4">This neighborhood may have been removed or doesn&apos;t exist.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-orange hover:underline"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const average = reviewStats.average ?? neighborhood.rating ?? 0;
  const totalReviews = reviewStats.total || neighborhood.review_count || 0;

  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      {/* Hero banner */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-brand-navy">
        {neighborhood.image_url ? (
          <>
            <Image
              src={neighborhood.image_url}
              alt={neighborhood.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-brand-navy/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-navy" />
        )}

        {/* Breadcrumb over hero */}
        <div className="absolute top-0 left-0 right-0 pt-20 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <span className="text-white/90">{neighborhood.name}</span>
            </div>
          </div>
        </div>

        {/* Name + rating overlaid on hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              {neighborhood.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              {average > 0 && (
                <div className="flex items-center gap-2">
                  <StarBar rating={average} size={18} />
                  <span className="text-white font-bold">{average.toFixed(1)}</span>
                  <span className="text-white/60 text-sm">
                    ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
              {(neighborhood.city || neighborhood.state) && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <MapPin size={13} />
                  <span>{[neighborhood.city, neighborhood.state].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {neighborhood.area_sqmi && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Ruler size={13} />
                  <span>{neighborhood.area_sqmi.toFixed(2)} sq mi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 py-3 text-sm overflow-x-auto">
            {neighborhood.area_sqmi && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Area</span>
                <span className="font-semibold text-brand-navy">{neighborhood.area_sqmi.toFixed(2)} sq mi</span>
              </div>
            )}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-brand-teal">Reviews</span>
              <span className="font-semibold text-brand-navy">{totalReviews}</span>
            </div>
            {average > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Rating</span>
                <span className="font-semibold text-brand-navy">{average.toFixed(1)} / 5</span>
              </div>
            )}
            {(neighborhood.city || neighborhood.state) && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Location</span>
                <span className="font-semibold text-brand-navy">
                  {[neighborhood.city, neighborhood.state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Neighborhood stats */}
            <NeighborhoodStats livability={livability} poiCounts={poiCounts} />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                <MessageSquare size={20} className="text-brand-teal" />
                Reviews
                {totalReviews > 0 && (
                  <span className="text-sm font-normal text-brand-teal">({totalReviews})</span>
                )}
              </h2>
              <button className="flex items-center gap-2 bg-brand-orange hover:bg-[#f0a44e] text-brand-navy font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
                <PenLine size={14} />
                Write a Review
              </button>
            </div>

            

            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                <MessageSquare size={32} className="text-brand-teal/20 mx-auto mb-3" />
                <p className="text-brand-navy font-medium mb-1">No reviews yet</p>
                <p className="text-brand-teal text-sm">Be the first to review this neighborhood.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-xl border border-gray-100 p-5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-brand-teal/8 flex items-center justify-center shrink-0">
                        <UserCircle size={22} className="text-brand-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-navy">
                          {review.profiles?.display_name ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-brand-teal">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <StarRating rating={review.rating} />
                    </div>

                    {review.title && (
                      <p className="text-sm font-semibold text-brand-navy mb-1">{review.title}</p>
                    )}

                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                      <LikeButton initialCount={review.like_count ?? 0} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Rating breakdown */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
                <h3 className="text-sm font-bold text-brand-navy mb-4">Rating Breakdown</h3>

                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                  <div className="text-4xl font-extrabold text-brand-navy">
                    {average.toFixed(1)}
                  </div>
                  <div>
                    <StarBar rating={average} size={16} />
                    <p className="text-xs text-brand-teal mt-1">
                      {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>

                <RatingBreakdown reviews={reviews} />

                <button className="w-full mt-5 flex items-center justify-center gap-2 bg-brand-orange hover:bg-[#f0a44e] text-brand-navy font-semibold text-sm py-3 rounded-lg transition-colors">
                  <PenLine size={14} />
                  Write a Review
                </button>

                {/* added button function */}
                <button onClick={() => router.push(`/neighborhoods/${neighborhoodId}/write-review`)}>
                  Write a Review
                </button>
              </div>
            )}

            {/* About */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-brand-navy mb-3">About this Neighborhood</h3>
              {neighborhood.description ? (
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {neighborhood.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic mb-4">
                  No description available yet.
                </p>
              )}

              <div className="space-y-3 pt-3 border-t border-gray-100">
                {neighborhood.area_sqmi && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Area</span>
                    <span className="font-medium text-brand-navy">
                      {neighborhood.area_sqmi.toFixed(2)} sq mi
                    </span>
                  </div>
                )}
                {(neighborhood.city || neighborhood.state) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Location</span>
                    <span className="font-medium text-brand-navy">
                      {[neighborhood.city, neighborhood.state].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
