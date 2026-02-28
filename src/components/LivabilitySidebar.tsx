"use client";

import { useState } from "react";
import type { LivabilityRegion } from "@/types/livability";
import type { PoiCounts } from "@/types/poi";
import { getScoreColor } from "@/lib/livability-colors";
import {
  CATEGORY_LABELS,
  METRIC_LABELS,
  POLICY_LABELS,
  DEMOGRAPHIC_LABELS,
  METRIC_GROUPS,
} from "@/lib/livability-labels";

interface LivabilitySidebarProps {
  region: LivabilityRegion | null;
  poiCounts?: PoiCounts;
  onClose: () => void;
}

const CATEGORY_KEYS = [
  "score_engage",
  "score_env",
  "score_health",
  "score_house",
  "score_opp",
  "score_prox",
  "score_trans",
] as const;

function formatValue(key: string, value: number): string {
  if (key === "demo_income") return `$${value.toLocaleString()}`;
  if (key === "demo_pop") return value.toLocaleString();
  if (key === "demo_life_ex") return `${value.toFixed(1)} yrs`;
  if (key === "met_house_cost") return `$${value.toFixed(0)}`;
  if (key === "met_trans_cost") return `$${value.toFixed(0)}`;
  if (key === "met_health_hospital") return `${value.toFixed(1)} mi`;
  if (key === "employ_unemp_rate") return `${(value * 100).toFixed(1)}%`;

  if (
    key.includes("poverty") ||
    key.includes("burden") ||
    key === "demo_50" ||
    key === "demo_65" ||
    key === "demo_noveh" ||
    key === "demo_disable" ||
    key === "demo_african" ||
    key === "demo_asian" ||
    key === "demo_hawaiian" ||
    key === "demo_hisp" ||
    key === "demo_indian" ||
    key === "demo_more_races" ||
    key === "demo_other_race" ||
    key === "demo_white" ||
    key === "demo_up_mobile"
  ) {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2);
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[#262626]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-neutral-300 hover:text-neutral-100 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-neutral-400">{label}</span>
        <span className="text-neutral-300">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#262626]">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${clampedScore}%`,
            backgroundColor: getScoreColor(clampedScore * 0.12 + 48),
          }}
        />
      </div>
    </div>
  );
}

export default function LivabilitySidebar({ region, poiCounts, onClose }: LivabilitySidebarProps) {
  const isOpen = region !== null;

  return (
    <div
      className={`absolute top-0 left-0 z-[1000] h-full w-[380px] max-sm:w-full bg-[#141414] border-r border-[#262626] overflow-y-auto transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {region && (
        <>
          {/* Header */}
          <div className="sticky top-0 bg-[#141414] border-b border-[#262626] px-4 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">ZIP Code</p>
                <p className="text-2xl font-bold text-neutral-100">{region.geoid}</p>
              </div>
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-200 transition-colors p-1"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: getScoreColor(region.score) }}
              >
                {region.score}
              </div>
              <div>
                <p className="text-sm text-neutral-400">Overall Livability</p>
                <p className="text-xs text-neutral-500">out of 100</p>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="px-4 py-4">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Category Scores</p>
            {CATEGORY_KEYS.map((key) => (
              <ScoreBar
                key={key}
                label={CATEGORY_LABELS[key]}
                score={region[key]}
              />
            ))}
          </div>

          {/* Demographics */}
          <CollapsibleSection title="Demographics">
            <div className="space-y-1.5">
              {Object.entries(region.demographics).map(([key, value]) => {
                const label = DEMOGRAPHIC_LABELS[key] || key;
                return (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-neutral-400">{label}</span>
                    <span className="text-neutral-200">{formatValue(key, value)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between text-xs pt-1 border-t border-[#1e1e1e]">
                <span className="text-neutral-400">Unemployment Rate</span>
                <span className="text-neutral-200">{formatValue("employ_unemp_rate", region.employ_unemp_rate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Natural Hazard Risk</span>
                <span className="text-neutral-200">{region.disaster_natural_hazard_risk}/10</span>
              </div>
            </div>
          </CollapsibleSection>

          {/* Nearby Businesses */}
          {poiCounts && (
            <CollapsibleSection title="Nearby Businesses" defaultOpen>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs border-b border-[#1e1e1e] pb-1.5 mb-1.5">
                  <span className="text-neutral-300 font-medium">Total</span>
                  <span className="text-neutral-100 font-bold">{poiCounts.total}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Restaurants & Bars</span>
                  <span className="text-neutral-200">{poiCounts.eating_drinking}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Healthcare</span>
                  <span className="text-neutral-200">{poiCounts.health_care}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Shopping</span>
                  <span className="text-neutral-200">{poiCounts.shopping}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Attractions & Recreation</span>
                  <span className="text-neutral-200">{poiCounts.attractions_recreation}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Education</span>
                  <span className="text-neutral-200">{poiCounts.education}</span>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Detailed Metrics */}
          <CollapsibleSection title="Detailed Metrics">
            <div className="space-y-4">
              {Object.entries(METRIC_GROUPS).map(([group, keys]) => (
                <div key={group}>
                  <p className="text-xs font-medium text-neutral-500 mb-1.5">{group}</p>
                  <div className="space-y-1">
                    {keys.map((key) => {
                      const value = region.metrics[key as keyof typeof region.metrics];
                      if (value === undefined) return null;
                      return (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-neutral-400">{METRIC_LABELS[key] || key}</span>
                          <span className="text-neutral-200">{formatValue(key, value as number)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Policies */}
          <CollapsibleSection title="Policies">
            <div className="space-y-1.5">
              {Object.entries(region.policies).map(([key, value]) => {
                const label = POLICY_LABELS[key] || key;
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{label}</span>
                    {value ? (
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>

          {/* Climate */}
          <CollapsibleSection title="Climate">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1.5">January</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Average</span>
                    <span className="text-neutral-200">{region.climate.climate_jan_avg.toFixed(1)}F</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low / High</span>
                    <span className="text-neutral-200">
                      {region.climate.climate_jan_min.toFixed(1)}F / {region.climate.climate_jan_max.toFixed(1)}F
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Precipitation</span>
                    <span className="text-neutral-200">{region.climate.climate_jan_ppt_avg.toFixed(2)} in</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1.5">July</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Average</span>
                    <span className="text-neutral-200">{region.climate.climate_jul_avg.toFixed(1)}F</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low / High</span>
                    <span className="text-neutral-200">
                      {region.climate.climate_jul_min.toFixed(1)}F / {region.climate.climate_jul_max.toFixed(1)}F
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Precipitation</span>
                    <span className="text-neutral-200">{region.climate.climate_jul_ppt_avg.toFixed(2)} in</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}
