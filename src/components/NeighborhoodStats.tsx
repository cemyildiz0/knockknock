"use client";

import type { LivabilityRegion } from "@/types/livability";
import type { PoiCounts } from "@/types/poi";
import { getScoreColor } from "@/lib/livability-colors";

interface NeighborhoodStatsProps {
  livability: LivabilityRegion | null;
  poiCounts?: PoiCounts | null;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-brand-teal">{label}</span>
        <span className="text-brand-navy font-medium">{score.toFixed(0)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${clamped}%`,
            backgroundColor: getScoreColor(clamped * 0.12 + 48),
          }}
        />
      </div>
    </div>
  );
}

export default function NeighborhoodStats({
  livability,
}: NeighborhoodStatsProps) {
  if (!livability) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
      <h3 className="text-sm font-bold text-brand-navy mb-4">
        Neighborhood Stats
      </h3>

      {/* Livability score badge */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: getScoreColor(livability.score) }}
        >
          {livability.score}
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-navy">
            Livability Score
          </p>
          <p className="text-xs text-brand-teal">out of 100</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Category scores */}
        <div>
          <p className="text-xs font-semibold text-brand-teal uppercase tracking-wider mb-3">
            Category Scores
          </p>
          <ScoreBar label="Environment" score={livability.score_env} />
          <ScoreBar label="Health" score={livability.score_health} />
          <ScoreBar label="Housing" score={livability.score_house} />
          <ScoreBar label="Opportunity" score={livability.score_opp} />
          <ScoreBar label="Transportation" score={livability.score_trans} />
        </div>
      </div>
    </div>
  );
}
