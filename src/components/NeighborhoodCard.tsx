/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Heart, Sparkles, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import { createClient } from "@/lib/supabase-browser";
import { proxyImageUrl } from "@/lib/proxy-image";

const supabase = createClient();

interface Props {
  neighborhood: CommunityNeighborhood;
  aiDescription?: string;
  aiScore?: number;
  featured?: boolean;
  distanceMi?: number;
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

export default function NeighborhoodCard({
  neighborhood,
  aiScore,
  featured,
  distanceMi,
}: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const { name, image_url, city, state, description, rating, review_count } =
    neighborhood;

  useEffect(() => {
    const checkSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("saved")
        .eq("id", user.id)
        .single();

      const savedList = profile?.saved || [];

      const exists = savedList.some(
        (item: any) => item.id === neighborhood.id
      );

      if (exists) setSaved(true);
    };

    checkSaved();
  }, []);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to save.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("saved")
      .eq("id", user.id)
      .single();

    const currentSaved = profile?.saved || [];

    const exists = currentSaved.some(
      (item: any) => item.id === neighborhood.id
    );

    let updatedSaved;

    if (exists) {
      updatedSaved = currentSaved.filter(
        (item: any) => item.id !== neighborhood.id
      );
      setSaved(false);
    } else {
      const { id, name, city, state, image_url, rating, review_count, center_lat, center_lng } = neighborhood;
      updatedSaved = [...currentSaved, { id, name, city, state, image_url, rating, review_count, center_lat, center_lng }];
      setSaved(true);
    }

    await supabase
      .from("profiles")
      .update({ saved: updatedSaved })
      .eq("id", user.id);

    setLoading(false);
  };

  return (
    <Link
      href={`/neighborhood/${neighborhood.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-teal/25 transition-all duration-200 break-inside-avoid mb-5"
    >
      {image_url && (
        <div className={`relative w-full overflow-hidden ${featured ? "h-64" : "h-40"}`}>
          <Image
            src={proxyImageUrl(image_url)!}
            alt={name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <button
            onClick={toggleSave}
            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
              saved
                ? "bg-brand-orange text-white"
                : "bg-black/20 backdrop-blur-sm text-white/80 hover:bg-black/40"
            }`}
          >
            <Heart size={13} className={saved ? "fill-current" : ""} />
          </button>

          {aiScore != null && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-brand-mint text-brand-navy text-[10px] font-bold px-2 py-0.5 rounded">
              <Sparkles size={9} />
              {aiScore}%
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <h3 className="font-bold text-brand-navy text-base mb-1">{name}</h3>

        <div className="flex items-center gap-1 text-xs text-brand-teal mb-2">
          <MapPin size={10} />
          {[city, state].filter(Boolean).join(", ")}
        </div>

        {distanceMi != null && (
          <div className="flex items-center gap-1 text-xs text-brand-teal/70 mb-2">
            <Navigation size={10} />
            {distanceMi < 0.1
              ? "Less than 0.1 mi away"
              : `${distanceMi.toFixed(1)} mi away`}
          </div>
        )}

        {rating != null && (
          <div className="flex items-center gap-1.5 mb-2">
            <StarBar rating={rating} />
            <span className="text-xs font-bold">{rating.toFixed(1)}</span>
            {review_count != null && (
              <span className="text-[11px] text-brand-teal">
                ({review_count})
              </span>
            )}
          </div>
        )}

        {description && (
          <p className="text-xs text-gray-500 line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}