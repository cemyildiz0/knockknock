"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-neutral-900 text-neutral-100 px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold">
        <Link href="/">knock knock.</Link>
      </div>

      <div className="space-x-6 text-neutral-200">
        <Link href="/" className="hover:text-white transition">
          Home
        </Link>
        <Link href="/mapOverview" className="hover:text-white transition">
          Explore
        </Link>
        <Link href="/" className="hover:text-white transition">
          Saved
        </Link>
      </div>
    </nav>
  );
}
