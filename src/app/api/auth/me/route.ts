import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

export async function GET() {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({ user: user ?? null });
}
