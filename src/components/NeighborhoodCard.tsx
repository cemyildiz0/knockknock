"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";

interface Props {
  neighborhood: CommunityNeighborhood;
  aiDescription?: string;
  aiScore?: number;
  featured?: boolean;
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

export default function NeighborhoodCard({ neighborhood, aiDescription, aiScore, featured }: Props) {
  const [saved, setSaved] = useState(false);
  const { name, image_url, city, state, description, rating, review_count } = neighborhood;

  return (
    <Link
      href={`/neighborhood/${neighborhood.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-teal/25 transition-all duration-200 break-inside-avoid mb-5"
    >
      {/* Image -- taller for featured */}
      {image_url && (
        <div className={`relative w-full overflow-hidden ${featured ? "h-64" : "h-40"}`}>
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Save button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSaved((s) => !s);
            }}
            className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
              saved
                ? "bg-brand-orange text-white"
                : "bg-black/20 backdrop-blur-sm text-white/80 hover:bg-black/40"
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

          {/* Name overlaid on image for featured cards */}
          {featured && (
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-bold text-white leading-tight">{name}</h3>
              {(city || state) && (
                <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                  <MapPin size={10} />
                  {[city, state].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No image fallback */}
      {!image_url && (
        <div className="h-24 bg-brand-navy/5 flex items-center justify-center">
          <MapPin size={24} className="text-brand-teal/25" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Name + location (if not featured overlay) */}
        {!featured && (
          <>
            <h3 className="font-bold text-brand-navy text-base leading-snug mb-1 group-hover:text-brand-teal-dark transition-colors">
              {name}
            </h3>
            {(city || state) && (
              <div className="flex items-center gap-1 text-brand-teal text-xs mb-2">
                <MapPin size={10} />
                {[city, state].filter(Boolean).join(", ")}
              </div>
            )}
          </>
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

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">
            {description}
          </p>
        )}

        {/* AI description */}
        {aiDescription && (
          <div className="bg-brand-mint/8 border border-brand-mint/20 rounded-lg p-2.5 mb-3">
            <p className="text-[11px] text-brand-navy/60 italic leading-relaxed">
              &quot;{aiDescription}&quot;
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
