import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ zip: string }> }
) {
  const { zip } = await params;

  if (!zip || zip.length < 3) {
    return apiError("Invalid ZIP code", 400);
  }

  const { data, error } = await supabase
    .from("livability_regions")
    .select(
      "id, geoid, score, score_engage, score_env, score_health, score_house, score_opp, score_prox, score_trans, metrics, policies, demographics, climate, disaster_natural_hazard_risk, employ_unemp_rate"
    )
    .eq("geoid", zip)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return apiError("ZIP code not found", 404);
    }
    return apiError(error.message, 500);
  }

  return NextResponse.json(data);
}
