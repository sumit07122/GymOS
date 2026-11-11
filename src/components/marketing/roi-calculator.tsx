"use client";

import * as React from "react";
import Link from "next/link";
import { Calculator, ArrowRight, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";

export function RoiCalculator() {
  const [memberCount, setMemberCount] = React.useState<number>(300);
  const [avgFee, setAvgFee] = React.useState<number>(2000);

  // Industry average: 8% revenue leakage due to uncollected dues, expired scan slip-throughs, and late renewals
  const totalMonthlyGross = memberCount * avgFee;
  const estimatedLeakagePercent = 0.082; // 8.2%
  const monthlyRecovered = Math.round(totalMonthlyGross * estimatedLeakagePercent);
  const annualRecovered = monthlyRecovered * 12;
  const gymosCostAnnual = 1999 * 12; // Growth tier cost
  const netRoiRatio = Math.max(1, Math.round(annualRecovered / gymosCostAnnual));

  return (
    <div className="rounded-3xl border border-[#E7ECE9] bg-white p-6 sm:p-10 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Inputs */}
        <div className="space-y-6 flex-1 max-w-lg">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30 mb-2">
              <Calculator className="h-3.5 w-3.5" />
              <span>Interactive Revenue Recovery Calculator</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#171C19]">
              How much revenue is your gym leaking?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#69736E] leading-relaxed">
              Most gyms lose 7% to 11% of monthly revenue through expired passes slipping through gates, forgotten dues, and delayed manual renewals.
            </p>
          </div>

          {/* Slider 1: Member Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#171C19]">Total Active Members</span>
              <span className="font-mono text-[#16A34A] bg-[#E8F9EE] px-2.5 py-0.5 rounded-md text-sm">
                {memberCount} Members
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={1500}
              step={25}
              value={memberCount}
              onChange={(e) => setMemberCount(parseInt(e.target.value, 10))}
              className="w-full accent-[#1BC95A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#69736E] font-mono">
              <span>50</span>
              <span>500</span>
              <span>1,000</span>
              <span>1,500+</span>
            </div>
          </div>

          {/* Slider 2: Average Monthly Fee */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#171C19]">Average Monthly Fee per Member</span>
              <span className="font-mono text-[#16A34A] bg-[#E8F9EE] px-2.5 py-0.5 rounded-md text-sm">
                ₹{avgFee.toLocaleString("en-IN")} / mo
              </span>
            </div>
            <input
              type="range"
              min={800}
              max={8000}
              step={100}
              value={avgFee}
              onChange={(e) => setAvgFee(parseInt(e.target.value, 10))}
              className="w-full accent-[#1BC95A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#69736E] font-mono">
              <span>₹800</span>
              <span>₹2,500</span>
              <span>₹5,000</span>
              <span>₹8,000</span>
            </div>
          </div>
        </div>

        {/* Right Output Card */}
        <div className="w-full lg:w-96 rounded-2xl bg-[#F7FAF8] border border-[#E7ECE9] p-6 space-y-5 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-[#69736E]">
            Estimated Recovered Revenue
          </div>

          <div>
            <div className="text-xs text-[#69736E]">Monthly Cash Flow Lift:</div>
            <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#16A34A]">
              +₹{monthlyRecovered.toLocaleString("en-IN")}
              <span className="text-xs text-[#69736E] font-medium"> / mo</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7ECE9]">
            <div className="text-xs text-[#69736E]">Annual Net Gain:</div>
            <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#171C19]">
              ₹{annualRecovered.toLocaleString("en-IN")}
              <span className="text-xs text-[#69736E] font-medium"> / yr</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#E8F9EE] p-3 text-xs text-[#16A34A] font-bold flex items-center justify-center gap-2 border border-[#1BC95A]/30">
            <TrendingUp className="h-4 w-4" />
            <span>Estimated {netRoiRatio}x ROI on GymOS SaaS Cost</span>
          </div>

          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1BC95A] hover:bg-[#16A34A] text-white font-bold text-xs shadow-xs transition"
          >
            <span>Start Free 14-Day Trial</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
