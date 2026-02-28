"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function HeroSection() {
  const [query, setQuery] = useState("");


  // will need to connect to the backend API that works with our dedicated AI.
  const handleSearch = () => {
    if (query.trim()) {
      console.log("Searching:", query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="relative w-full min-h-[520px] flex items-center justify-center overflow-hidden">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/hero-neighborhood.jpeg')" }}
      />
      {/* Dark scrim */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto gap-6">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight">
          <span className="text-white">Knock on </span>
          <span className="text-[#FFB563]">Your Next Community</span>
        </h1>

        {/* Subheading */}
        <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed">
          Discover top-rated communities with AI-powered insights and real
          resident reviews.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-3xl mt-2">
          <div className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden px-4 py-2 gap-3">
            {/* AI icon */}
            <div className="shrink-0 text-teal-700">
              <AIBrainIcon />
            </div>

            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI: Where's a quiet neighborhood with great schools and parks?"
              className="flex-1 text-xs sm:text-sm md:text-base text-gray-500 placeholder-gray-400 bg-transparent focus:outline-none py-2"
            />

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="shrink-0 flex items-center gap-2 bg-[#FFB563] hover:bg-amber-500 active:bg-amber-600 text-gray-900 font-semibold text-sm sm:text-base px-5 py-3 rounded-xl transition-colors duration-150 shadow-sm"
            >
              <Search size={16} strokeWidth={2.5} />
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Minimal brain/AI icon matching the screenshot's half-circle brain glyph
function AIBrainIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Left brain lobe */}
      <path d="M9.5 2a4.5 4.5 0 0 0-4 6.8A4 4 0 0 0 4 12a4 4 0 0 0 2 3.46V17a3 3 0 0 0 6 0v-1" />
      {/* Right brain lobe */}
      <path d="M14.5 2a4.5 4.5 0 0 1 4 6.8A4 4 0 0 1 20 12a4 4 0 0 1-2 3.46V17a3 3 0 0 1-6 0v-1" />
      {/* Center divide */}
      <line x1="12" y1="2" x2="12" y2="16" />
    </svg>
  );
}
