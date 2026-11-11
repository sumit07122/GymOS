import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="py-16 sm:py-24 bg-[#F7FAF8] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#171C19] text-white p-8 sm:p-14 lg:p-16 overflow-hidden shadow-2xl border border-[#28322D]">
          {/* Subtle green ambient lighting in the background */}
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#1BC95A]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-[#16A34A]/20 blur-3xl pointer-events-none" />

          {/* Micro dot grid texture */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(27,201,90,0.12)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1BC95A]/15 border border-[#1BC95A]/30 px-3.5 py-1 text-xs font-bold text-[#1BC95A]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready for Operational Freedom?</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Run your gym. <br />
              <span className="text-[#1BC95A]">Grow your business.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#94A099] leading-relaxed max-w-xl">
              Stop chasing renewals over spreadsheets. Manage members, memberships, attendance and payments from one simple platform built for modern gyms.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1BC95A] hover:bg-[#16A34A] text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-[#1BC95A]/25 transition active:scale-[0.98]"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm px-5 py-3.5 border border-white/15 transition backdrop-blur-xs"
              >
                <span>Book 15-Min Live Demo</span>
              </Link>
            </div>

            {/* Micro guarantees */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#94A099]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1BC95A]" />
                <span>14 days full access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1BC95A]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1BC95A]" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
