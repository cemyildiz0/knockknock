import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET() {
  const { data, error } = await supabase
    .from("community_neighborhoods")
    .select("id, geo_id, legacy_id, name, area_sqmi, center_lat, center_lng");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
