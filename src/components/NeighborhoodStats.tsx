"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LivabilityRegion } from "@/types/livability";
import type { PoiCounts } from "@/types/poi";
import { getScoreColor } from "@/lib/livability-colors";

interface NeighborhoodStatsProps {
  livability: LivabilityRegion | null;
  poiCounts?: PoiCounts | null;
}

function fmt$(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
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
  poiCounts,
}: NeighborhoodStatsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!livability) return null;

  const { demographics, metrics, climate } = livability;

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

      {/* Key metrics — always visible */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-brand-teal">Median Income</span>
          <span className="font-medium text-brand-navy">
            {fmt$(demographics.demo_income)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-brand-teal">Housing Cost</span>
          <span className="font-medium text-brand-navy">
            {fmt$(metrics.met_house_cost)} /mo
          </span>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 mt-4 text-xs font-medium text-brand-teal hover:text-brand-teal-dark transition-colors"
      >
        {expanded ? "Show less" : "Show more"}
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="mt-4 space-y-5">
          {/* Category scores */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-brand-teal uppercase tracking-wider mb-3">
              Category Scores
            </p>
            <ScoreBar label="Environment" score={livability.score_env} />
            <ScoreBar label="Health" score={livability.score_health} />
            <ScoreBar label="Housing" score={livability.score_house} />
            <ScoreBar label="Opportunity" score={livability.score_opp} />
            <ScoreBar label="Transportation" score={livability.score_trans} />
          </div>

          {/* Living essentials */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-brand-teal uppercase tracking-wider mb-2">
              Cost of Living
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-brand-teal">Transportation Cost</span>
                <span className="text-brand-navy font-medium">
                  {fmt$(metrics.met_trans_cost)} /mo
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-teal">Unemployment</span>
                <span className="text-brand-navy font-medium">
                  {(livability.employ_unemp_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Climate */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-brand-teal uppercase tracking-wider mb-2">
              Climate
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-brand-teal">Winter (Jan)</span>
                <span className="text-brand-navy font-medium">
                  {climate.climate_jan_min.toFixed(0)}°F –{" "}
                  {climate.climate_jan_max.toFixed(0)}°F
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-brand-teal">Summer (Jul)</span>
                <span className="text-brand-navy font-medium">
                  {climate.climate_jul_min.toFixed(0)}°F –{" "}
                  {climate.climate_jul_max.toFixed(0)}°F
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
