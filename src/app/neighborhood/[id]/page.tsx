"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft, ChevronRight, Navigation, Thermometer } from "lucide-react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import type { LivabilityRegion } from "@/types/livability";
import type { PoiCounts } from "@/types/poi";
import NeighborhoodStats from "@/components/NeighborhoodStats";
import KnockGame from "@/components/KnockGame";

const NeighborhoodBoundaryMap = dynamic(
  () => import("@/components/NeighborhoodBoundaryMap"),
  { ssr: false }
);

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtCost(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function NeighborhoodPage() {
  const params = useParams();
  const [neighborhood, setNeighborhood] = useState<CommunityNeighborhood | null>(null);
  const [livability, setLivability] = useState<LivabilityRegion | null>(null);
  const [poiCounts, setPoiCounts] = useState<PoiCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [distanceMi, setDistanceMi] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  useEffect(() => {
    if (!neighborhood?.center_lat || !neighborhood?.center_lng) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = haversine(
          pos.coords.latitude,
          pos.coords.longitude,
          neighborhood.center_lat!,
          neighborhood.center_lng!
        );
        setDistanceMi(d);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {}
    );
  }, [neighborhood]);

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
            {livability != null && (
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                {livability.metrics.met_house_cost != null && (
                  <span>{fmtCost(livability.metrics.met_house_cost)}/mo cost of living</span>
                )}
                  {livability.demographics.demo_income != null && (
                  <span>|</span>
                )}
                {livability.demographics.demo_income != null && (
                  <span>{fmtCost(livability.demographics.demo_income)} median income</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 py-3 text-sm overflow-x-auto">
            {distanceMi != null && (
              <div className="flex items-center gap-2 shrink-0">
                <Navigation size={13} className="text-brand-teal" />
                <span className="text-brand-teal">Distance</span>
                <span className="font-semibold text-brand-navy">
                  {distanceMi < 0.1 ? "< 0.1 mi" : `${distanceMi.toFixed(1)} mi away`}
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
            {/* Boundary map */}
            {neighborhood.boundary && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="h-56">
                  <NeighborhoodBoundaryMap
                    boundary={neighborhood.boundary}
                    name={neighborhood.name}
                    userLocation={userLocation ?? undefined}
                  />
                </div>
              </div>
            )}

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

              {livability?.climate && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal flex items-center gap-1">
                      <Thermometer size={12} />
                      Winter (Jan)
                    </span>
                    <span className="font-medium text-brand-navy">
                      {livability.climate.climate_jan_min.toFixed(0)}°–{livability.climate.climate_jan_max.toFixed(0)}°F
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-teal flex items-center gap-1">
                      <Thermometer size={12} />
                      Summer (Jul)
                    </span>
                    <span className="font-medium text-brand-navy">
                      {livability.climate.climate_jul_min.toFixed(0)}°–{livability.climate.climate_jul_max.toFixed(0)}°F
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
