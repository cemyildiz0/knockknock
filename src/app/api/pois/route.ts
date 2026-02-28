import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError, parsePagination, paginationMeta } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get("zip_code");
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();
  const { page, limit, offset } = parsePagination(searchParams);

  let query = supabase
    .from("pois")
    .select("*", { count: "exact" });

  if (zipCode) {
    query = query.eq("zip_code", zipCode);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (q && q.length >= 2) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error, count } = await query
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
