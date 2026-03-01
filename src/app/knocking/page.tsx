"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

export default function Knocking() {
  const [selected, setSelected] = useState(null);

  const houseA = {
    title: "Modern Family Home",
    location: "Irvine, CA",
    rating: 4.8,
    image: "/assets/saved-neighborhood.jpg",
    beds: 4,
    baths: 3,
  };

  const houseB = {
    title: "Cozy Suburban Retreat",
    location: "Tustin, CA",
    rating: 4.6,
    image: "/assets/hero-neighborhood.jpeg",
    beds: 3,
    baths: 2,
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-black">

      {/* HERO */}
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
          <h1 className="text-4xl md:text-5xl font-bold">
            Would You Rather...
          </h1>
          <p className="mt-3 text-lg text-neutral-200">
            Knock on the door of your dream home!
          </p>
        </div>
      </div>

      {/* HOUSE CARDS */}
      <div className="px-6 py-16 grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">

        {/* House A */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-60">
            <Image
              src={houseA.image}
              alt={houseA.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold">{houseA.title}</h2>
            <div className="flex items-center text-neutral-600 mt-2">
              <MapPin className="w-4 h-4 mr-2" />
              {houseA.location}
            </div>
            <div className="flex items-center mt-2 text-yellow-500">
              <Star className="w-4 h-4 mr-1 fill-yellow-500" />
              {houseA.rating}
            </div>
            <div className="mt-3 text-sm text-neutral-600">
              {houseA.beds} Beds • {houseA.baths} Baths
            </div>
          </div>
        </div>

        {/* House B */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-60">
            <Image
              src={houseB.image}
              alt={houseB.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold">{houseB.title}</h2>
            <div className="flex items-center text-neutral-600 mt-2">
              <MapPin className="w-4 h-4 mr-2" />
              {houseB.location}
            </div>
            <div className="flex items-center mt-2 text-yellow-500">
              <Star className="w-4 h-4 mr-1 fill-yellow-500" />
              {houseB.rating}
            </div>
            <div className="mt-3 text-sm text-neutral-600">
              {houseB.beds} Beds • {houseB.baths} Baths
            </div>
          </div>
        </div>

      </div>

      {/* DOOR BUTTONS */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-20 pb-20">

        {/* Door A */}
        <button
          onClick={() => setSelected("A")}
          className="transition-transform hover:scale-105"
        >
          <Image
            src="/assets/door.PNG"
            alt="Choose House A"
            width={180}
            height={350}
            className={`transition-all duration-300 ${
              selected === "A" ? "scale-110 drop-shadow-2xl" : ""
            }`}
          />
        </button>

        <div className="text-3xl font-bold text-neutral-400">OR</div>

        {/* Door B */}
        <button
          onClick={() => setSelected("B")}
          className="transition-transform hover:scale-105"
        >
          <Image
            src="/assets/door.PNG"
            alt="Choose House B"
            width={180}
            height={350}
            className={`transition-all duration-300 ${
              selected === "B" ? "scale-110 drop-shadow-2xl" : ""
            }`}
          />
        </button>

      </div>

    </div>
  );
}