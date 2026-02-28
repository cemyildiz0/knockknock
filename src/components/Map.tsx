"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { supabase } from "@/lib/supabase";
import type { LivabilityRegion } from "@/types/livability";
import LivabilityLayer from "@/components/LivabilityLayer";
import LivabilityLegend from "@/components/LivabilityLegend";
import LivabilitySidebar from "@/components/LivabilitySidebar";

import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AddressPoint {
  id: number;
  address: string;
  prefix: string | null;
  pretype: string | null;
  name: string;
  sttype: string | null;
  suffix: string | null;
  unit: string | null;
  streetname: string;
  pa: number;
  code: string;
  status: number;
  res: string;
  mun: string;
  longitude: number;
  latitude: number;
}

const IRVINE_CENTER: [number, number] = [33.6846, -117.8265];
const MAX_POINTS = 5000;

function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

export default function Map() {
  const [points, setPoints] = useState<AddressPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [regions, setRegions] = useState<LivabilityRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<LivabilityRegion | null>(null);

  useEffect(() => {
    async function fetchRegions() {
      const { data, error } = await supabase
        .from("livability_regions")
        .select("*");

      if (error) {
        console.error("Error fetching livability regions:", error.message);
        return;
      }

      setRegions(data ?? []);
    }
    fetchRegions();
  }, []);

  const fetchPoints = useCallback(async (bounds: L.LatLngBounds) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    const south = bounds.getSouth();
    const north = bounds.getNorth();
    const west = bounds.getWest();
    const east = bounds.getEast();

    const { data, error, count } = await supabase
      .from("address_points")
      .select("*", { count: "exact" })
      .gte("latitude", south)
      .lte("latitude", north)
      .gte("longitude", west)
      .lte("longitude", east)
      .limit(MAX_POINTS)
      .abortSignal(abortControllerRef.current.signal);

    if (error) {
      if (error.message !== "AbortError: signal is aborted without reason") {
        console.error("Error fetching points:", error.message);
      }
      setLoading(false);
      return;
    }

    setPoints(data ?? []);
    setTotalCount(count);
    setLoading(false);
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={IRVINE_CENTER}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; CNES, Distribution Airbus DS, &copy; Airbus DS, &copy; PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
          minZoom={0}
          maxZoom={20}
        />
        <MapEvents onBoundsChange={fetchPoints} />
        <LivabilityLayer regions={regions} onRegionClick={setSelectedRegion} />
        <MarkerClusterGroup chunkedLoading>
          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{point.address} {point.streetname}</p>
                  {point.unit && <p>Unit: {point.unit}</p>}
                  <p>PA: {point.pa}</p>
                  <p>Type: {point.res}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      <LivabilitySidebar region={selectedRegion} onClose={() => setSelectedRegion(null)} />
      <LivabilityLegend />
      <div className="absolute top-4 right-4 z-[1000] bg-neutral-900 text-neutral-100 px-3 py-2 rounded text-sm">
        {loading ? (
          <span>Loading...</span>
        ) : (
          <span>
            Showing {points.length}
            {totalCount !== null && totalCount > MAX_POINTS
              ? ` of ${totalCount.toLocaleString()}`
              : ""}{" "}
            points
          </span>
        )}
      </div>
    </div>
  );
}
