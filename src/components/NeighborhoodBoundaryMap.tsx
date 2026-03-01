"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import type { MultiPolygon } from "geojson";

import "leaflet/dist/leaflet.css";

interface UserLocation {
  lat: number;
  lng: number;
}

interface NeighborhoodBoundaryMapProps {
  boundary: MultiPolygon;
  name: string;
  userLocation?: UserLocation;
}

const BOUNDARY_STYLE: L.PathOptions = {
  color: "#60a5fa",
  weight: 2,
  opacity: 0.9,
  fillColor: "#60a5fa",
  fillOpacity: 0.18,
};

const USER_PIN_STYLE: L.CircleMarkerOptions = {
  radius: 7,
  color: "#ffffff",
  weight: 2,
  fillColor: "#f97316",
  fillOpacity: 1,
};

function FitBounds({ boundary, userLocation }: { boundary: MultiPolygon; userLocation?: UserLocation }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.geoJSON(boundary);
    const bounds = layer.getBounds();
    if (!bounds.isValid()) return;

    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    map.fitBounds(bounds, { padding: [20, 20] });
  }, [map, boundary, userLocation]);

  return null;
}

export default function NeighborhoodBoundaryMap({ boundary, name, userLocation }: NeighborhoodBoundaryMapProps) {
  return (
    <MapContainer
      center={[33.6846, -117.8265]}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <GeoJSON
        key={name}
        data={boundary}
        style={() => BOUNDARY_STYLE}
      />
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          pathOptions={USER_PIN_STYLE}
        />
      )}
      <FitBounds boundary={boundary} userLocation={userLocation} />
    </MapContainer>
  );
}
