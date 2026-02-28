import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiError, parsePagination, paginationMeta } from "@/lib/api-utils";
import { supabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);

  const { data, error, count } = await supabase
    .from("reviews")
    .select(
      "*, profiles(display_name), address_points(id, address, streetname, latitude, longitude)",
      { count: "exact" }
    )
    .eq("user_id", auth.user.id)
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
