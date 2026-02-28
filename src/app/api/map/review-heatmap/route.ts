import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const south = searchParams.get("south");
  const north = searchParams.get("north");
  const west = searchParams.get("west");
  const east = searchParams.get("east");
  const minReviews = parseInt(searchParams.get("min_reviews") ?? "1", 10);

  if (!south || !north || !west || !east) {
    return apiError("Missing bounds parameters (south, north, west, east)", 400);
  }

  const { data, error } = await supabase.rpc("get_reviewed_addresses", {
    p_south: parseFloat(south),
    p_north: parseFloat(north),
    p_west: parseFloat(west),
    p_east: parseFloat(east),
    p_min_reviews: minReviews,
  });

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json(data);
}
