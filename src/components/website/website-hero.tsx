/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { ArrowRight, ShieldCheck, Clock, Award, Flame, Sparkles, CheckCircle2 } from "lucide-react";

interface WebsiteHeroProps {
  gym: {
    name: string;
    city?: string | null;
  };
  website: {
    headline: string;
    subheadline: string;
    tagline: string;
    heroImageUrl: string;
    primaryColor: string;
    customNotice?: string | null;
  };
}

export function WebsiteHero({ gym, website }: WebsiteHeroProps) {
  return (
    <section
      aria-label={`Welcome to ${gym.name}`}
      className="relative overflow-hidden bg-gradient-to-b from-[#0B1528] via-[#0F1E36] to-[#081220] text-white py-16 sm:py-24 lg:py-28"
    >
      {/* Decorative Subtle Accent Glow (Zero text clash) */}
      <div
        className="pointer-events-none absolute -top-40 right-10 h-96 w-96 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: website.primaryColor || "#0B6B4F" }}
      />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full blur-3xl opacity-15 bg-emerald-500" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Clear, High-Contrast Typography & CTAs */}
          <div className="lg:col-span-7 text-center sm:text-left">
            {/* Custom Notice Banner if configured */}
            {website.customNotice && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 border border-white/15 backdrop-blur-md mb-4 shadow-xs">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>{website.customNotice}</span>
              </div>
            )}

            {/* Tagline Pill */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold mb-3 text-[#A7F3D0]">
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{website.tagline}</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              {website.headline}
            </h1>

            {/* Subheadline with high-contrast text-slate-300 */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl font-normal">
              {website.subheadline}
            </p>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 justify-center sm:justify-start">
              <a
                href="#plans"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[10px] text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ backgroundColor: website.primaryColor || "#0B6B4F" }}
              >
                <span>Explore Memberships</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#enquire"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[10px] text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all text-center shadow-xs"
              >
                Book a Free Day Pass
              </a>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-12 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Open 7 Days</h4>
                  <p className="text-[11px] text-slate-400">Flexible hours</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Elite Floor</h4>
                  <p className="text-[11px] text-slate-400">Pro equipment</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Top Coaches</h4>
                  <p className="text-[11px] text-slate-400">Certified team</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">No Lock-in</h4>
                  <p className="text-[11px] text-slate-400">Fair terms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Elegant Framed Picture Box (Zero Text Overlap) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[16px] border border-white/15 bg-white/[0.04] p-3.5 sm:p-4 backdrop-blur-xl shadow-xl group">
              {/* Picture Box Header Bar */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">
                    {gym.name}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Facility Open</span>
                </div>
              </div>

              {/* Framed Picture Container */}
              <div className="relative mt-3 overflow-hidden rounded-[12px] border border-white/10 aspect-[4/3] sm:aspect-[5/4] bg-slate-900 shadow-inner">
                <img
                  src={website.heroImageUrl}
                  alt={`${gym.name} training floor`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Inner Gradient Vignette for depth */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Bottom Docked Information Pill inside picture frame */}
                <div className="absolute bottom-3 left-3 right-3 rounded-[10px] bg-slate-950/80 backdrop-blur-md border border-white/15 p-2.5 text-xs text-slate-200 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-white truncate">
                      {gym.city ? `${gym.city} Campus` : "Certified Strength Arena"}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A7F3D0] font-medium shrink-0">
                    Free Guest Pass
                  </span>
                </div>
              </div>

              {/* Box Footer Strip: 3 Quick Tags */}
              <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>&bull; Air Conditioned</span>
                <span>&bull; Lockers & Showers</span>
                <span>&bull; Dynamic QR Pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
