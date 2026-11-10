/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Award, UserCheck } from "lucide-react";

interface WebsiteTrainersProps {
  trainers: Array<{
    name: string;
    role: string;
    bio?: string | null;
    imageUrl?: string | null;
  }>;
  primaryColor: string;
}

export function WebsiteTrainers({
  trainers,
  primaryColor,
}: WebsiteTrainersProps) {
  if (!trainers || trainers.length === 0) return null;

  return (
    <section id="trainers" className="py-20 sm:py-28 bg-slate-950 text-white border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
            <Award className="h-4 w-4" />
            <span>Coaching Staff</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Meet the Certified Fitness Coaches
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Dedicated professionals with deep expertise in powerlifting, athletic conditioning, weight management, and functional rehabilitation.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="relative h-64 w-full bg-slate-800 overflow-hidden">
                  {trainer.imageUrl ? (
                    <img
                      src={trainer.imageUrl}
                      alt={trainer.name}
                      className="h-full w-full object-cover object-center filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-600 bg-slate-900">
                      <UserCheck className="h-16 w-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                {/* Details */}
                <div className="p-6">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider block"
                    style={{ color: primaryColor }}
                  >
                    {trainer.role}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {trainer.name}
                  </h3>
                  {trainer.bio && (
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {trainer.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
