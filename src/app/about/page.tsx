"use client";

import { MapPin, Star, Users, ShieldCheck, Zap, BarChart2, Heart } from "lucide-react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: "200+", label: "Neighborhoods Rated" },
  { value: "12,000+", label: "Verified Residents" },
  { value: "98%", label: "Accuracy Score" },
  { value: "4.9★", label: "Average App Rating" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Verified Reviews Only",
    description:
      "Every review on Knock Knock is tied to a verified resident. We cross-reference lease agreements and utility records so you never read a fake testimonial.",
  },
  {
    icon: Zap,
    title: "AI-Powered Insights",
    description:
      "Our proprietary scoring engine analyzes walkability, transit access, noise levels, school quality, and local amenity density to surface a single, trustworthy AI Score.",
  },
  {
    icon: BarChart2,
    title: "Real-Time Data",
    description:
      "Neighborhood ratings update weekly. Whether a new coffee shop opens or construction begins next door, our scores reflect what's happening right now — not two years ago.",
  },
  {
    icon: Heart,
    title: "Community First",
    description:
      "We're not a listing service. We don't take referral fees from landlords or developers. Our only allegiance is to the people who actually live in the neighborhoods we rate.",
  },
];

const team = [
  {
    name: "Maya Osei",
    role: "Co-Founder & CEO",
    bio: "Former urban planner turned product builder. Maya spent a decade advising city governments on livability metrics before co-founding Knock Knock.",
    initials: "MO",
    color: "bg-brand-teal",
  },
  {
    name: "Daniel Park",
    role: "Co-Founder & CTO",
    bio: "Ex-Google Maps engineer obsessed with geospatial data. Daniel architected the AI scoring engine that powers every neighborhood rating on the platform.",
    initials: "DP",
    color: "bg-brand-orange",
  },
  {
    name: "Sofia Reyes",
    role: "Head of Community",
    bio: "Community organizer with roots in tenant advocacy. Sofia ensures that every voice on the platform — from longtime homeowners to first-time renters — is heard equally.",
    initials: "SR",
    color: "bg-[#4a90b8]",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f5f3ee] font-[Inter,sans-serif]">

      {/* ── Hero ── */}
      <section className="relative bg-brand-navy overflow-hidden">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-teal/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 right-0 w-72 h-72 rounded-full bg-brand-orange/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 pt-28 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <MapPin size={11} />
            About Knock Knock
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            We believe where you live<br />
            <span className="text-brand-orange">shapes who you become.</span>
          </h1>
          <p className="mt-6 text-white/60 text-lg font-normal max-w-2xl mx-auto leading-relaxed">
            Knock Knock is a neighborhood intelligence platform built for real people making real decisions. We combine verified resident reviews with AI-powered data to give you the clearest possible picture of any community before you move in.
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-brand-navy">{value}</p>
              <p className="text-sm text-brand-teal mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-3xl font-bold text-brand-navy leading-snug">
              Transparent data for one of life's biggest decisions.
            </h2>
            <p className="mt-5 text-gray-600 font-normal leading-relaxed">
              Finding a home is already stressful. Finding the <em>right</em> neighborhood — one that fits your commute, your lifestyle, your budget, and your sense of community — is even harder. Most platforms show you glossy photos and vague walkability scores. We show you the truth.
            </p>
            <p className="mt-4 text-gray-600 font-normal leading-relaxed">
              Founded in 2022, Knock Knock was born from a frustration shared by millions of renters and buyers: the information gap between what a listing promises and what daily life actually feels like. We're here to close that gap.
            </p>
          </div>

          {/* Decorative card stack */}
          <div className="relative h-72 hidden md:block">
            <div className="absolute top-4 left-8 right-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-brand-orange fill-brand-orange" />
                <Star size={14} className="text-brand-orange fill-brand-orange" />
                <Star size={14} className="text-brand-orange fill-brand-orange" />
                <Star size={14} className="text-brand-orange fill-brand-orange" />
                <Star size={14} className="text-brand-orange fill-brand-orange" />
              </div>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "I was relocating across the country and had no idea where to start. Knock Knock gave me confidence I never expected to have before signing a lease."
              </p>
              <p className="text-xs text-gray-400 mt-3 font-medium">— Priya N., Irvine CA</p>
            </div>
            <div className="absolute bottom-0 left-0 right-8 bg-brand-navy rounded-2xl p-5">
              <p className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-1">AI Score</p>
              <p className="text-white text-4xl font-extrabold">92 <span className="text-white/40 text-lg font-normal">/ 100</span></p>
              <p className="text-white/50 text-xs mt-1">University Hills · Irvine, CA</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <p className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-3">What We Stand For</p>
          <h2 className="text-3xl font-bold text-brand-navy mb-12">Built on four principles.</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center">
                  <Icon size={18} className="text-brand-navy" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy mb-1.5">{title}</h3>
                  <p className="text-gray-500 text-sm font-normal leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── Team ── */}
      {/* <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20">
        <p className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-3">The People Behind It</p>
        <h2 className="text-3xl font-bold text-brand-navy mb-12">Meet the team.</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {team.map(({ name, role, bio, initials, color }) => (
            <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg mb-4`}>
                {initials}
              </div>
              <p className="font-bold text-brand-navy">{name}</p>
              <p className="text-brand-teal text-xs font-medium mt-0.5 mb-3">{role}</p>
              <p className="text-gray-500 text-sm font-normal leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── CTA ── */}
      <section className="bg-brand-navy py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find your neighborhood?
          </h2>
          <p className="text-white/55 font-normal mb-8 leading-relaxed">
            Explore verified ratings, real resident reviews, and AI-powered insights for hundreds of neighborhoods across the country.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-brand-orange hover:bg-[#f0a44e] text-brand-navy font-bold text-sm px-8 py-3.5 rounded-full transition-colors"
            >
              Explore Neighborhoods
            </Link>
            <Link
              href="/auth"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
