import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return apiError("Invalid address ID", 400);
  }

  const { data, error, count } = await supabase
    .from("reviews")
    .select("rating", { count: "exact" })
    .eq("address_point_id", numericId);

  if (error) {
    return apiError(error.message, 500);
  }

  const total = count ?? 0;
  const ratings = data ?? [];
  const average =
    total > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / total
      : null;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratings) {
    distribution[r.rating]++;
  }

  return NextResponse.json({
    address_point_id: numericId,
    average_rating: average !== null ? Math.round(average * 100) / 100 : null,
    total_reviews: total,
    distribution,
  });
}
