"use client";

import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, LeafletMouseEvent } from "leaflet";
import type { LivabilityRegion } from "@/types/livability";
import { getScoreColor } from "@/lib/livability-colors";

interface LivabilityLayerProps {
  regions: LivabilityRegion[];
  onRegionClick: (region: LivabilityRegion) => void;
}

export default function LivabilityLayer({ regions, onRegionClick }: LivabilityLayerProps) {
  const featureCollection = useMemo<FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: regions.map((region) => ({
      type: "Feature" as const,
      geometry: region.geometry,
      properties: {
        geoid: region.geoid,
        score: region.score,
      },
    })),
  }), [regions]);

  const regionLookup = useMemo(() => {
    const map = new Map<string, LivabilityRegion>();
    for (const region of regions) {
      map.set(region.geoid, region);
    }
    return map;
  }, [regions]);

  if (regions.length === 0) return null;

  return (
    <GeoJSON
      key={regions.length}
      data={featureCollection}
      style={(feature) => {
        const score = feature?.properties?.score ?? 50;
        return {
          fillColor: getScoreColor(score),
          fillOpacity: 0.35,
          color: "#ededed",
          weight: 1,
          opacity: 0.6,
        };
      }}
      onEachFeature={(feature: Feature, layer: Layer) => {
        layer.on({
          click: () => {
            const geoid = feature.properties?.geoid;
            const region = regionLookup.get(geoid);
            if (region) {
              onRegionClick(region);
            }
          },
          mouseover: (e: LeafletMouseEvent) => {
            const target = e.target;
            target.setStyle({
              fillOpacity: 0.55,
              weight: 2,
            });
            target.bringToFront();
          },
          mouseout: (e: LeafletMouseEvent) => {
            const target = e.target;
            target.setStyle({
              fillOpacity: 0.35,
              weight: 1,
            });
          },
        });
      }}
    />
  );
}
