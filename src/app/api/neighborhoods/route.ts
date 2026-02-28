import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError, parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);

  const { data, error, count } = await supabase
    .from("community_neighborhoods")
    .select("id, geo_id, legacy_id, name, area_sqmi, center_lat, center_lng, image_url, description, city, state, rating, review_count", {
      count: "exact",
    })
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json({
    data,
    pagination: paginationMeta(page, limit, count ?? 0),
  });
}
