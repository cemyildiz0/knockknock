import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: home, error } = await supabase
    .from("homes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !home) {
    return apiError("Home not found", 404);
  }

  const { searchParams } = new URL(request.url);
  const include = searchParams.get("include");

  if (include === "reviews" && home.latitude != null && home.longitude != null) {
    const { data: addressPoints } = await supabase
      .from("address_points")
      .select("id")
      .gte("latitude", home.latitude - 0.0005)
      .lte("latitude", home.latitude + 0.0005)
      .gte("longitude", home.longitude - 0.0005)
      .lte("longitude", home.longitude + 0.0005)
      .limit(1);

    const addressPointId = addressPoints?.[0]?.id ?? null;

    if (addressPointId != null) {
      const { data: reviews, count } = await supabase
        .from("reviews")
        .select("*, profiles(display_name)", { count: "exact" })
        .eq("address_point_id", addressPointId)
        .order("created_at", { ascending: false })
        .limit(20);

      const reviewData = reviews ?? [];
      const total = count ?? 0;
      const average =
        total > 0
          ? reviewData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / total
          : null;

      return NextResponse.json({
        home,
        reviews: {
          data: reviewData,
          average_rating: average !== null ? Math.round(average * 100) / 100 : null,
          total,
          address_point_id: addressPointId,
        },
      });
    }
  }

  return NextResponse.json({ home });
}
