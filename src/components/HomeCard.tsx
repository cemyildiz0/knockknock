"use client";

import Link from "next/link";
import { MapPin, Heart, Sparkles, BedDouble, Bath, Layers, Ruler } from "lucide-react";
import { useState } from "react";
import type { Home } from "@/types/home";

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

export default function HomeCard({ home, aiDescription, aiScore, featured, image_url }: Props) {
  const [saved, setSaved] = useState(false);
  const { id, address_line1, city, state, zip, property_type, living_area, beds, baths, levels, last_sale_price, last_sale_date } = home;

  return (
    <Link
      href={`/home/${id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-teal/25 transition-all duration-200 break-inside-avoid mb-5"
    >
      {/* Image */}
      {image_url ? (
        <div className={`relative w-full overflow-hidden ${featured ? "h-64" : "h-40"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image_url}
            alt={address_line1}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Save button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved((s) => !s); }}
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
        /* No image fallback */
        <div className="h-24 bg-brand-navy/5 flex items-center justify-center">
          <MapPin size={24} className="text-brand-teal/25" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Address (if not featured overlay) */}
        {!featured && (
          <>
            <h3 className="font-bold text-brand-navy text-base leading-snug mb-1 group-hover:text-brand-teal-dark transition-colors">
              {address_line1}
            </h3>
            <div className="flex items-center gap-1 text-brand-teal text-xs mb-2">
              <MapPin size={10} />
              {[city, state, zip].filter(Boolean).join(", ")}
            </div>
          </>
        )}

        {/* Property type */}
        {property_type && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-brand-teal/80 bg-brand-teal/8 border border-brand-teal/15 rounded px-2 py-0.5 mb-2.5">
            {property_type}
          </span>
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
            {last_sale_date && (
              <span className="text-[11px] text-brand-teal">
                sold {new Date(last_sale_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            )}
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