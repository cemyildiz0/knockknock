"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { aggregatePoisByZip } from "@/lib/poi-aggregation";
import type { LivabilityRegion } from "@/types/livability";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import type { SchoolDistrict } from "@/types/school-district";
import type { PoiCounts } from "@/types/poi";
import LivabilityLayer from "@/components/LivabilityLayer";
import NeighborhoodLayer from "@/components/NeighborhoodLayer";
import SchoolDistrictLayer from "@/components/SchoolDistrictLayer";
import LivabilitySidebar from "@/components/LivabilitySidebar";
import LayerControls from "@/components/LayerControls";
import type { LayerVisibility } from "@/components/LayerControls";
import type { AddressPoint } from "@/types/address-point";

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
  const [neighborhoods, setNeighborhoods] = useState<CommunityNeighborhood[]>([]);
  const [districts, setDistricts] = useState<SchoolDistrict[]>([]);
  const [poiCountsByZip, setPoiCountsByZip] = useState<Record<string, PoiCounts>>({});

  const [selectedRegion, setSelectedRegion] = useState<LivabilityRegion | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    livability: true,
    neighborhoods: true,
    districts: true,
    addresses: true,
  });

  useEffect(() => {
    async function fetchLayers() {
      try {
        const [layersRes, poisRes] = await Promise.all([
          fetch("/api/map/layers"),
          fetch("/api/map/pois"),
        ]);

        if (layersRes.ok) {
          const layers: {
            regions: LivabilityRegion[];
            neighborhoods: CommunityNeighborhood[];
            districts: SchoolDistrict[];
          } = await layersRes.json();
          setRegions(layers.regions ?? []);
          setNeighborhoods(layers.neighborhoods ?? []);
          setDistricts(layers.districts ?? []);
        } else {
          console.error("Error fetching map layers:", layersRes.statusText);
        }

        if (poisRes.ok) {
          const pois: { zip_code: string | null; category: string }[] = await poisRes.json();
          setPoiCountsByZip(aggregatePoisByZip(pois));
        } else {
          console.error("Error fetching POIs:", poisRes.statusText);
        }
      } catch (err) {
        console.error("Error fetching map data:", err);
      }
    }

    fetchLayers();
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

    try {
      const res = await fetch(
        `/api/map/address-points?south=${south}&north=${north}&west=${west}&east=${east}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!res.ok) {
        console.error("Error fetching points:", res.statusText);
        setLoading(false);
        return;
      }

      const { data, count }: { data: AddressPoint[]; count: number | null } = await res.json();
      setPoints(data ?? []);
      setTotalCount(count);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setLoading(false);
        return;
      }
      console.error("Error fetching points:", err);
    }

    setLoading(false);
  }, []);

  function handleLayerToggle(key: keyof LayerVisibility) {
    setLayerVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const selectedPoiCounts = selectedRegion ? poiCountsByZip[selectedRegion.geoid] : undefined;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={IRVINE_CENTER}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onBoundsChange={fetchPoints} />

        {layerVisibility.livability && (
          <LivabilityLayer regions={regions} onRegionClick={setSelectedRegion} />
        )}
        {layerVisibility.districts && (
          <SchoolDistrictLayer districts={districts} />
        )}
        {layerVisibility.neighborhoods && (
          <NeighborhoodLayer neighborhoods={neighborhoods} />
        )}

        {layerVisibility.addresses && (
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
        )}
      </MapContainer>

      <LivabilitySidebar
        region={selectedRegion}
        poiCounts={selectedPoiCounts}
        onClose={() => setSelectedRegion(null)}
      />
      <LayerControls layers={layerVisibility} onToggle={handleLayerToggle} />

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
