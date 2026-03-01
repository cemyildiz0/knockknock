"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap, Pane } from "react-leaflet";
import L from "leaflet";
import type { MultiPolygon } from "geojson";

import "leaflet/dist/leaflet.css";

export interface BoundaryEntry {
  id: number;
  name: string;
  boundary: MultiPolygon;
}

export interface HomePoint {
  id: string;
  lat: number;
  lng: number;
  address: string;
}

interface SavedMapProps {
  boundaries: BoundaryEntry[];
  homePoints: HomePoint[];
  selectedId: number | null;
  selectedHomeId: string | null;
  onSelect: (id: number) => void;
  onSelectHome: (id: string) => void;
}

function FitAll({
  boundaries,
  homePoints,
}: {
  boundaries: BoundaryEntry[];
  homePoints: HomePoint[];
}) {
  const map = useMap();

  useEffect(() => {
    let bounds: L.LatLngBounds | null = null;

    for (const b of boundaries) {
      try {
        const lb = L.geoJSON(b.boundary).getBounds();
        if (lb.isValid()) {
          bounds = bounds ? bounds.extend(lb) : lb;
        }
      } catch {
        // skip invalid geometry
      }
    }

    for (const pt of homePoints) {
      const ll = L.latLng(pt.lat, pt.lng);
      bounds = bounds ? bounds.extend(ll) : L.latLngBounds([ll, ll]);
    }

    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48] });
    } else {
      map.setView([33.6846, -117.8265], 12);
    }
  }, [map, boundaries, homePoints]);

  return null;
}

export default function SavedMap({ boundaries, homePoints, selectedId, selectedHomeId, onSelect, onSelectHome }: SavedMapProps) {
  return (
    <MapContainer
      center={[33.6846, -117.8265]}
      zoom={12}
      className="h-full w-full"
      zoomControl
      scrollWheelZoom
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {boundaries.map((b) => {
        const active = selectedId === b.id;
        return (
          <GeoJSON
            key={`${b.id}-${active}`}
            data={b.boundary}
            style={() => ({
              color: active ? "#f97316" : "#0d9488",
              weight: active ? 2.5 : 1.5,
              opacity: 0.9,
              fillColor: active ? "#f97316" : "#0d9488",
              fillOpacity: active ? 0.2 : 0.1,
            })}
            onEachFeature={(_feature, layer) => {
              layer.bindTooltip(
                `<span style="font-size:12px;font-weight:600;white-space:nowrap">${b.name}</span>`,
                { sticky: true, opacity: 0.95 }
              );
              layer.on({ click: () => onSelect(b.id) });
            }}
          />
        );
      })}

      <Pane name="home-pins" style={{ zIndex: 450 }}>
        {homePoints.map((pt) => {
          const active = selectedHomeId === pt.id;
          return (
            <CircleMarker
              key={`${pt.id}-${active}`}
              center={[pt.lat, pt.lng]}
              radius={active ? 9 : 6}
              pathOptions={{
                color: "#ffffff",
                weight: 1.5,
                fillColor: active ? "#f97316" : "#0d9488",
                fillOpacity: 1,
              }}
              eventHandlers={{ click: () => onSelectHome(pt.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {pt.address}
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </Pane>

      <FitAll boundaries={boundaries} homePoints={homePoints} />
    </MapContainer>
  );
}
