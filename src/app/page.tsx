"use client";

import { useEffect, useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import NeighborhoodCard from "@/components/NeighborhoodCard";
import HeroSection from "@/components/home/Hero";

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const PAGE_SIZE = 6;

export default function Home() {
  const [neighborhoods, setNeighborhoods] = useState<CommunityNeighborhood[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const res = await fetch(`/api/neighborhoods?limit=${PAGE_SIZE}`);
        if (!res.ok) {
          console.error("Error fetching community neighborhoods:", res.statusText);
        } else {
          const json: { data: CommunityNeighborhood[]; pagination: PaginationMeta } = await res.json();
          setNeighborhoods(json.data ?? []);
          setTotalCount(json.pagination?.totalItems ?? 0);
        }
      } catch (err) {
        console.error("Error fetching community neighborhoods:", err);
      }

      setLoading(false);
    }

    fetchNeighborhoods();
  }, []);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const res = await fetch(`/api/neighborhoods?page=${nextPage}&limit=${PAGE_SIZE}`);
      if (res.ok) {
        const json: { data: CommunityNeighborhood[]; pagination: PaginationMeta } = await res.json();
        setNeighborhoods((prev) => [...prev, ...(json.data ?? [])]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Error loading more neighborhoods:", err);
    }

    setLoadingMore(false);
  }

  const hasMore = neighborhoods.length < totalCount;

  return (
    <div className="flex flex-col w-full min-h-screen">
      <HeroSection />

      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">
              Top Neighborhoods
            </h2>
            {totalCount > 0 && (
              <p className="text-sm text-brand-teal mt-0.5">
                {totalCount} neighborhoods in Irvine
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse break-inside-avoid mb-5"
              >
                <div className={`${i === 0 || i === 2 || i === 4 ? "h-64" : "h-40"} bg-gray-50`} />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-50 rounded w-3/4" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="w-3.5 h-3.5 bg-gray-50 rounded-sm" />
                    ))}
                  </div>
                  <div className="h-3 bg-gray-50 rounded w-full" />
                  <div className="h-3 bg-gray-50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : neighborhoods.length === 0 ? (
          <div className="text-center py-16">
            <MapPin size={40} className="text-brand-teal/30 mx-auto mb-3" />
            <p className="text-brand-navy font-medium mb-1">No neighborhoods found</p>
            <p className="text-brand-teal text-sm">Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {neighborhoods.map((neighborhood, i) => (
                <NeighborhoodCard
                  key={neighborhood.id}
                  neighborhood={neighborhood}
                  featured={i === 0 || i === 2 || i === 4}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-teal/40 text-brand-navy font-semibold text-sm px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      Show More
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
