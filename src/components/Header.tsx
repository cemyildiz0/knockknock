"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div className="container mx-auto py-5 flex items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          <h2>Knock Knock {/* insert logo eventually  */}</h2>
        </Link>
        <Link href="/saved" className="text-2xl font-bold">
          <h2>Saved</h2>
        </Link>
      </div>
    </header>
  );
}
