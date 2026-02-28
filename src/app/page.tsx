"use client";

import dynamic from "next/dynamic";

import React from 'react';
import ReactStars from 'react-stars';
import Link from "next/link";
import { mockNeighborhoods } from "@/data/mockNeighborhoods";
import NeighborhoodCard from "@/components/NeighborhoodCard";
import Header from "@/components/Header";


export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-neutral-950 text-neutral-100">
      <Header />
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
};

