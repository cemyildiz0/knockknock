"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ChevronRight,
  Heart,
  BedDouble,
  Bath,
  Home as HomeIcon,
  Compass,
  Bookmark,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import type { Home } from "@/types/home";

const supabase = createClient();

function NeighborhoodRow({
  item,
  onRemove,
}: {
  item: CommunityNeighborhood;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-[72px] h-[52px] rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            width={72}
            height={52}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Compass size={20} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-navy truncate">{item.name}</p>
        {(item.city || item.state) && (
          <p className="text-xs text-brand-teal flex items-center gap-1 mt-0.5">
            <MapPin size={10} />
            {[item.city, item.state].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-brand-orange hover:text-red-500 transition-colors"
          title="Remove from saved"
        >
          <Heart size={14} className="fill-current" />
        </button>
        <Link
          href={`/neighborhood/${item.id}`}
          className="p-1.5 text-brand-teal/40 hover:text-brand-navy transition-colors"
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function HomeRow({
  item,
  onRemove,
}: {
  item: Home;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-[72px] h-[52px] rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.address_line1}
            width={72}
            height={52}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HomeIcon size={20} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-navy truncate">{item.address_line1}</p>
        <p className="text-xs text-brand-teal flex items-center gap-1 mt-0.5">
          <MapPin size={10} />
          {[item.city, item.state, item.zip].filter(Boolean).join(", ")}
        </p>
        {(item.beds != null || item.baths != null) && (
          <p className="text-xs text-brand-teal/70 flex items-center gap-2 mt-0.5">
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
          </p>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-brand-orange hover:text-red-500 transition-colors"
          title="Remove from saved"
        >
          <Heart size={14} className="fill-current" />
        </button>
        <Link
          href={`/home/${item.id}`}
          className="p-1.5 text-brand-teal/40 hover:text-brand-navy transition-colors"
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="h-7 bg-gray-100 rounded w-20 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-24 mb-8 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-[72px] h-[52px] rounded-lg bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function SavedPage() {
  const [neighborhoods, setNeighborhoods] = useState<CommunityNeighborhood[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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

      setNeighborhoods((profile?.saved as CommunityNeighborhood[] | null) ?? []);
      setHomes((profile?.saved_homes as Home[] | null) ?? []);
      setLoading(false);
    }

    load();
  }, []);

  const removeNeighborhood = async (id: number) => {
    if (!userId) return;
    const updated = neighborhoods.filter((n) => n.id !== id);
    setNeighborhoods(updated);
    await supabase.from("profiles").update({ saved: updated }).eq("id", userId);
  };

  const removeHome = async (id: string) => {
    if (!userId) return;
    const updated = homes.filter((h) => h.id !== id);
    setHomes(updated);
    await supabase.from("profiles").update({ saved_homes: updated }).eq("id", userId);
  };

  if (loading) return <LoadingSkeleton />;

  const total = neighborhoods.length + homes.length;

  if (!userId) {
    return (
      <main className="min-h-screen bg-[#F8FAF7] flex items-center justify-center pt-16">
        <div className="text-center">
          <Bookmark size={32} className="text-brand-teal/20 mx-auto mb-3" />
          <p className="text-brand-navy font-medium mb-1">Sign in to see your saved places</p>
          <Link
            href="/auth"
            className="text-sm font-medium text-brand-orange hover:underline mt-2 inline-block"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-navy">Saved</h1>
          {total > 0 && (
            <p className="text-sm text-brand-teal mt-1">
              {total} {total === 1 ? "place" : "places"} saved
            </p>
          )}
        </div>

        {total === 0 ? (
          <div className="text-center py-16">
            <Bookmark size={32} className="text-brand-teal/20 mx-auto mb-3" />
            <p className="text-brand-navy font-medium mb-1">Nothing saved yet</p>
            <p className="text-sm text-brand-teal mb-4">
              Explore neighborhoods and houses to start building your list.
            </p>
            <Link href="/" className="text-sm font-medium text-brand-orange hover:underline">
              Explore
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {neighborhoods.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-teal mb-3">
                  Neighborhoods
                </p>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {neighborhoods.map((n) => (
                    <NeighborhoodRow key={n.id} item={n} onRemove={removeNeighborhood} />
                  ))}
                </div>
              </section>
            )}

            {homes.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-teal mb-3">
                  Houses
                </p>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {homes.map((h) => (
                    <HomeRow key={h.id} item={h} onRemove={removeHome} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
