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

  // Display
  image_url: string | null;
  description: string | null;

  // Location
  city: string | null;
  state: string | null;

  // Stats
  rating: number | null;        // e.g. 4.3
  review_count: number | null;
  // median_home_price: number | null;
}
