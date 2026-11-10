"use client";

import * as React from "react";
import Link from "next/link";
import { Dumbbell, ShieldCheck } from "lucide-react";

interface WebsiteFooterProps {
  gym: {
    name: string;
    slug: string;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  primaryColor: string;
  instagramHandle?: string | null;
  facebookUrl?: string | null;
}

export function WebsiteFooter({
  gym,
  primaryColor,
  instagramHandle,
  facebookUrl,
}: WebsiteFooterProps) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white block uppercase">
                {gym.name}
              </span>
              <span className="text-xs text-slate-400">
                Performance Training in {gym.city || "your city"}
              </span>
            </div>
          </div>

          {/* Social Links if present */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {instagramHandle && (
              <a
                href={`https://instagram.com/${instagramHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram: @{instagramHandle.replace("@", "")}
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {gym.name}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link
              href={`/portal/${gym.slug}`}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Member Portal & Digital Pass</span>
            </Link>
            <span>•</span>
            <span className="text-[11px] text-slate-600">
              Powered by FIXIA GymOS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
