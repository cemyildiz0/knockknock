"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0f1f35] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col items-center gap-2">
        <Image
          src="/assets/logo-white.PNG"
          alt="Knock Knock"
          width={160}
          height={38}
          className="h-10 w-auto opacity-50"
        />
        <p className="text-white/25 text-xs tracking-widest uppercase">
          Irvine, CA
        </p>
      </div>
    </footer>
  );
}
