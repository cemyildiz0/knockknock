import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  const [regionsRes, neighborhoodsRes, districtsRes] = await Promise.all([
    supabase.from("livability_regions").select("*"),
    supabase.from("community_neighborhoods").select("*"),
    supabase.from("school_districts").select("*"),
  ]);

  if (regionsRes.error) {
    return NextResponse.json({ error: regionsRes.error.message }, { status: 500 });
  }
  if (neighborhoodsRes.error) {
    return NextResponse.json({ error: neighborhoodsRes.error.message }, { status: 500 });
  }
  if (districtsRes.error) {
    return NextResponse.json({ error: districtsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    regions: regionsRes.data,
    neighborhoods: neighborhoodsRes.data,
    districts: districtsRes.data,
  });
}
