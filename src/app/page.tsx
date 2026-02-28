"use client";

// import dynamic from "next/dynamic";

import React from 'react';
import ReactStars from 'react-stars';
import Link from "next/link";
import { mockNeighborhoods } from "@/data/mockNeighborhoods";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import NeighborhoodCard from "@/components/NeighborhoodCard";
import HeroSection from "@/components/home/Hero";



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
    <div className="flex flex-col items-center w-full min-h-screen bg-neutral-950 text-neutral-100">
      <HeroSection/>
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
