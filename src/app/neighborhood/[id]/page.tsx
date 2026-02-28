"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import { mockReviews } from "@/data/mockReviews";
import StarRating from "@/components/StarRating";

export default function NeighborhoodPage() {
  const params = useParams();
  const [neighborhood, setNeighborhood] = useState<CommunityNeighborhood | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeighborhood() {
      const id = Number(params.id);
      if (isNaN(id)) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("community_neighborhoods")
        .select("id, geo_id, legacy_id, name, area_sqmi, center_lat, center_lng")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching neighborhood:", error.message);
      } else {
        setNeighborhood(data as CommunityNeighborhood);
      }

      setLoading(false);
    }

    fetchNeighborhood();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <p className="text-neutral-400">Loading...</p>
      </main>
    );
  }

  if (!neighborhood) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <p>Neighborhood not found</p>
      </main>
    );
  }

  const average =
    mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <h1 className="text-3xl font-bold">
        {neighborhood.name}
      </h1>

      {neighborhood.area_sqmi && (
        <p className="text-neutral-400 mt-1">
          {neighborhood.area_sqmi.toFixed(2)} sq mi
        </p>
      )}

      <div className="flex items-center gap-3 mt-3">
        <StarRating rating={average} />
        <span className="text-neutral-400">
          {mockReviews.length} reviews
        </span>
      </div>

      <div className="mt-10 space-y-6">
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="bg-neutral-800 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <strong>{review.user}</strong>
              <StarRating rating={review.rating} />
            </div>
            <p className="mt-2 text-neutral-300">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
