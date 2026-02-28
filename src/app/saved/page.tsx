"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

interface SavedItem {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
}

export default function SavedPage() {
  const [saved] = useState<SavedItem[]>([
    {
      id: 1,
      name: "Downtown Irvine",
      image: "/assets/hero-neighborhood.jpeg",
      rating: 4.5,
      reviews: 128,
      location: "Irvine, CA",
    },
    {
      id: 2,
      name: "Woodbridge",
      image: "/assets/hero-neighborhood.jpeg",
      rating: 4.2,
      reviews: 96,
      location: "Irvine, CA",
    },
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-black">
      <div className="px-6 py-10 border-b border-neutral-800">
        <h1 className="text-3xl font-bold">Saved Places</h1>
        <p className="text-neutral-500 mt-1">
          Your bookmarked neighborhoods
        </p>
      </div>

      <div className="px-6 py-10">
        {saved.length === 0 ? (
          <div className="text-center text-black">
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
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="text-xl font-semibold">{item.name}</h2>

                  <div className="flex items-center gap-2 text-sm text-black">
                    <MapPin size={14} />
                    {item.location}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Star size={16} className="text-orange-500 fill-orange-500" />
                    <span className="font-medium">{item.rating}</span>
                    <span className="text-black">
                      ({item.reviews} reviews)
                    </span>
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