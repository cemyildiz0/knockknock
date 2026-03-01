import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";
import { pointInMultiPolygon } from "@/lib/geo-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return apiError("Invalid ID", 400);
  }

  const { data: neighborhood, error } = await supabase
    .from("community_neighborhoods")
    .select("id, geo_id, legacy_id, name, area_sqmi, center_lat, center_lng, image_url, description, city, state, rating, review_count")
    .eq("id", numericId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return apiError("Neighborhood not found", 404);
    }
    return apiError(error.message, 500);
  }

  const { searchParams } = new URL(request.url);
  const include = searchParams.get("include")?.split(",") ?? [];

  const result: Record<string, unknown> = { neighborhood };

  if (include.includes("livability") && neighborhood.center_lat && neighborhood.center_lng) {
    const { data: regions } = await supabase
      .from("livability_regions")
      .select(
        "id, geoid, score, score_engage, score_env, score_health, score_house, score_opp, score_prox, score_trans, metrics, policies, demographics, climate, disaster_natural_hazard_risk, employ_unemp_rate, geometry"
      );

    let matched = null;
    if (regions) {
      for (const region of regions) {
        if (pointInMultiPolygon(neighborhood.center_lng, neighborhood.center_lat, region.geometry)) {
          // Strip geometry from the response (large payload)
          const { geometry: _, ...regionData } = region;
          matched = regionData;
          break;
        }
      }
    }

    result.livability = matched;
  }

  if (include.includes("pois")) {
    const { data: poiData } = await supabase
      .from("pois")
      .select("category")
      .not("zip_code", "is", null);

    if (poiData) {
      const counts = {
        total: poiData.length,
        eating_drinking: 0,
        health_care: 0,
        shopping: 0,
        attractions_recreation: 0,
        education: 0,
      };

      for (const poi of poiData) {
        switch (poi.category) {
          case "EATING - DRINKING":
            counts.eating_drinking++;
            break;
          case "HEALTH CARE SERVICES":
            counts.health_care++;
            break;
          case "SHOPPING":
            counts.shopping++;
            break;
          case "ATTRACTIONS - RECREATION":
            counts.attractions_recreation++;
            break;
          case "EDUCATION":
            counts.education++;
            break;
        }
      }

      result.poi_counts = counts;
    } else {
      result.poi_counts = null;
    }
  }

  if (include.includes("reviews")) {
    const { data: addressesInArea } = await supabase
      .from("address_points")
      .select("id")
      .gte("latitude", (neighborhood.center_lat ?? 0) - 0.02)
      .lte("latitude", (neighborhood.center_lat ?? 0) + 0.02)
      .gte("longitude", (neighborhood.center_lng ?? 0) - 0.02)
      .lte("longitude", (neighborhood.center_lng ?? 0) + 0.02)
      .limit(1000);

    if (addressesInArea && addressesInArea.length > 0) {
      const addressIds = addressesInArea.map((a) => a.id);

      const { data: reviews, count } = await supabase
        .from("reviews")
        .select("*, profiles(display_name)", { count: "exact" })
        .in("address_point_id", addressIds)
        .order("created_at", { ascending: false })
        .limit(20);

      const reviewData = reviews ?? [];
      const total = count ?? 0;
      const average =
        total > 0
          ? reviewData.reduce((sum, r) => sum + r.rating, 0) / total
          : null;

      result.reviews = {
        data: reviewData,
        average_rating:
          average !== null ? Math.round(average * 100) / 100 : null,
        total,
      };
    } else {
      result.reviews = { data: [], average_rating: null, total: 0 };
    }
  }

  return NextResponse.json(result);
}
