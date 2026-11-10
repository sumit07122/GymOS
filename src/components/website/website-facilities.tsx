"use client";

import * as React from "react";
import {
  Dumbbell,
  Flame,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface WebsiteFacilitiesProps {
  facilities: string[];
  primaryColor: string;
}

export function WebsiteFacilities({
  facilities,
  primaryColor,
}: WebsiteFacilitiesProps) {
  return (
    <section id="facilities" className="py-20 sm:py-28 bg-slate-950 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
            <Sparkles className="h-4 w-4" />
            <span>Facility & Amenities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Everything You Need to Train at Your Highest Level
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Our floor is designed for focus, efficiency, and comfort. From heavy compound lifting to post-workout sauna recovery.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {facilities.map((facility, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all flex items-start gap-3.5"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white shrink-0 group-hover:scale-110 transition-transform"
                style={{ color: primaryColor }}
              >
                {idx % 4 === 0 && <Dumbbell className="h-5 w-5" />}
                {idx % 4 === 1 && <Flame className="h-5 w-5" />}
                {idx % 4 === 2 && <Activity className="h-5 w-5" />}
                {idx % 4 === 3 && <ShieldCheck className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-slate-100 transition-colors">
                  {facility}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Included with all memberships</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
