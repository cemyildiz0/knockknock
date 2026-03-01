"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("saved")
        .eq("id", user.id)
        .single();

      setSaved(profile?.saved || []);
      setLoading(false);
    };

    fetchSaved();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-black">
      <div className="relative w-full h-[300px] md:h-[400px]">
        <Image
          src="/assets/saved-neighborhood.jpg"
          alt="Saved Places Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold">Your Saved Places</h1>
          <p className="mt-3 text-lg text-neutral-200">
            Keep track of neighborhoods you love
          </p>
        </div>
      </div>

      <div className="px-6 py-10">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : saved.length === 0 ? (
          <div className="text-center">
            <p className="text-lg">You haven’t saved anything yet.</p>
            <Link
              href="/"
              className="mt-4 inline-block text-orange-500 hover:text-orange-600 transition-colors"
            >
              Explore neighborhoods →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="text-xl font-semibold">{item.name}</h2>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} />
                    {[item.city, item.state].filter(Boolean).join(", ")}
                  </div>

                  <Link
                    href={`/neighborhood/${item.id}`}
                    className="inline-block mt-3 text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}