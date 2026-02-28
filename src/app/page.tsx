"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 text-neutral-100">
      Loading map...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <Map />
    </main>
  );
}
