import type { MultiPolygon } from "geojson";

export interface SchoolDistrict {
  id: number;
  geo_id: string;
  legacy_id: string | null;
  name: string;
  center_lat: number | null;
  center_lng: number | null;
  boundary: MultiPolygon;
}
