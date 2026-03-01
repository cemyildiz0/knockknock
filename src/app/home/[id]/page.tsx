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
  BedDouble,
  Bath,
  Layers,
  Ruler,
  DollarSign,
  Calendar,
  MessageSquare,
  Heart,
} from "lucide-react";
import type { Home } from "@/types/home";
import type { Review } from "@/types/review";
import StarRating from "@/components/StarRating";
import LikeButton from "@/components/LikeButton";

function StarBar({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
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

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price}`;
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-teal flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-2xl font-extrabold text-brand-navy leading-tight">{value}</span>
      {sub && <span className="text-xs text-brand-teal/70">{sub}</span>}
    </div>
  );
}

interface ReviewsPayload {
  data: Review[];
  average_rating: number | null;
  total: number;
}

export default function HomePage() {
  const params = useParams();
  const [home, setHome] = useState<Home | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{ average: number | null; total: number }>({
    average: null,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchHome() {
      const id = params.id as string;
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/homes/${id}?include=reviews`);
        if (!res.ok) {
          console.error("Error fetching home:", res.statusText);
        } else {
          const json: {
            home: Home;
            reviews?: ReviewsPayload;
          } = await res.json();

          setHome(json.home);

          if (json.reviews) {
            setReviews(json.reviews.data);
            setReviewStats({
              average: json.reviews.average_rating,
              total: json.reviews.total,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching home:", err);
      }

      setLoading(false);
    }

    fetchHome();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF7]">
        <div className="w-full h-72 bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-100 rounded w-1/3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
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

  if (!home) {
    return (
      <main className="min-h-screen bg-[#F8FAF7] flex items-center justify-center pt-16">
        <div className="text-center">
          <MapPin size={48} className="text-brand-teal/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-navy mb-2">Home not found</h2>
          <p className="text-brand-teal text-sm mb-4">
            This listing may have been removed or doesn&apos;t exist.
          </p>
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

  const average = reviewStats.average ?? home.rating ?? 0;
  const totalReviews = reviewStats.total || home.review_count || 0;
  const fullAddress = [home.address_line1, home.city, home.state, home.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      {/* Hero banner */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-brand-navy">
        {home.image_url ? (
          <>
            <Image
              src={home.image_url}
              alt={home.address_line1}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-brand-navy/55" />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-navy" />
        )}

        {/* Breadcrumb */}
        <div className="absolute top-0 left-0 right-0 pt-20 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <span className="text-white/90">{home.address_line1}</span>
            </div>
          </div>
        </div>

        {/* Address + meta overlaid on hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-end justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                {home.address_line1}
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
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <MapPin size={13} />
                  <span>{[home.city, home.state, home.zip].filter(Boolean).join(", ")}</span>
                </div>
                {home.property_type && (
                  <span className="text-white/60 text-sm">{home.property_type}</span>
                )}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={() => setSaved((s) => !s)}
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all ${
                saved
                  ? "bg-brand-orange text-white"
                  : "bg-white/15 backdrop-blur-sm text-white hover:bg-white/25"
              }`}
            >
              <Heart size={14} className={saved ? "fill-current" : ""} />
              {saved ? "Saved" : "Save Property"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 py-3 text-sm overflow-x-auto">
            {home.last_sale_price != null && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Last Sale</span>
                <span className="font-semibold text-brand-navy">{formatPrice(home.last_sale_price)}</span>
              </div>
            )}
            {home.beds != null && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Beds</span>
                <span className="font-semibold text-brand-navy">{home.beds}</span>
              </div>
            )}
            {home.baths != null && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Baths</span>
                <span className="font-semibold text-brand-navy">{home.baths}</span>
              </div>
            )}
            {home.living_area != null && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Area</span>
                <span className="font-semibold text-brand-navy">{home.living_area.toLocaleString()} sqft</span>
              </div>
            )}
            {home.levels != null && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Levels</span>
                <span className="font-semibold text-brand-navy">{home.levels}</span>
              </div>
            )}
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Reviews</span>
                <span className="font-semibold text-brand-navy">{totalReviews}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {home.last_sale_price != null && (
            <StatCard
              label="Price"
              value={<span className="text-brand-orange">{formatPrice(home.last_sale_price)}</span>}
              sub={home.last_sale_date
                ? `Sold ${new Date(home.last_sale_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                : undefined}
              icon={<DollarSign size={11} />}
            />
          )}
          {home.beds != null && (
            <StatCard
              label="Beds"
              value={home.beds}
              icon={<BedDouble size={11} />}
            />
          )}
          {home.baths != null && (
            <StatCard
              label="Baths"
              value={home.baths}
              icon={<Bath size={11} />}
            />
          )}
          {home.living_area != null && (
            <StatCard
              label="Area"
              value={<>{home.living_area.toLocaleString()} <span className="text-sm font-normal text-brand-teal">sqft</span></>}
              icon={<Ruler size={11} />}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* About this home */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-base font-bold text-brand-navy mb-4">About this Home</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {home.property_type && (
                  <div className="flex justify-between text-sm col-span-2 sm:col-span-1">
                    <span className="text-brand-teal">Type</span>
                    <span className="font-medium text-brand-navy">{home.property_type}</span>
                  </div>
                )}
                {home.levels != null && (
                  <div className="flex justify-between text-sm col-span-2 sm:col-span-1">
                    <span className="text-brand-teal flex items-center gap-1"><Layers size={12} /> Levels</span>
                    <span className="font-medium text-brand-navy">{home.levels}</span>
                  </div>
                )}
                {home.living_area != null && (
                  <div className="flex justify-between text-sm col-span-2 sm:col-span-1">
                    <span className="text-brand-teal flex items-center gap-1"><Ruler size={12} /> Living Area</span>
                    <span className="font-medium text-brand-navy">{home.living_area.toLocaleString()} sqft</span>
                  </div>
                )}
                {home.last_sale_date && (
                  <div className="flex justify-between text-sm col-span-2 sm:col-span-1">
                    <span className="text-brand-teal flex items-center gap-1"><Calendar size={12} /> Sale Date</span>
                    <span className="font-medium text-brand-navy">
                      {new Date(home.last_sale_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm col-span-2">
                  <span className="text-brand-teal flex items-center gap-1"><MapPin size={12} /> Address</span>
                  <span className="font-medium text-brand-navy text-right">{fullAddress}</span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                  <MessageSquare size={20} className="text-brand-teal" />
                  Property Reviews
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
                  <p className="text-brand-teal text-sm">Be the first to review this property.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
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

                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{review.comment}</p>

                      <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                        <LikeButton initialCount={review.like_count ?? 0} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              </div>
            )}

            {/* Property details */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-brand-navy mb-3">Property Details</h3>
              <div className="space-y-3">
                {home.property_type && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Type</span>
                    <span className="font-medium text-brand-navy">{home.property_type}</span>
                  </div>
                )}
                {home.beds != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Bedrooms</span>
                    <span className="font-medium text-brand-navy">{home.beds}</span>
                  </div>
                )}
                {home.baths != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Bathrooms</span>
                    <span className="font-medium text-brand-navy">{home.baths}</span>
                  </div>
                )}
                {home.living_area != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Living Area</span>
                    <span className="font-medium text-brand-navy">{home.living_area.toLocaleString()} sqft</span>
                  </div>
                )}
                {home.levels != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Levels</span>
                    <span className="font-medium text-brand-navy">{home.levels}</span>
                  </div>
                )}
                {home.last_sale_price != null && (
                  <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
                    <span className="text-brand-teal">Last Sale Price</span>
                    <span className="font-bold text-brand-navy">{formatPrice(home.last_sale_price)}</span>
                  </div>
                )}
                {home.last_sale_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Sale Date</span>
                    <span className="font-medium text-brand-navy">
                      {new Date(home.last_sale_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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