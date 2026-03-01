"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { BedDouble, Bath, Ruler, Layers, MapPin } from "lucide-react";
import type { Home } from "@/types/home";
import KnockAnimation from "@/components/KnockAnimation";
import KnockResults from "@/components/KnockResults";

interface Selection {
  winner: Home | "both";
  loser: Home | null;
}

type Phase = "loading" | "playing" | "animating" | "results";

interface Props {
  neighborhoodId: number;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRounds(homes: Home[], count: number): [Home, Home][] {
  const pool = shuffle(homes);
  const rounds: [Home, Home][] = [];
  let i = 0;

  while (rounds.length < count) {
    const a = pool[i % pool.length];
    const b = pool[(i + 1) % pool.length];
    if (a.id !== b.id) {
      rounds.push([a, b]);
    }
    i++;
    if (i > pool.length * 3) break;
  }

  return rounds;
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-white/60">
      <span className="text-white/40">{icon}</span>
      <span className="font-semibold text-white/90">{value}</span>
      <span className="text-white/40">{label}</span>
    </div>
  );
}

function HomePanel({
  home,
  side,
  onSelect,
  disabled,
}: {
  home: Home;
  side: "A" | "B";
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative flex-1 min-w-0 rounded-2xl overflow-hidden border-2 border-transparent
        transition-all duration-200
        hover:border-brand-orange hover:scale-[1.01]
        disabled:cursor-not-allowed disabled:opacity-60
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange
        text-left group
      `}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-brand-navy/60">
        {home.image_url ? (
          <Image
            src={home.image_url}
            alt={home.address_line1}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin size={32} className="text-brand-teal/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-base leading-snug mb-0.5">
            {home.address_line1}
          </p>
          <p className="text-white/50 text-xs mb-3">{home.city}</p>

          {home.property_type && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-brand-mint/90 bg-brand-mint/10 border border-brand-mint/20 rounded px-2 py-0.5 mb-2">
              {home.property_type}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            {home.beds != null && (
              <StatPill icon={<BedDouble size={10} />} value={home.beds} label="bd" />
            )}
            {home.baths != null && (
              <StatPill icon={<Bath size={10} />} value={home.baths} label="ba" />
            )}
            {home.living_area != null && (
              <StatPill icon={<Ruler size={10} />} value={home.living_area.toLocaleString()} label="sqft" />
            )}
            {home.levels != null && (
              <StatPill icon={<Layers size={10} />} value={home.levels} label={home.levels === 1 ? "lvl" : "lvls"} />
            )}
          </div>

          {home.last_sale_price != null && (
            <p className="text-brand-orange font-bold text-sm">
              {formatPrice(home.last_sale_price)}
            </p>
          )}
        </div>
      </div>

      {/* Knock CTA */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-brand-orange text-brand-navy text-[10px] font-bold px-2.5 py-1 rounded-full">
          Knock
        </span>
      </div>
    </button>
  );
}

export default function KnockGame({ neighborhoodId }: Props) {
  const [homes, setHomes] = useState<Home[]>([]);
  const [rounds, setRounds] = useState<[Home, Home][]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [animatingSide, setAnimatingSide] = useState<"A" | "B" | "both" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalRounds = rounds.length;

  useEffect(() => {
    async function loadHomes() {
      try {
        const res = await fetch(`/api/neighborhoods/${neighborhoodId}/homes`);
        if (!res.ok) throw new Error("Failed to load homes");
        const json: { homes: Home[]; total: number } = await res.json();

        if (json.homes.length < 4) {
          setError("Not enough homes in this neighborhood to play.");
          setPhase("playing");
          return;
        }

        const count = Math.min(10, Math.max(5, Math.floor(json.homes.length / 2)));
        const built = buildRounds(json.homes, count);
        setHomes(json.homes);
        setRounds(built);
        setPhase("playing");
      } catch {
        setError("Could not load homes. Please try again.");
        setPhase("playing");
      }
    }

    loadHomes();
  }, [neighborhoodId]);

  const handleAnimationComplete = useCallback(() => {
    setAnimatingSide(null);
    const next = currentRound + 1;
    if (next >= totalRounds) {
      setPhase("results");
    } else {
      setCurrentRound(next);
      setPhase("playing");
    }
  }, [currentRound, totalRounds]);

  function handleSelect(side: "A" | "B" | "both") {
    if (phase !== "playing" || rounds.length === 0) return;

    const [homeA, homeB] = rounds[currentRound];
    const selection: Selection =
      side === "both"
        ? { winner: "both", loser: null }
        : side === "A"
        ? { winner: homeA, loser: homeB }
        : { winner: homeB, loser: homeA };

    setSelections((prev) => [...prev, selection]);
    setAnimatingSide(side);
    setPhase("animating");
  }

  function handlePlayAgain() {
    const count = Math.min(10, Math.max(5, Math.floor(homes.length / 2)));
    const built = buildRounds(homes, count);
    setRounds(built);
    setCurrentRound(0);
    setSelections([]);
    setAnimatingSide(null);
    setPhase("playing");
  }

  if (phase === "loading") {
    return (
      <div className="py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/4" />
          <div className="flex gap-4">
            <div className="flex-1 aspect-[4/3] bg-gray-100 rounded-2xl" />
            <div className="flex-1 aspect-[4/3] bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-brand-navy/50 text-sm">{error}</p>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <KnockResults
        selections={selections}
        allHomes={homes}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (rounds.length === 0) return null;

  const [homeA, homeB] = rounds[currentRound];

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-brand-navy">Which would you knock on?</h2>
        <span className="text-sm text-brand-teal font-medium">
          {currentRound + 1} / {totalRounds}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < currentRound
                ? "bg-brand-orange w-4"
                : i === currentRound
                ? "bg-brand-orange w-6"
                : "bg-gray-200 w-1.5"
            }`}
          />
        ))}
      </div>

      {/* Home panels */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-4">
          <HomePanel
            home={homeA}
            side="A"
            onSelect={() => handleSelect("A")}
            disabled={phase === "animating"}
          />

          <div className="flex sm:flex-col items-center justify-center gap-2 shrink-0 sm:w-10">
            <div className="flex-1 h-px sm:h-auto sm:w-px bg-gray-200" />
            <span className="text-xs font-bold text-gray-300 shrink-0">OR</span>
            <div className="flex-1 h-px sm:h-auto sm:w-px bg-gray-200" />
          </div>

          <HomePanel
            home={homeB}
            side="B"
            onSelect={() => handleSelect("B")}
            disabled={phase === "animating"}
          />
        </div>

        {/* Animation overlay */}
        {phase === "animating" && animatingSide && (
          <KnockAnimation
            side={animatingSide}
            onComplete={handleAnimationComplete}
          />
        )}
      </div>

      {/* Both equally */}
      <div className="flex justify-center mt-5">
        <button
          onClick={() => handleSelect("both")}
          disabled={phase === "animating"}
          className="text-xs font-medium text-brand-teal/70 border border-brand-teal/20 hover:border-brand-teal/50 hover:text-brand-teal px-5 py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          I like both equally
        </button>
      </div>
    </div>
  );
}
