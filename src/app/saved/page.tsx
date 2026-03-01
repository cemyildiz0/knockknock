"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin,
  ChevronRight,
  Heart,
  BedDouble,
  Bath,
  Home as HomeIcon,
  Compass,
  Bookmark,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import type { Home } from "@/types/home";
import type { BoundaryEntry, HomePoint } from "@/components/SavedMap";
import type { MultiPolygon } from "geojson";

const SavedMap = dynamic(() => import("@/components/SavedMap"), { ssr: false });

const supabase = createClient();

type Tab = "homes" | "communities";

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${Math.round(price / 1_000)}k`;
  return `$${price}`;
}

function StarBar({ rating }: { rating: number }) {
  const size = 11;
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-gray-200 fill-gray-200" />
            {fill > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star size={size} className="text-brand-orange fill-brand-orange" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NeighborhoodItem({
  item,
  selected,
  onRemove,
  onSelect,
}: {
  item: CommunityNeighborhood;
  selected: boolean;
  onRemove: (id: number) => void;
  onSelect: (id: number) => void;
}) {
  return (
    <div
      className={`flex h-[88px] bg-white rounded-xl border overflow-hidden cursor-pointer transition-colors ${
        selected
          ? "border-brand-teal/50 ring-1 ring-brand-teal/20"
          : "border-gray-100 hover:border-gray-200"
      }`}
      onClick={() => onSelect(item.id)}
    >
      <div className="w-[88px] flex-shrink-0 bg-gray-100 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Compass size={18} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-navy truncate leading-tight">{item.name}</p>
          {(item.city || item.state) && (
            <p className="text-xs text-brand-teal flex items-center gap-1 mt-0.5">
              <MapPin size={9} />
              {[item.city, item.state].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        {item.rating != null && (
          <div className="flex items-center gap-1.5">
            <StarBar rating={item.rating} />
            <span className="text-xs font-bold text-brand-navy">{item.rating.toFixed(1)}</span>
            {item.review_count != null && (
              <span className="text-[10px] text-brand-teal">({item.review_count})</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-between py-2.5 px-2.5 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="text-brand-orange hover:text-red-500 transition-colors"
          title="Remove"
        >
          <Heart size={13} className="fill-current" />
        </button>
        <Link
          href={`/neighborhood/${item.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-brand-teal/40 hover:text-brand-navy transition-colors"
        >
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function HomeItem({
  item,
  selected,
  onRemove,
  onSelect,
}: {
  item: Home;
  selected: boolean;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={`flex h-[88px] bg-white rounded-xl border overflow-hidden cursor-pointer transition-colors ${
        selected
          ? "border-brand-teal/50 ring-1 ring-brand-teal/20"
          : "border-gray-100 hover:border-gray-200"
      }`}
      onClick={() => onSelect(item.id)}
    >
      <div className="w-[88px] flex-shrink-0 bg-gray-100 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.address_line1} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HomeIcon size={18} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-navy truncate leading-tight">
            {item.address_line1}
          </p>
          <p className="text-xs text-brand-teal flex items-center gap-1 mt-0.5">
            <MapPin size={9} />
            {[item.city, item.state, item.zip].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {item.last_sale_price != null && (
            <span className="text-sm font-bold text-brand-navy">
              {formatPrice(item.last_sale_price)}
            </span>
          )}
          {(item.beds != null || item.baths != null) && (
            <div className="flex items-center gap-2 text-xs text-brand-teal/70">
              {item.beds != null && (
                <span className="flex items-center gap-0.5">
                  <BedDouble size={10} />
                  {item.beds}
                </span>
              )}
              {item.baths != null && (
                <span className="flex items-center gap-0.5">
                  <Bath size={10} />
                  {item.baths}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-between py-2.5 px-2.5 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="text-brand-orange hover:text-red-500 transition-colors"
          title="Remove"
        >
          <Heart size={13} className="fill-current" />
        </button>
        <Link
          href={`/home/${item.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-brand-teal/40 hover:text-brand-navy transition-colors"
        >
          <ChevronRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="flex h-[calc(100vh-4rem)] mt-16 overflow-hidden">
      <div className="w-[440px] flex-shrink-0 flex flex-col bg-[#F8FAF7] border-r border-gray-200">
        <div className="px-6 pt-6 pb-0 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-32 mb-1.5 animate-pulse" />
          <div className="h-3.5 bg-gray-100 rounded w-52 mb-5 animate-pulse" />
          <div className="flex gap-6">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-24 mb-3 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-[88px] bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="w-[88px] bg-gray-100 flex-shrink-0" />
              <div className="flex-1 px-3 py-2.5 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-gray-100" />
    </main>
  );
}

export default function SavedPage() {
  const [neighborhoods, setNeighborhoods] = useState<CommunityNeighborhood[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [boundaries, setBoundaries] = useState<BoundaryEntry[]>([]);
  const [homePoints, setHomePoints] = useState<HomePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("homes");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("saved, saved_homes")
        .eq("id", user.id)
        .single();

      const loadedHomes = (profile?.saved_homes as Home[] | null) ?? [];
      const loadedNeighborhoods = (profile?.saved as CommunityNeighborhood[] | null) ?? [];

      setHomes(loadedHomes);
      setNeighborhoods(loadedNeighborhoods);

      if (loadedNeighborhoods.length > 0) {
        const { data: bdData } = await supabase
          .from("community_neighborhoods")
          .select("id, name, boundary")
          .in("id", loadedNeighborhoods.map((n) => n.id));

        if (bdData) {
          setBoundaries(
            (bdData as { id: number; name: string; boundary: unknown }[])
              .filter((b) => b.boundary != null)
              .map((b) => ({ id: b.id, name: b.name, boundary: b.boundary as MultiPolygon }))
          );
        }
      }

      const pts: HomePoint[] = loadedHomes
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => ({
          id: h.id,
          lat: h.latitude!,
          lng: h.longitude!,
          address: h.address_line1,
        }));
      setHomePoints(pts);

      if (loadedHomes.length === 0 && loadedNeighborhoods.length > 0) {
        setActiveTab("communities");
      }

      setLoading(false);
    }

    load();
  }, []);

  const removeNeighborhood = async (id: number) => {
    if (!userId) return;
    const updated = neighborhoods.filter((n) => n.id !== id);
    setNeighborhoods(updated);
    setBoundaries((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    await supabase.from("profiles").update({ saved: updated }).eq("id", userId);
  };

  const removeHome = async (id: string) => {
    if (!userId) return;
    const updated = homes.filter((h) => h.id !== id);
    setHomes(updated);
    setHomePoints((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("profiles").update({ saved_homes: updated }).eq("id", userId);
  };

  const handleSelect = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setSelectedHomeId(null);
    setActiveTab("communities");
  };

  const handleHomeSelect = (id: string) => {
    setSelectedHomeId((prev) => (prev === id ? null : id));
    setSelectedId(null);
    setActiveTab("homes");
  };

  if (loading) return <LoadingSkeleton />;

  if (!userId) {
    return (
      <main className="flex h-[calc(100vh-4rem)] mt-16 overflow-hidden">
        <div className="w-[440px] flex-shrink-0 flex items-center justify-center bg-[#F8FAF7] border-r border-gray-200">
          <div className="text-center px-8">
            <Bookmark size={32} className="text-brand-teal/20 mx-auto mb-3" />
            <p className="text-brand-navy font-semibold mb-1">Sign in to see your saved places</p>
            <p className="text-xs text-brand-teal mb-4">
              Save homes and communities to access them here.
            </p>
            <Link
              href="/auth"
              className="text-sm font-semibold text-brand-orange hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
          <SavedMap boundaries={[]} homePoints={[]} selectedId={null} selectedHomeId={null} onSelect={() => {}} onSelectHome={() => {}} />
        </div>
      </main>
    );
  }

  const total = neighborhoods.length + homes.length;

  return (
    <main className="flex h-[calc(100vh-4rem)] mt-16 overflow-hidden">
      {/* Left panel */}
      <div className="w-[440px] flex-shrink-0 flex flex-col bg-[#F8FAF7] border-r border-gray-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-xl font-bold text-brand-navy">Saved Places</h1>
          <p className="text-xs text-brand-teal mt-0.5 mb-5">
            Manage your favorite homes and communities
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`pb-2.5 mr-6 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === "homes"
                  ? "border-brand-navy text-brand-navy"
                  : "border-transparent text-brand-teal hover:text-brand-navy"
              }`}
              onClick={() => setActiveTab("homes")}
            >
              Homes{homes.length > 0 ? ` (${homes.length})` : ""}
            </button>
            <button
              className={`pb-2.5 mr-6 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === "communities"
                  ? "border-brand-navy text-brand-navy"
                  : "border-transparent text-brand-teal hover:text-brand-navy"
              }`}
              onClick={() => setActiveTab("communities")}
            >
              Communities{neighborhoods.length > 0 ? ` (${neighborhoods.length})` : ""}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <Bookmark size={28} className="text-brand-teal/20 mb-3" />
              <p className="text-brand-navy font-semibold text-sm mb-1">Nothing saved yet</p>
              <p className="text-xs text-brand-teal mb-4">
                Explore neighborhoods and homes to build your list.
              </p>
              <Link href="/" className="text-xs font-semibold text-brand-orange hover:underline">
                Explore
              </Link>
            </div>
          ) : (
            <>
              {activeTab === "homes" && (
                <>
                  {homes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-brand-teal">No homes saved yet.</p>
                    </div>
                  ) : (
                    homes.map((h) => (
                      <HomeItem
                        key={h.id}
                        item={h}
                        selected={selectedHomeId === h.id}
                        onRemove={removeHome}
                        onSelect={handleHomeSelect}
                      />
                    ))
                  )}
                </>
              )}

              {activeTab === "communities" && (
                <>
                  {neighborhoods.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-brand-teal">No communities saved yet.</p>
                    </div>
                  ) : (
                    neighborhoods.map((n) => (
                      <NeighborhoodItem
                        key={n.id}
                        item={n}
                        selected={selectedId === n.id}
                        onRemove={removeNeighborhood}
                        onSelect={handleSelect}
                      />
                    ))
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <SavedMap
          boundaries={boundaries}
          homePoints={homePoints}
          selectedId={selectedId}
          selectedHomeId={selectedHomeId}
          onSelect={handleSelect}
          onSelectHome={handleHomeSelect}
        />
      </div>
    </main>
  );
}
