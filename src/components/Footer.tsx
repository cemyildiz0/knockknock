"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Globe } from "lucide-react";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Community Guidelines", href: "/guidelines" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const connectLinks = [
  {
    label: "Email",
    href: "mailto:hello@knockknock.com",
    icon: Mail,
  },
  {
    label: "Website",
    href: "https://knockknock.com",
    icon: Globe,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f1f35] text-white font-[Inter,sans-serif]">
      <div className="max-w-7xl mx-auto px-8 pt-14 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* ── Col 1: Brand ── */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center mb-5">
              <Image
                src="/assets/logo-white.png"
                alt="Knock Knock"
                width={140}
                height={32}
                className="h-17 w-auto"
              />
            </div>
            
            </div>
            <p className="text-white/55 text-sm font-normal leading-relaxed">
              Redefining home search with intelligent matching, 
              neighborhood insights, and personalized property 
              tracking. Discover spaces that fit your lifestyle 
              and make confident decisions with data-driven clarity.
            </p>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/55 text-sm font-normal hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Connect ── */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 tracking-wide">
              Connect
            </h3>
            <div className="flex items-center gap-3">
              {connectLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                >
                  <Icon size={16} className="text-white/80" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-6">
          <p className="text-center text-white/40 text-sm font-normal">
            © 2026 knock knock. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
