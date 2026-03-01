/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { MapPin, Heart, Sparkles, BedDouble, Bath, Layers, Ruler, Star } from "lucide-react";
import { useState, useEffect } from "react";
import type { Home } from "@/types/home";
import { createClient } from "@/lib/supabase-browser";
import { proxyImageUrl } from "@/lib/proxy-image";

const supabase = createClient();

interface Props {
  home: Home;
  aiDescription?: string;
  aiScore?: number;
  featured?: boolean;
  image_url?: string | null;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price}`;
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-brand-navy/70">
      <span className="text-brand-teal">{icon}</span>
      <span className="font-semibold text-brand-navy">{value}</span>
      <span className="text-brand-navy/40">{label}</span>
    </div>
  );
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

export default function HomeCard({ home, aiDescription, aiScore, featured, image_url }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const { id, address_line1, city, state, zip, property_type, living_area, beds, baths, levels, last_sale_price, rating, review_count } = home;

  useEffect(() => {
    const checkSaved = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("saved_homes")
        .eq("id", user.id)
        .single();

      const savedList = (profile?.saved_homes as Home[] | null) ?? [];
      if (savedList.some((item: any) => item.id === home.id)) setSaved(true);
    };

    checkSaved();
  }, [home.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("saved_homes")
      .eq("id", user.id)
      .single();

    const current = (profile?.saved_homes as Home[] | null) ?? [];
    const exists = current.some((item: any) => item.id === home.id);
    const updated = exists
      ? current.filter((item: any) => item.id !== home.id)
      : [...current, home];

    setSaved(!exists);

    await supabase
      .from("profiles")
      .update({ saved_homes: updated })
      .eq("id", user.id);

    setLoading(false);
  };

  return (
    <Link
      href={`/home/${id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-teal/25 transition-all duration-200 break-inside-avoid mb-5"
    >
      {/* Image */}
      {image_url ? (
        <div className={`relative w-full overflow-hidden ${featured ? "h-64" : "h-40"}`}>
          <img
            src={proxyImageUrl(image_url) ?? undefined}
            alt={address_line1}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Save button */}
          <button
            onClick={toggleSave}
            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
              saved ? "bg-brand-orange text-white" : "bg-black/20 backdrop-blur-sm text-white/80 hover:bg-black/40"
            }`}
            aria-label="Save"
          >
            <Heart size={13} className={saved ? "fill-current" : ""} />
          </button>

          {/* AI score */}
          {aiScore != null && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-brand-mint text-brand-navy text-[10px] font-bold px-2 py-0.5 rounded">
              <Sparkles size={9} />
              {aiScore}%
            </div>
          )}

          {/* Address overlay for featured */}
          {featured && (
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-bold text-white leading-tight">{address_line1}</h3>
              <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                <MapPin size={10} />
                {[city, state, zip].filter(Boolean).join(", ")}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-24 bg-brand-navy/5 flex items-center justify-center">
          <MapPin size={24} className="text-brand-teal/25" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Address (if not featured overlay) */}
        {!featured && (
          <h3 className="font-bold text-brand-navy text-base leading-snug mb-1 group-hover:text-brand-teal-dark transition-colors">
            {address_line1}
          </h3>
        )}

        {/* Property type */}
        {property_type && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-brand-teal bg-brand-teal/20 border border-brand-teal/40 rounded px-2 py-0.5 mb-2.5">
            {property_type}
          </span>
        )}

        {/* Rating */}
        {rating != null && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <StarBar rating={rating} />
            <span className="text-xs font-bold text-brand-navy">{rating.toFixed(1)}</span>
            {review_count != null && (
              <span className="text-[11px] text-brand-teal">({review_count})</span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          {beds != null && <StatPill icon={<BedDouble size={11} />} value={beds} label="bd" />}
          {baths != null && <StatPill icon={<Bath size={11} />} value={baths} label="ba" />}
          {living_area != null && <StatPill icon={<Ruler size={11} />} value={living_area.toLocaleString()} label="sqft" />}
          {levels != null && <StatPill icon={<Layers size={11} />} value={levels} label={levels === 1 ? "level" : "levels"} />}
        </div>

        {/* Sale price */}
        {last_sale_price != null && (
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-brand-navy">
              {formatPrice(last_sale_price)}
            </span>
          </div>
        )}

        {/* AI description */}
        {aiDescription && (
          <div className="bg-brand-mint/8 border border-brand-mint/20 rounded-lg p-2.5">
            <p className="text-[11px] text-brand-navy/60 italic leading-relaxed">
              &quot;{aiDescription}&quot;
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
