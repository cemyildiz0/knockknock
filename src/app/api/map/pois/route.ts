import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

const PAGE_SIZE = 1000;

export async function GET() {
  let allPois: { zip_code: string | null; category: string }[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("pois")
      .select("zip_code, category")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data ?? [];
    allPois = allPois.concat(rows);
    hasMore = rows.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return NextResponse.json(allPois);
}
