"use client";

import dynamic from "next/dynamic";

import React from 'react';
import { mockNeighborhoods } from "@/data/mockNeighborhoods";
import NeighborhoodCard from "@/components/NeighborhoodCard";



export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#f5f6f5] text-black">
      <h2 className="mb-4 text-lg font-semibold">
        Neighborhoods Near You
      </h2>
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
};

