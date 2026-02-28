import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  if (!q || q.length < 2) {
    return apiError("Search query must be at least 2 characters", 400);
  }

  const { data, error } = await supabase
    .from("address_points")
    .select("id, address, streetname, unit, mun, latitude, longitude")
    .or(`address.ilike.%${q}%,streetname.ilike.%${q}%`)
    .limit(limit);

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json(data);
}
