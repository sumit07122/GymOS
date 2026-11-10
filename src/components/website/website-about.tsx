"use client";

import * as React from "react";
import { CheckCircle2, Dumbbell, Users, Target, ShieldCheck } from "lucide-react";

interface WebsiteAboutProps {
  gym: {
    name: string;
    city?: string | null;
  };
  website: {
    aboutText: string;
    primaryColor: string;
  };
}

export function WebsiteAbout({ gym, website }: WebsiteAboutProps) {
  return (
    <section id="about" className="py-20 sm:py-28 bg-slate-900 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story Copy */}
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-3" style={{ color: website.primaryColor }}>
              <ShieldCheck className="h-4 w-4" />
              <span>About Our Gym</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              A Community Driven By Dedication, Strength & Growth
            </h2>

            <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed">
              {website.aboutText}
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
                <p className="text-xs sm:text-sm text-slate-300">
                  <strong className="text-white">World-Class Equipment:</strong> Olympic bars, calibrated plates, pin-loaded resistance stacks, and high-performance cardio machines.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
                <p className="text-xs sm:text-sm text-slate-300">
                  <strong className="text-white">Supportive Culture:</strong> An ego-free training environment where beginners and seasoned lifters thrive together.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
                <p className="text-xs sm:text-sm text-slate-300">
                  <strong className="text-white">Transparent Memberships:</strong> No hidden registration charges, no cancellation games, and digital pass check-ins.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Stat Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl flex flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white mb-4">
                <Dumbbell className="h-6 w-6" style={{ color: website.primaryColor }} />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-white">100+</span>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Premium Machines</h4>
                <p className="text-[11px] text-slate-500 mt-1">Free weights, cable crossovers & power racks</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl flex flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white mb-4">
                <Users className="h-6 w-6" style={{ color: website.primaryColor }} />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-white">500+</span>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Active Members</h4>
                <p className="text-[11px] text-slate-500 mt-1">Thriving fitness community in {gym.city || "town"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl flex flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white mb-4">
                <Target className="h-6 w-6" style={{ color: website.primaryColor }} />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-white">100%</span>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Results Focused</h4>
                <p className="text-[11px] text-slate-500 mt-1">Custom workout routines and tracking</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl flex flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white mb-4">
                <ShieldCheck className="h-6 w-6" style={{ color: website.primaryColor }} />
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-white">24/7</span>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Digital Access</h4>
                <p className="text-[11px] text-slate-500 mt-1">Contactless dynamic QR entry pass</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
