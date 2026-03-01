import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const limit = Math.min(
    20,
    Math.max(1, parseInt(searchParams.get("limit") ?? "6", 10))
  );

  if (isNaN(lat) || isNaN(lng)) {
    return apiError("lat and lng are required", 400);
  }

  const { data, error } = await supabase
    .from("community_neighborhoods")
    .select(
      "id, geo_id, legacy_id, name, area_sqmi, center_lat, center_lng, image_url, description, city, state, rating, review_count"
    )
    .not("center_lat", "is", null)
    .not("center_lng", "is", null);

  if (error) {
    return apiError(error.message, 500);
  }

  const withDistance = (data ?? [])
    .map((n) => ({
      ...n,
      distance_mi: haversineMiles(lat, lng, n.center_lat!, n.center_lng!),
    }))
    .sort((a, b) => a.distance_mi - b.distance_mi)
    .slice(0, limit);

  return NextResponse.json({ data: withDistance });
}
