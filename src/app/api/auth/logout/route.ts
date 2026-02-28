import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { apiError } from "@/lib/api-utils";

export async function POST() {
  const supabase = await createRouteClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return apiError(error.message, 500);
  }

  return NextResponse.json({ success: true });
}
