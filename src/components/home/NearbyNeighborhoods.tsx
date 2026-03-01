"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, LocateFixed, LocateOff } from "lucide-react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import NeighborhoodCard from "@/components/NeighborhoodCard";

type NearbyNeighborhood = CommunityNeighborhood & { distance_mi: number };

type LocationStatus = "idle" | "requesting" | "loading" | "success" | "denied" | "error";

const NEARBY_LIMIT = 6;

export default function NearbyNeighborhoods() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [neighborhoods, setNeighborhoods] = useState<NearbyNeighborhood[]>([]);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/neighborhoods/nearby?lat=${lat}&lng=${lng}&limit=${NEARBY_LIMIT}`
      );
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const json: { data: NearbyNeighborhood[] } = await res.json();
      setNeighborhoods(json.data ?? []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  const requestLocation = useCallback(() => {
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchNearby(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      }
    );
  }, [fetchNearby]);

  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        requestLocation();
      }
    });
  }, [requestLocation]);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-100">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-brand-navy">
            Nearby Neighborhoods
          </h2>
          {status === "success" && neighborhoods.length > 0 && (
            <p className="text-sm text-brand-teal mt-0.5">
              Closest neighborhoods to your location
            </p>
          )}
        </div>

        {(status === "success" || status === "denied" || status === "error") && (
          <button
            onClick={requestLocation}
            className="flex items-center gap-1.5 text-xs text-brand-teal hover:text-brand-navy font-medium transition-colors"
          >
            <LocateFixed size={13} />
            Refresh location
          </button>
        )}
      </div>

      {status === "idle" && (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-gray-200">
          <MapPin size={36} className="text-brand-teal/30 mb-3" />
          <p className="text-brand-navy font-semibold mb-1">Find neighborhoods near you</p>
          <p className="text-sm text-brand-teal mb-5">
            Share your location to see the closest neighborhoods.
          </p>
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors"
          >
            <LocateFixed size={14} />
            Share location
          </button>
        </div>
      )}

      {(status === "requesting" || status === "loading") && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {Array.from({ length: NEARBY_LIMIT }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse break-inside-avoid mb-5"
            >
              <div className="h-40 bg-gray-50" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-50 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/3" />
                <div className="h-3 bg-gray-50 rounded w-full" />
                <div className="h-3 bg-gray-50 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "denied" && (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-gray-200">
          <LocateOff size={36} className="text-brand-teal/30 mb-3" />
          <p className="text-brand-navy font-semibold mb-1">Location access denied</p>
          <p className="text-sm text-brand-teal">
            Enable location access in your browser settings to see nearby neighborhoods.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-gray-200">
          <MapPin size={36} className="text-brand-teal/30 mb-3" />
          <p className="text-brand-navy font-semibold mb-1">Could not get location</p>
          <p className="text-sm text-brand-teal mb-5">Something went wrong. Please try again.</p>
          <button
            onClick={requestLocation}
            className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors"
          >
            <LocateFixed size={14} />
            Try again
          </button>
        </div>
      )}

      {status === "success" && neighborhoods.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed border-gray-200">
          <MapPin size={36} className="text-brand-teal/30 mb-3" />
          <p className="text-brand-navy font-semibold mb-1">No nearby neighborhoods found</p>
          <p className="text-sm text-brand-teal">
            We couldn&apos;t find any neighborhoods close to your location.
          </p>
        </div>
      )}

      {status === "success" && neighborhoods.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {neighborhoods.map((neighborhood) => (
            <NeighborhoodCard
              key={neighborhood.id}
              neighborhood={neighborhood}
              distanceMi={neighborhood.distance_mi}
            />
          ))}
        </div>
      )}
    </section>
  );
}
