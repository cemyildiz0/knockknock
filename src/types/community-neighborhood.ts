import type { MultiPolygon } from "geojson";

export interface CommunityNeighborhood {
  id: number;
  geo_id: string;
  legacy_id: string | null;
  name: string;
  area_sqmi: number | null;
  center_lat: number | null;
  center_lng: number | null;
  boundary: MultiPolygon;
}
