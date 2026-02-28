import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

const MAX_POINTS = 5000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const south = searchParams.get("south");
  const north = searchParams.get("north");
  const west = searchParams.get("west");
  const east = searchParams.get("east");

  if (!south || !north || !west || !east) {
    return NextResponse.json({ error: "Missing bounds parameters" }, { status: 400 });
  }

  const { data, error, count } = await supabase
    .from("address_points")
    .select("*", { count: "exact" })
    .gte("latitude", parseFloat(south))
    .lte("latitude", parseFloat(north))
    .gte("longitude", parseFloat(west))
    .lte("longitude", parseFloat(east))
    .limit(MAX_POINTS);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}
