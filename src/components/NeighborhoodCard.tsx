"use client";

import { Neighborhood } from "@/types/neighborhood";
import StarRating from "./StarRating";
import Link from "next/link";

interface Props {
  neighborhood: Neighborhood;
}

export default function NeighborhoodCard({ neighborhood }: Props) {
  const average =
    neighborhood.reviews.reduce((acc, r) => acc + r.rating, 0) /
    neighborhood.reviews.length;

  return (
    <Link href={`/neighborhood/${neighborhood.id}`}>
      <div className="bg-white p-5 rounded-xl hover:bg-neutral-100 transition cursor-pointer">
        <h2 className="text-xl font-semibold">
          {neighborhood.name}
        </h2>
        <p className="text-neutral-400 text-sm">
          {neighborhood.city}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={average} />
          <span className="text-sm text-neutral-400">
            ({neighborhood.reviews.length} reviews)
          </span>
        </div>
      </div>
    </Link>
  );
}