"use client";

import { getScoreColorForLegend, SCORE_MIN, SCORE_MAX } from "@/lib/livability-colors";

const SWATCH_COUNT = 7;

export default function LivabilityLegend() {
  const swatches = Array.from({ length: SWATCH_COUNT }, (_, i) =>
    getScoreColorForLegend(i, SWATCH_COUNT)
  );

  return (
    <div className="absolute bottom-6 right-4 z-[1000] bg-[#171717] border border-[#262626] px-3 py-2 rounded text-sm text-neutral-100">
      <p className="mb-1.5 text-xs font-medium text-neutral-400">Livability Score</p>
      <div className="flex gap-0.5">
        {swatches.map((color, i) => (
          <div
            key={i}
            className="h-3 w-6 first:rounded-l last:rounded-r"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-neutral-500">
        <span>{SCORE_MIN}</span>
        <span>{SCORE_MAX}</span>
      </div>
    </div>
  );
}
