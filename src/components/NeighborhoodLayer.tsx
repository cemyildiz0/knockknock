"use client";

import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, LeafletMouseEvent } from "leaflet";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";

interface NeighborhoodLayerProps {
  neighborhoods: CommunityNeighborhood[];
}

const BASE_STYLE = {
  color: "#60a5fa",
  weight: 2,
  opacity: 0.7,
  fillOpacity: 0.06,
  fillColor: "#60a5fa",
  dashArray: "6, 4",
};

export default function NeighborhoodLayer({ neighborhoods }: NeighborhoodLayerProps) {
  const featureCollection = useMemo<FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: neighborhoods.map((n) => ({
      type: "Feature" as const,
      geometry: n.boundary,
      properties: {
        geo_id: n.geo_id,
        name: n.name,
        area_sqmi: n.area_sqmi,
      },
    })),
  }), [neighborhoods]);

  if (neighborhoods.length === 0) return null;

  return (
    <GeoJSON
      key={neighborhoods.length}
      data={featureCollection}
      style={() => BASE_STYLE}
      onEachFeature={(feature: Feature, layer: Layer) => {
        const name = feature.properties?.name ?? "Unknown";
        const area = feature.properties?.area_sqmi;
        const areaText = area ? `${area.toFixed(2)} sq mi` : "";

        layer.bindPopup(
          `<div style="font-family: system-ui, sans-serif;">
            <p style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0;">${name}</p>
            ${areaText ? `<p style="font-size: 12px; color: #666; margin: 0;">${areaText}</p>` : ""}
          </div>`,
          { className: "leaflet-popup-dark" }
        );

        layer.on({
          mouseover: (e: LeafletMouseEvent) => {
            const target = e.target as L.Path;
            target.setStyle({ weight: 3, fillOpacity: 0.15, opacity: 1 });
            target.bringToFront();
          },
          mouseout: (e: LeafletMouseEvent) => {
            const target = e.target as L.Path;
            target.setStyle({ weight: BASE_STYLE.weight, fillOpacity: BASE_STYLE.fillOpacity, opacity: BASE_STYLE.opacity });
          },
        });
      }}
    />
  );
}
