"use client";

import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import Link from "next/link";

interface Props {
  neighborhood: CommunityNeighborhood;
}

export default function NeighborhoodCard({ neighborhood }: Props) {
  return (
    <Link href={`/neighborhood/${neighborhood.id}`}>
      <div className="bg-white p-5 rounded-xl hover:bg-neutral-100 transition cursor-pointer">
        <h2 className="text-xl font-semibold">
          {neighborhood.name}
        </h2>
        {neighborhood.area_sqmi && (
          <p className="text-neutral-400 text-sm">
            {neighborhood.area_sqmi.toFixed(2)} sq mi
          </p>
        )}
      </div>
    </Link>
  );
}
