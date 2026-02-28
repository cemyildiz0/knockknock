import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") ?? "all";
  const limit = Math.min(25, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  if (!q || q.length < 2) {
    return apiError("Search query must be at least 2 characters", 400);
  }

  const validTypes = ["all", "neighborhoods", "addresses", "pois", "zip"];
  if (!validTypes.includes(type)) {
    return apiError(`Invalid type. Must be one of: ${validTypes.join(", ")}`, 400);
  }

  const queries: Record<string, Promise<unknown>> = {};

  if (type === "all" || type === "neighborhoods") {
    queries.neighborhoods = Promise.resolve(
      supabase
        .from("community_neighborhoods")
        .select("id, name, center_lat, center_lng")
        .ilike("name", `%${q}%`)
        .limit(limit)
    ).then(({ data, error }) => {
      if (error) return [];
      return (data ?? []).map((n) => ({ ...n, type: "neighborhood" as const }));
    });
  }

  if (type === "all" || type === "addresses") {
    queries.addresses = Promise.resolve(
      supabase
        .from("address_points")
        .select("id, address, streetname, unit, mun, latitude, longitude")
        .or(`address.ilike.%${q}%,streetname.ilike.%${q}%`)
        .limit(limit)
    ).then(({ data, error }) => {
      if (error) return [];
      return (data ?? []).map((a) => ({ ...a, type: "address" as const }));
    });
  }

  if (type === "all" || type === "pois") {
    queries.pois = Promise.resolve(
      supabase
        .from("pois")
        .select("id, name, address, city, category, zip_code")
        .ilike("name", `%${q}%`)
        .limit(limit)
    ).then(({ data, error }) => {
      if (error) return [];
      return (data ?? []).map((p) => ({ ...p, type: "poi" as const }));
    });
  }

  if (type === "all" || type === "zip") {
    queries.zips = Promise.resolve(
      supabase
        .from("livability_regions")
        .select("id, geoid, score")
        .ilike("geoid", `${q}%`)
        .limit(limit)
    ).then(({ data, error }) => {
      if (error) return [];
      return (data ?? []).map((z) => ({ ...z, type: "zip" as const }));
    });
  }

  const keys = Object.keys(queries);
  const values = await Promise.all(Object.values(queries));

  const results: Record<string, unknown> = {
    neighborhoods: [],
    addresses: [],
    pois: [],
    zips: [],
  };

  keys.forEach((key, i) => {
    results[key] = values[i];
  });

  return NextResponse.json({ results, query: q });
}
