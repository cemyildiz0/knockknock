import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return apiError("Invalid address ID", 400);
  }

  const { data: address, error } = await supabase
    .from("address_points")
    .select("*")
    .eq("id", numericId)
    .single();

  if (error || !address) {
    return apiError("Address not found", 404);
  }

  const { searchParams } = new URL(request.url);
  const include = searchParams.get("include");

  if (include === "reviews") {
    const { data: reviews, count } = await supabase
      .from("reviews")
      .select("*, profiles(display_name)", { count: "exact" })
      .eq("address_point_id", numericId)
      .order("created_at", { ascending: false })
      .limit(20);

    const reviewData = reviews ?? [];
    const total = count ?? 0;
    const average =
      total > 0
        ? reviewData.reduce((sum, r) => sum + r.rating, 0) / total
        : null;

    return NextResponse.json({
      address,
      reviews: {
        data: reviewData,
        average_rating: average !== null ? Math.round(average * 100) / 100 : null,
        total,
      },
    });
  }

  return NextResponse.json({ address });
}
