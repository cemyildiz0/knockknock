import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError, parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);

  const { data, error, count } = await supabase
    .from("homes")
    .select(
      "id, address_line1, city, state, zip, property_type, living_area, beds, baths, levels, last_sale_price, last_sale_date, image_url, created_at, rating, review_count",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json({
    data,
    pagination: paginationMeta(page, limit, count ?? 0),
  });
}