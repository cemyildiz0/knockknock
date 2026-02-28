"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import NeighborhoodCard from "@/components/NeighborhoodCard";

export default function Home() {
  const [neighborhoods, setNeighborhoods] = useState<CommunityNeighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeighborhoods() {
      const { data, error } = await supabase
        .from("community_neighborhoods")
        .select("id, geo_id, legacy_id, name, area_sqmi, center_lat, center_lng");

      if (error) {
        console.error("Error fetching community neighborhoods:", error.message);
      } else {
        setNeighborhoods((data as CommunityNeighborhood[]) ?? []);
      }

      setLoading(false);
    }

    fetchNeighborhoods();
  }, []);

  return (
    <div className="flex flex-col items-center h-full w-full bg-neutral-950 text-neutral-100 overflow-y-auto py-8">
      <h2 className="mb-4 text-lg font-semibold">
        Recommended Neighborhoods
      </h2>
      {loading ? (
        <p className="text-neutral-400">Loading neighborhoods...</p>
      ) : (
        <div className="space-y-6">
          {neighborhoods.map((neighborhood) => (
            <NeighborhoodCard
              key={neighborhood.id}
              neighborhood={neighborhood}
            />
          ))}
        </div>
      )}
    </div>
  );
}
