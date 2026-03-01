import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

const PRIMARY_RADIUS = 0.04;
const FALLBACK_RADIUS = 0.08;
const MIN_HOMES = 10;

async function fetchHomesInRadius(
  lat: number,
  lng: number,
  radius: number
) {
  return supabase
    .from("homes")
    .select(
      "id, address_line1, city, state, zip, beds, baths, property_type, living_area, levels, last_sale_price, last_sale_date, image_url, rating, review_count, latitude, longitude"
    )
    .gte("latitude", lat - radius)
    .lte("latitude", lat + radius)
    .gte("longitude", lng - radius)
    .lte("longitude", lng + radius);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return apiError("Invalid ID", 400);
  }

  const { data: neighborhood, error: neighborhoodError } = await supabase
    .from("community_neighborhoods")
    .select("center_lat, center_lng")
    .eq("id", numericId)
    .single();

  if (neighborhoodError) {
    if (neighborhoodError.code === "PGRST116") {
      return apiError("Neighborhood not found", 404);
    }
    return apiError(neighborhoodError.message, 500);
  }

  if (!neighborhood.center_lat || !neighborhood.center_lng) {
    return NextResponse.json({ homes: [], total: 0 });
  }

  const lat = neighborhood.center_lat;
  const lng = neighborhood.center_lng;

  let { data: homes, error } = await fetchHomesInRadius(lat, lng, PRIMARY_RADIUS);

  if (error) {
    return apiError(error.message, 500);
  }

  if ((homes?.length ?? 0) < MIN_HOMES) {
    const { data: expanded, error: expandedError } = await fetchHomesInRadius(
      lat,
      lng,
      FALLBACK_RADIUS
    );
    if (!expandedError && expanded) {
      homes = expanded;
    }
  }

  const result = homes ?? [];

  return NextResponse.json({ homes: result, total: result.length });
}
