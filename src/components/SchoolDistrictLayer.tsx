"use client";

import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, LeafletMouseEvent } from "leaflet";
import type { SchoolDistrict } from "@/types/school-district";

interface SchoolDistrictLayerProps {
  districts: SchoolDistrict[];
}

const BASE_STYLE = {
  color: "#f59e0b",
  weight: 2.5,
  opacity: 0.7,
  fillOpacity: 0.04,
  fillColor: "#f59e0b",
  dashArray: "12, 6",
};

export default function SchoolDistrictLayer({ districts }: SchoolDistrictLayerProps) {
  const featureCollection = useMemo<FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: districts.map((d) => ({
      type: "Feature" as const,
      geometry: d.boundary,
      properties: {
        geo_id: d.geo_id,
        name: d.name,
      },
    })),
  }), [districts]);

  if (districts.length === 0) return null;

  return (
    <GeoJSON
      key={districts.length}
      data={featureCollection}
      style={() => BASE_STYLE}
      onEachFeature={(feature: Feature, layer: Layer) => {
        const name = feature.properties?.name ?? "Unknown";

        layer.bindPopup(
          `<div style="font-family: system-ui, sans-serif;">
            <p style="font-weight: 600; font-size: 14px; margin: 0;">${name}</p>
          </div>`,
          { className: "leaflet-popup-dark" }
        );

        layer.on({
          mouseover: (e: LeafletMouseEvent) => {
            const target = e.target as L.Path;
            target.setStyle({ weight: 3.5, fillOpacity: 0.12, opacity: 1 });
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
