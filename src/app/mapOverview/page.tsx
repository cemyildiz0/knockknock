"use client";

import dynamic from "next/dynamic";

import Link from "next/link";


const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 text-neutral-100">
      Loading map...
    </div>
  ),
});

export default function mapOverview(): JSX.Element {
  return (
    <main className="h-screen w-screen">
      <Map />

      <Link href="/about" className="text-blue-400 underline">
        Go to About
        \</Link>
      
    </main>
  );
}
