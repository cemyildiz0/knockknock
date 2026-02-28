import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase-server";
import { apiError } from "@/lib/api-utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

interface NeighborhoodData {
  id: number;
  name: string;
  area_sqmi: number | null;
  city: string | null;
  state: string | null;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  center_lat: number | null;
  center_lng: number | null;
}

interface LivabilityData {
  geoid: string;
  score: number;
  score_engage: number;
  score_env: number;
  score_health: number;
  score_house: number;
  score_opp: number;
  score_prox: number;
  score_trans: number;
  metrics: Record<string, number>;
  demographics: Record<string, number>;
  employ_unemp_rate: number;
  disaster_natural_hazard_risk: number;
}

interface AiRecommendation {
  neighborhood_id: number;
  neighborhood_name: string;
  score: number;
  reasoning: string;
  highlights: string[];
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return apiError("AI service not configured", 503);
  }

  let query: string;
  try {
    const body = await request.json();
    query = body.query?.trim();
  } catch {
    return apiError("Invalid request body", 400);
  }

  if (!query || query.length < 5) {
    return apiError("Query must be at least 5 characters", 400);
  }

  if (query.length > 500) {
    return apiError("Query too long (max 500 characters)", 400);
  }

  try {
    const [neighborhoodsRes, livabilityRes, poisRes] = await Promise.all([
      Promise.resolve(
        supabase
          .from("community_neighborhoods")
          .select("id, name, area_sqmi, city, state, rating, review_count, description, center_lat, center_lng, image_url")
          .order("name")
      ),
      Promise.resolve(
        supabase
          .from("livability_regions")
          .select("geoid, score, score_engage, score_env, score_health, score_house, score_opp, score_prox, score_trans, metrics, demographics, employ_unemp_rate, disaster_natural_hazard_risk")
      ),
      Promise.resolve(
        supabase
          .from("pois")
          .select("zip_code, category, name")
          .not("zip_code", "is", null)
      ),
    ]);

    const neighborhoods: NeighborhoodData[] = neighborhoodsRes.data ?? [];
    const livabilityRegions: LivabilityData[] = livabilityRes.data ?? [];
    const pois = poisRes.data ?? [];

    const poiByZip: Record<string, { total: number; restaurants: number; healthcare: number; shopping: number; parks_recreation: number; education: number; names: string[] }> = {};
    for (const poi of pois) {
      if (!poi.zip_code) continue;
      if (!poiByZip[poi.zip_code]) {
        poiByZip[poi.zip_code] = { total: 0, restaurants: 0, healthcare: 0, shopping: 0, parks_recreation: 0, education: 0, names: [] };
      }
      const entry = poiByZip[poi.zip_code];
      entry.total++;
      if (entry.names.length < 15) entry.names.push(poi.name);
      switch (poi.category) {
        case "EATING - DRINKING": entry.restaurants++; break;
        case "HEALTH CARE SERVICES": entry.healthcare++; break;
        case "SHOPPING": entry.shopping++; break;
        case "ATTRACTIONS - RECREATION": entry.parks_recreation++; break;
        case "EDUCATION": entry.education++; break;
      }
    }

    const dataContext = neighborhoods.map((n) => ({
      id: n.id,
      name: n.name,
      area_sqmi: n.area_sqmi,
      location: [n.city, n.state].filter(Boolean).join(", "),
      rating: n.rating,
      review_count: n.review_count,
      description: n.description,
    }));

    const livabilityContext = livabilityRegions.map((r) => ({
      zip: r.geoid,
      overall_score: r.score,
      engagement: r.score_engage,
      environment: r.score_env,
      health: r.score_health,
      housing: r.score_house,
      opportunity: r.score_opp,
      proximity: r.score_prox,
      transportation: r.score_trans,
      monthly_housing_cost: r.metrics?.met_house_cost,
      transportation_cost: r.metrics?.met_trans_cost,
      walk_score: r.metrics?.met_trans_walk,
      park_access: r.metrics?.met_prox_park,
      grocery_access: r.metrics?.met_prox_market,
      hospital_distance_mi: r.metrics?.met_health_hospital,
      exercise_opportunities: r.metrics?.met_health_exercise,
      air_quality: r.metrics?.met_env_air,
      broadband_access: r.metrics?.met_engage_broad,
      hs_graduation_rate: r.metrics?.met_opp_grad,
      transit_frequency: r.metrics?.met_trans_freq,
      median_income: r.demographics?.demo_income,
      population: r.demographics?.demo_pop,
      unemployment_rate: r.employ_unemp_rate,
      natural_hazard_risk: r.disaster_natural_hazard_risk,
      pois: poiByZip[r.geoid] ?? null,
    }));

    const systemPrompt = `You are a neighborhood recommendation engine for Irvine, California. You have access to detailed livability data, demographics, points of interest, and community reviews for neighborhoods and ZIP codes in Irvine.

Your job is to analyze a user's plain-English description of their ideal neighborhood and recommend the best matches from the available data.

IMPORTANT RULES:
- Only recommend neighborhoods that exist in the provided data
- Score each recommendation 0-100 based on how well it matches the query
- Provide 3-5 recommendations, ranked by score
- Be specific in your reasoning -- reference actual data points (scores, costs, nearby businesses)
- If the user asks about something the data doesn't cover, acknowledge it and recommend based on what IS available
- Keep reasoning concise (2-3 sentences max per neighborhood)
- Highlights should be short phrases (3-5 per neighborhood)

Respond ONLY with valid JSON in this exact format:
{
  "recommendations": [
    {
      "neighborhood_id": <number>,
      "neighborhood_name": "<string>",
      "score": <number 0-100>,
      "reasoning": "<string>",
      "highlights": ["<string>", "<string>", ...]
    }
  ],
  "summary": "<1-2 sentence summary of what you found>"
}`;

    const userPrompt = `USER QUERY: "${query}"

NEIGHBORHOODS:
${JSON.stringify(dataContext, null, 0)}

LIVABILITY DATA BY ZIP CODE:
${JSON.stringify(livabilityContext, null, 0)}

Based on this data, which neighborhoods best match what the user is looking for? Return your recommendations as JSON.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();

    let parsed: { recommendations: AiRecommendation[]; summary: string };
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return apiError("Failed to parse AI response", 500);
    }

    const neighborhoodMap = new Map(
      (neighborhoodsRes.data ?? []).map((n: NeighborhoodData & { image_url?: string }) => [n.id, n])
    );

    const enrichedRecommendations = parsed.recommendations.map((rec) => {
      const n = neighborhoodMap.get(rec.neighborhood_id);
      return {
        ...rec,
        neighborhood: n
          ? {
              id: n.id,
              name: n.name,
              image_url: (n as NeighborhoodData & { image_url?: string }).image_url ?? null,
              city: n.city,
              state: n.state,
              area_sqmi: n.area_sqmi,
              rating: n.rating,
              review_count: n.review_count,
              description: n.description,
            }
          : null,
      };
    });

    return NextResponse.json({
      query,
      summary: parsed.summary,
      recommendations: enrichedRecommendations,
    });
  } catch (err) {
    console.error("AI recommendation error:", err);
    return apiError("Failed to generate recommendations", 500);
  }
}
