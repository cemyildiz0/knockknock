"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft, ChevronRight, Ruler } from "lucide-react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import type { LivabilityRegion } from "@/types/livability";
import type { PoiCounts } from "@/types/poi";
import NeighborhoodStats from "@/components/NeighborhoodStats";
import KnockGame from "@/components/KnockGame";

export default function NeighborhoodPage() {
  const params = useParams();
  const [neighborhood, setNeighborhood] = useState<CommunityNeighborhood | null>(null);
  const [livability, setLivability] = useState<LivabilityRegion | null>(null);
  const [poiCounts, setPoiCounts] = useState<PoiCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNeighborhood() {
      const id = Number(params.id);
      if (isNaN(id)) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/neighborhoods/${id}?include=livability,pois`);
        if (!res.ok) {
          console.error("Error fetching neighborhood:", res.statusText);
        } else {
          const json: {
            neighborhood: CommunityNeighborhood;
            livability?: LivabilityRegion | null;
            poi_counts?: PoiCounts | null;
          } = await res.json();

          setNeighborhood(json.neighborhood);
          setLivability(json.livability ?? null);
          setPoiCounts(json.poi_counts ?? null);
        }
      } catch (err) {
        console.error("Error fetching neighborhood:", err);
      }

      setLoading(false);
    }

    fetchNeighborhood();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF7]">
        <div className="w-full h-72 bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-100 rounded w-1/3" />
            <div className="h-5 bg-gray-100 rounded w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-40 bg-gray-100 rounded-xl" />
                ))}
              </div>
              <div className="h-80 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!neighborhood) {
    return (
      <main className="min-h-screen bg-[#F8FAF7] flex items-center justify-center pt-16">
        <div className="text-center">
          <MapPin size={48} className="text-brand-teal/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-navy mb-2">Neighborhood not found</h2>
          <p className="text-brand-teal text-sm mb-4">
            This neighborhood may have been removed or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-orange hover:underline"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      {/* Hero banner */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-brand-navy">
        {neighborhood.image_url ? (
          <>
            <Image
              src={neighborhood.image_url}
              alt={neighborhood.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-brand-navy/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-navy" />
        )}

        {/* Breadcrumb */}
        <div className="absolute top-0 left-0 right-0 pt-20 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <span className="text-white/90">{neighborhood.name}</span>
            </div>
          </div>
        </div>

        {/* Name overlaid on hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
              {neighborhood.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              {(neighborhood.city || neighborhood.state) && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <MapPin size={13} />
                  <span>
                    {[neighborhood.city, neighborhood.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {neighborhood.area_sqmi && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Ruler size={13} />
                  <span>{neighborhood.area_sqmi.toFixed(2)} sq mi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 py-3 text-sm overflow-x-auto">
            {neighborhood.area_sqmi && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Area</span>
                <span className="font-semibold text-brand-navy">
                  {neighborhood.area_sqmi.toFixed(2)} sq mi
                </span>
              </div>
            )}
            {(neighborhood.city || neighborhood.state) && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-brand-teal">Location</span>
                <span className="font-semibold text-brand-navy">
                  {[neighborhood.city, neighborhood.state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <NeighborhoodStats livability={livability} poiCounts={poiCounts} />
            <KnockGame neighborhoodId={neighborhood.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-brand-navy mb-3">About this Neighborhood</h3>
              {neighborhood.description ? (
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {neighborhood.description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic mb-4">
                  No description available yet.
                </p>
              )}

              <div className="space-y-3 pt-3 border-t border-gray-100">
                {neighborhood.area_sqmi && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Area</span>
                    <span className="font-medium text-brand-navy">
                      {neighborhood.area_sqmi.toFixed(2)} sq mi
                    </span>
                  </div>
                )}
                {(neighborhood.city || neighborhood.state) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal">Location</span>
                    <span className="font-medium text-brand-navy">
                      {[neighborhood.city, neighborhood.state].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
