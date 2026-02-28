import type { PoiCounts } from "@/types/poi";

interface PoiRow {
  zip_code: string | null;
  category: string;
}

function emptyPoiCounts(): PoiCounts {
  return {
    total: 0,
    eating_drinking: 0,
    health_care: 0,
    shopping: 0,
    attractions_recreation: 0,
    education: 0,
  };
}

export function aggregatePoisByZip(pois: PoiRow[]): Record<string, PoiCounts> {
  const counts: Record<string, PoiCounts> = {};

  for (const poi of pois) {
    if (!poi.zip_code) continue;

    if (!counts[poi.zip_code]) {
      counts[poi.zip_code] = emptyPoiCounts();
    }

    const entry = counts[poi.zip_code];
    entry.total++;

    switch (poi.category) {
      case "EATING - DRINKING":
        entry.eating_drinking++;
        break;
      case "HEALTH CARE SERVICES":
        entry.health_care++;
        break;
      case "SHOPPING":
        entry.shopping++;
        break;
      case "ATTRACTIONS - RECREATION":
        entry.attractions_recreation++;
        break;
      case "EDUCATION":
        entry.education++;
        break;
    }
  }

  return counts;
}
