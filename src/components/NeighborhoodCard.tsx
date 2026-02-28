"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";

interface Props {
  neighborhood: CommunityNeighborhood;
  /** Optional AI-generated match description, shown when returned from search */
  aiDescription?: string;
  /** Optional AI match score (0–100) */
  aiScore?: number;
}

export default function NeighborhoodCard({ neighborhood, aiDescription, aiScore }: Props) {
  const [saved, setSaved] = useState(false);

  const { name, image_url, city, state, description, rating, review_count } = neighborhood;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 w-full">
      {/* Image */}
      <div className="relative w-full h-48">
        {image_url ? (
          <Image src={image_url} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-200" />
        )}

        {/* AI Score badge */}
        {aiScore != null && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 text-amber-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            <Sparkles size={12} className="fill-amber-400" />
            {aiScore} AI Score
          </div>
        )}

        {/* Save / heart button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setSaved((s) => !s);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
          aria-label="Save neighborhood"
        >
          <Heart
            size={15}
            className={saved ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-lg leading-snug">{name}</h3>
          {rating != null && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
              {review_count != null && (
                <span className="text-xs text-gray-400">({review_count})</span>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        {(city || state) && (
          <div className="flex items-center gap-1 text-xs text-gray-400 -mt-1">
            <MapPin size={11} />
            <span>{[city, state].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        )}

        {/* AI Match reasoning */}
        {aiDescription && (
          <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 italic leading-relaxed">
              &quot;{aiDescription}&quot;
            </p>
          </div>
        )}

        {/* View Details button */}
        <Link
          href={`/neighborhood/${neighborhood.id}`}
          className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-900 font-semibold text-sm py-3 rounded-xl transition-colors duration-150 mt-1"
        >
          View Details
          <ArrowRight size={15} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}


// export default function NeighborhoodCard({ neighborhood }: Props) {
//   return (
//     <Link href={`/neighborhood/${neighborhood.id}`}>
//       <div className="bg-neutral-800 p-5 rounded-xl hover:bg-neutral-700 transition cursor-pointer">
//         <h2 className="text-xl font-semibold">
//           {neighborhood.name}
//         </h2>
//         {neighborhood.area_sqmi && (
//           <p className="text-neutral-400 text-sm">
//             {neighborhood.area_sqmi.toFixed(2)} sq mi
//           </p>
//         )}
//       </div>
//     </Link>
//   );
// }
