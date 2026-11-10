"use client";

import * as React from "react";
import { ArrowRight, ShieldCheck, Clock, Award, Flame } from "lucide-react";

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
    <section aria-label={`Welcome to ${gym.name}`} className="relative overflow-hidden bg-slate-950 text-white py-24 sm:py-32 lg:py-40">
      {/* Background Hero Image with dark gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 filter brightness-75 scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url(${website.heroImageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />

      {/* Decorative Accent Glow */}
      <div
        className="absolute -top-40 right-0 h-96 w-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: website.primaryColor }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        {/* Custom Notice Banner if configured */}
        {website.customNotice && (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-200 border border-white/15 backdrop-blur-md mb-6">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>{website.customNotice}</span>
          </div>
        )}

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-3" style={{ color: website.primaryColor }}>
            <ShieldCheck className="h-4 w-4" />
            <span>{website.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {website.headline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {website.subheadline}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center sm:justify-start">
            <a
              href="#plans"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{ backgroundColor: website.primaryColor }}
            >
              <span>Explore Memberships</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#enquire"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all text-center"
            >
              Book a Free Day Pass
            </a>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Open 7 Days</h4>
              <p className="text-[11px] text-slate-400">Flexible schedule</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Elite Equipment</h4>
              <p className="text-[11px] text-slate-400">Pro-grade strength</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Expert Coaches</h4>
              <p className="text-[11px] text-slate-400">Certified guidance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Zero Lock-In</h4>
              <p className="text-[11px] text-slate-400">Transparent pricing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
