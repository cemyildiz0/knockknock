"use client";

import { RefreshCw } from "lucide-react";
import type { Home } from "@/types/home";
import HomeCard from "@/components/HomeCard";

interface Selection {
  winner: Home | "both";
  loser: Home | null;
}

interface Props {
  selections: Selection[];
  allHomes: Home[];
  onPlayAgain: () => void;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function inferPreferences(selections: Selection[]) {
  const winners = selections
    .map((s) => s.winner)
    .filter((w): w is Home => w !== "both");

  if (winners.length === 0) return null;

  const typeCounts: Record<string, number> = {};
  for (const h of winners) {
    if (h.property_type) {
      typeCounts[h.property_type] = (typeCounts[h.property_type] ?? 0) + 1;
    }
  }
  const preferredType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const beds = winners.filter((h) => h.beds != null).map((h) => h.beds as number);
  const baths = winners.filter((h) => h.baths != null).map((h) => h.baths as number);
  const areas = winners.filter((h) => h.living_area != null).map((h) => h.living_area as number);
  const prices = winners.filter((h) => h.last_sale_price != null).map((h) => h.last_sale_price as number);

  const losers = selections
    .map((s) => s.loser)
    .filter((l): l is Home => l !== null);

  const loserPrices = losers
    .filter((h) => h.last_sale_price != null)
    .map((h) => h.last_sale_price as number);

  const winnerMedianPrice = median(prices);
  const loserMedianPrice = median(loserPrices);
  const pricePreference =
    winnerMedianPrice > loserMedianPrice
      ? "higher-priced"
      : winnerMedianPrice < loserMedianPrice
      ? "more affordable"
      : null;

  return {
    preferredType,
    medianBeds: beds.length > 0 ? Math.round(median(beds)) : null,
    medianBaths: baths.length > 0 ? median(baths) : null,
    medianArea: areas.length > 0 ? Math.round(median(areas)) : null,
    pricePreference,
    winnerIds: new Set(winners.map((h) => h.id)),
  };
}

function scoreHome(home: Home, prefs: NonNullable<ReturnType<typeof inferPreferences>>): number {
  let score = 0;
  if (prefs.preferredType && home.property_type === prefs.preferredType) score += 3;
  if (prefs.medianBeds != null && home.beds != null) {
    score -= Math.abs(home.beds - prefs.medianBeds);
  }
  if (prefs.medianBaths != null && home.baths != null) {
    score -= Math.abs(home.baths - prefs.medianBaths) * 0.5;
  }
  if (prefs.medianArea != null && home.living_area != null) {
    score -= Math.abs(home.living_area - prefs.medianArea) / 500;
  }
  return score;
}

function buildSummary(prefs: NonNullable<ReturnType<typeof inferPreferences>>): string {
  const parts: string[] = [];

  if (prefs.preferredType) {
    parts.push(prefs.preferredType.toLowerCase() + " homes");
  } else {
    parts.push("homes");
  }

  const specParts: string[] = [];
  if (prefs.medianBeds != null) specParts.push(`${prefs.medianBeds} bed${prefs.medianBeds !== 1 ? "s" : ""}`);
  if (prefs.medianBaths != null) specParts.push(`${prefs.medianBaths} bath${prefs.medianBaths !== 1 ? "s" : ""}`);
  if (prefs.medianArea != null) specParts.push(`around ${prefs.medianArea.toLocaleString()} sq ft`);

  if (specParts.length > 0) {
    parts.push("with " + specParts.join(", "));
  }

  if (prefs.pricePreference) {
    parts.push("on the " + prefs.pricePreference + " side");
  }

  return "You seem drawn to " + parts.join(" ") + ".";
}

export default function KnockResults({ selections, allHomes, onPlayAgain }: Props) {
  const prefs = inferPreferences(selections);

  const recommended = prefs
    ? allHomes
        .filter((h) => !prefs.winnerIds.has(h.id) && h.image_url)
        .map((h) => ({ home: h, score: scoreHome(h, prefs) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((x) => x.home)
    : allHomes.filter((h) => h.image_url).slice(0, 6);

  return (
    <div className="py-8">
      {/* Taste profile card */}
      <div className="bg-white rounded-2xl p-6 mb-8 border border-brand-teal/20">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-brand-navy font-bold text-lg">Your taste profile</h3>
        </div>

        {prefs ? (
          <p className="text-brand-navy/70 text-sm leading-relaxed">
            {buildSummary(prefs)}
          </p>
        ) : (
          <p className="text-brand-navy/70 text-sm">
            You liked both sides equally — you have broad taste.
          </p>
        )}
      </div>

      {/* Recommendations */}
      {recommended.length > 0 && (
        <>
          <h3 className="text-base font-bold text-brand-navy mb-4">
            Homes you might like
          </h3>
          <div className="columns-1 sm:columns-2 gap-5">
            {recommended.map((home) => (
              <HomeCard
                key={home.id}
                home={home}
                image_url={home.image_url}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 border border-brand-teal/30 hover:border-brand-teal text-brand-navy font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
        >
          <RefreshCw size={14} />
          Play again
        </button>
      </div>
    </div>
  );
}
