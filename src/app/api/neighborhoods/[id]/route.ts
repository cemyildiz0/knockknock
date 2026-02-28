import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("community_neighborhoods")
    .select("id, geo_id, legacy_id, name, area_sqmi, center_lat, center_lng")
    .eq("id", numericId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
