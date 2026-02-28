"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-neutral-100">
      Loading map...
    </div>
  ),
});

export default function MapOverview() {
  return (
    <main className="h-full w-full">
      <Map />
    </main>
  );
}
