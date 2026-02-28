"use client";

// import dynamic from "next/dynamic";

import React from 'react';
import { mockNeighborhoods } from "@/data/mockNeighborhoods";
import { useEffect, useState } from "react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import NeighborhoodCard from "@/components/NeighborhoodCard";
import HeroSection from "@/components/home/Hero";



export default function Home() {
  const [neighborhoods, setNeighborhoods] = useState<CommunityNeighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const res = await fetch("/api/neighborhoods");
        if (!res.ok) {
          console.error("Error fetching community neighborhoods:", res.statusText);
        } else {
          const data: CommunityNeighborhood[] = await res.json();
          setNeighborhoods(data ?? []);
        }
      } catch (err) {
        console.error("Error fetching community neighborhoods:", err);
      }

      setLoading(false);
    }

    fetchNeighborhoods();
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#f5f6f5] text-black">
      <HeroSection/>
      <h2 className="mb-4 text-lg font-semibold">
        Reconmended Neighborhoods
      </h2>
      {/* <ReactStars count={5} size={24} color2="#ffd700" /> */}
      <div className="space-y-6">
        {mockNeighborhoods.map((neighborhood) => (
          <NeighborhoodCard
            key={neighborhood.id}
            neighborhood={neighborhood}
          />
        ))}
      </div>
    </div>
  );
}
