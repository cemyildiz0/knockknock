"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  ArrowLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Ruler,
  DollarSign,
  Heart,
  User,
  Mail,
  Check,
  Building2,
} from "lucide-react";
import type { Home } from "@/types/home";
import type { CommunityNeighborhood } from "@/types/community-neighborhood";
import { createClient } from "@/lib/supabase-browser";
import { proxyImageUrl } from "@/lib/proxy-image";

function StarBar({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-gray-200 fill-gray-200" />
            {fill > 0 && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-brand-orange fill-brand-orange" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price}`;
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-teal flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-2xl font-extrabold text-brand-navy leading-tight">{value}</span>
    </div>
  );
}

function ContactForm({ address }: { address: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(`I'm interested in viewing ${address}...`);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-col items-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-mint/40 flex items-center justify-center mb-3">
            <Check size={20} className="text-brand-teal" />
          </div>
          <h3 className="text-base font-bold text-brand-navy mb-1">Request received</h3>
          <p className="text-sm text-brand-teal">We&apos;ll be in touch shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-base font-bold text-brand-navy mb-4">Interested in this home?</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-brand-teal block mb-1.5">
            Your Name
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-teal/40 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-teal text-brand-navy placeholder-gray-400 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-brand-teal block mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-teal/40 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-teal text-brand-navy placeholder-gray-400 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-brand-teal block mb-1.5">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-teal text-brand-navy placeholder-gray-400 bg-white resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brand-orange hover:bg-[#f0a44e] text-brand-navy font-bold text-sm py-3 rounded-lg transition-colors"
        >
          Request a Tour
        </button>
        <p className="text-[10px] text-brand-teal/50 text-center leading-relaxed">
          By clicking &quot;Request a Tour&quot;, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}

const supabase = createClient();

export default function HomePage() {
  const params = useParams();
  const [home, setHome] = useState<Home | null>(null);
  const [neighborhood, setNeighborhood] = useState<CommunityNeighborhood | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchNeighborhood(lat: number, lng: number) {
      try {
        const res = await fetch(`/api/neighborhoods/nearby?lat=${lat}&lng=${lng}&limit=1`);
        if (res.ok) {
          const json: { data: CommunityNeighborhood[] } = await res.json();
          if (json.data.length > 0) setNeighborhood(json.data[0]);
        }
      } catch {
        // non-critical, ignore
      }
    }

    async function fetchHome() {
      const id = params.id as string;
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/homes/${id}`);
        if (res.ok) {
          const json: { home: Home } = await res.json();
          setHome(json.home);
          if (json.home.latitude != null && json.home.longitude != null) {
            fetchNeighborhood(json.home.latitude, json.home.longitude);
          }
        } else {
          console.error("Error fetching home:", res.statusText);
        }
      } catch (err) {
        console.error("Error fetching home:", err);
      }

      setLoading(false);
    }

    async function checkSaved() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("saved_homes")
        .eq("id", user.id)
        .single();

      const savedList = (profile?.saved_homes as Home[] | null) ?? [];
      setSaved(savedList.some((item) => item.id === (params.id as string)));
    }

    fetchHome();
    checkSaved();
  }, [params.id]);

  async function toggleSave() {
    if (!home) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("saved_homes")
      .eq("id", user.id)
      .single();

    const current = (profile?.saved_homes as Home[] | null) ?? [];
    const exists = current.some((item) => item.id === home.id);
    const updated = exists ? current.filter((item) => item.id !== home.id) : [...current, home];

    setSaved(!exists);
    await supabase.from("profiles").update({ saved_homes: updated }).eq("id", user.id);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF7]">
        <div className="w-full h-[420px] bg-gray-100 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl" />
                ))}
              </div>
              <div className="h-52 bg-gray-100 rounded-xl" />
              <div className="h-40 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-80 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!home) {
    return (
      <main className="min-h-screen bg-[#F8FAF7] flex items-center justify-center pt-16">
        <div className="text-center">
          <MapPin size={48} className="text-brand-teal/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-navy mb-2">Home not found</h2>
          <p className="text-brand-teal text-sm mb-4">
            This listing may have been removed or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-orange hover:underline"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF7]">
      {/* Hero */}
      <div className="relative w-full h-[420px] overflow-hidden bg-brand-navy">
        {home.image_url ? (
          <>
            <Image
              src={proxyImageUrl(home.image_url)!}
              alt={home.address_line1}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-brand-navy/55" />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-navy" />
        )}

        {/* Breadcrumb */}
        <div className="absolute top-0 left-0 right-0 pt-20 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              {neighborhood && (
                <>
                  <Link
                    href={`/neighborhood/${neighborhood.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {neighborhood.name}
                  </Link>
                  <ChevronRight size={12} />
                </>
              )}
              <span className="text-white/90 truncate max-w-[200px]">{home.address_line1}</span>
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                {home.address_line1}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <MapPin size={13} />
                  <span>{[home.city, home.state, home.zip].filter(Boolean).join(", ")}</span>
                </div>
                {home.property_type && (
                  <span className="text-white/50 text-sm">{home.property_type}</span>
                )}
              </div>
            </div>

            <button
              onClick={toggleSave}
              className={`shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all ${
                saved
                  ? "bg-brand-orange text-white"
                  : "bg-white/15 backdrop-blur-sm text-white hover:bg-white/25"
              }`}
            >
              <Heart size={14} className={saved ? "fill-current" : ""} />
              {saved ? "Saved" : "Save Property"}
            </button>
          </div>
        </div>
      </div>

      {/* Page body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left column */}
          <div className="space-y-6 min-w-0">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {home.last_sale_price != null && (
                <StatCard
                  label="Price"
                  value={formatPrice(home.last_sale_price)}
                  icon={<DollarSign size={11} />}
                />
              )}
              {home.beds != null && (
                <StatCard label="Beds" value={home.beds} icon={<BedDouble size={11} />} />
              )}
              {home.baths != null && (
                <StatCard label="Baths" value={home.baths} icon={<Bath size={11} />} />
              )}
              {home.living_area != null && (
                <StatCard
                  label="Area"
                  value={
                    <>
                      {home.living_area.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-brand-teal">sqft</span>
                    </>
                  }
                  icon={<Ruler size={11} />}
                />
              )}
            </div>

            {/* Neighborhood / Community card */}
            {neighborhood && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 size={13} className="text-brand-teal" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-teal">
                      Neighborhood
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-brand-navy mb-1">
                    Located in {neighborhood.name}
                  </h2>
                  <p className="text-sm text-brand-teal/80">
                    {neighborhood.description ??
                      (neighborhood.city
                        ? `A community in ${neighborhood.city}${neighborhood.state ? `, ${neighborhood.state}` : ""}`
                        : null)}
                  </p>
                </div>

                {neighborhood.image_url && (
                  <div className="relative w-full h-[180px]">
                    <Image
                      src={proxyImageUrl(neighborhood.image_url)!}
                      alt={neighborhood.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="px-5 py-3 flex items-center justify-between border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {neighborhood.rating != null && (
                      <div className="flex items-center gap-1.5">
                        <StarBar rating={neighborhood.rating} size={12} />
                        <span className="text-xs font-semibold text-brand-navy">
                          {neighborhood.rating.toFixed(1)}
                        </span>
                        {neighborhood.review_count != null && (
                          <span className="text-xs text-brand-teal">
                            ({neighborhood.review_count})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/neighborhood/${neighborhood.id}`}
                    className="text-xs font-semibold text-brand-orange hover:underline flex items-center gap-0.5"
                  >
                    View Neighborhood
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:sticky lg:top-20 self-start">
            <ContactForm address={home.address_line1} />
          </div>
        </div>
      </div>
    </main>
  );
}
