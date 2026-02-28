"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white text-black px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold">
        <Link href="/">knock knock.</Link>
      </div>

      <div className="space-x-6 text-black font-bold">
        <Link href="/" className="hover:text-orange-300 transition">
          Home
        </Link>
        <Link href="/mapOverview" className="hover:text-orange-300 transition">
          Explore
        </Link>
        <Link href="/" className="hover:text-orange-300 transition">
          Saved
        </Link>
      </div>
    </nav>
  );
}
