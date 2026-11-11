"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Smartphone,
  Sparkles,
  Dumbbell,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Zap,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { RoiCalculator } from "@/components/marketing/roi-calculator";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#171C19] flex flex-col font-sans selection:bg-[#E8F9EE] selection:text-[#16A34A]">
      {/* 1. Header Navigation */}
      <MarketingNav />

      {/* 2. Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-16 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 gymos-grid-subtle opacity-80 pointer-events-none" />

        {/* Ambient gentle green lighting */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#1BC95A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E7ECE9] px-3.5 py-1 text-xs font-semibold shadow-xs hover:border-[#1BC95A]/40 transition">
            <span className="flex h-2 w-2 rounded-full bg-[#1BC95A]" />
            <span className="text-[#171C19]">GymOS 2.4 is Live</span>
            <span className="text-[#69736E]">&bull;</span>
            <span className="text-[#16A34A] font-bold">Now with AI Churn Radar</span>
            <ChevronRight className="h-3 w-3 text-[#69736E]" />
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#171C19] max-w-4xl mx-auto leading-[1.08]">
            Run your gym. <br />
            <span className="text-[#1BC95A]">Grow your business.</span>
          </h1>

          {/* Supporting Subheadline */}
          <p className="text-base sm:text-xl text-[#69736E] max-w-2xl mx-auto leading-relaxed font-normal">
            Manage members, memberships, attendance and payments from one simple platform built for modern gyms.
          </p>

          {/* Hero Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1BC95A] hover:bg-[#16A34A] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1BC95A]/25 transition active:scale-[0.98]"
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-[#F7FAF8] px-6 py-3.5 text-sm font-bold text-[#171C19] border border-[#E7ECE9] shadow-xs transition"
            >
              <span>Explore features</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#69736E]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
              <span>Zero-lock in</span>
            </div>
          </div>

          {/* 3. Interactive Product Showcase Mockup */}
          <div className="pt-8 max-w-5xl mx-auto">
            <ProductShowcase />
          </div>
        </div>
      </section>

      {/* 4. Social Proof Trust Bar */}
      <section className="py-12 border-y border-[#E7ECE9] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#69736E]">
            Trusted by 120+ High-Performance Gyms, Fitness Clubs & Strength Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all text-xs font-extrabold text-[#171C19]">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#1BC95A]" />
              <span>IRONFORGE ATHLETICS</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-[#1BC95A]" />
              <span>SPARTAN STRENGTH LAB</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#1BC95A]" />
              <span>KORAMANGALA FITNESS CO.</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#1BC95A]" />
              <span>ELEVATE CROSSFIT</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#1BC95A]" />
              <span>TITAN GYM FRANCHISE</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Benefits (3 Pillars) */}
      <section className="py-20 sm:py-28 bg-[#F7FAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Engineered for Retention & Growth</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171C19]">
              Everything you need to run an <br />
              <span className="text-[#1BC95A]">effortless gym business</span>
            </h2>
            <p className="text-sm sm:text-base text-[#69736E] leading-relaxed">
              Eliminate manual attendance tracking, stop chasing renewals over calls, and deliver a modern fitness experience that members love.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-7 sm:p-8 space-y-4 shadow-xs hover:border-[#1BC95A]/40 transition">
              <div className="h-12 w-12 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center">
                <QrCode className="h-6 w-6 text-[#1BC95A]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#171C19]">
                Anti-Passback QR Kiosk
              </h3>
              <p className="text-xs sm:text-sm text-[#69736E] leading-relaxed">
                Sub-second 140ms verification on any tablet or webcam. Rotating HMAC tokens prevent screenshot sharing, and automated cooldowns stop two people entering on one pass.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#171C19]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
                  <span>Works on any tablet, iPad, or webcam</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
                  <span>Audio & visual gate feedback</span>
                </li>
              </ul>
            </div>

            {/* Benefit 2 */}
            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-7 sm:p-8 space-y-4 shadow-xs hover:border-[#1BC95A]/40 transition">
              <div className="h-12 w-12 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-[#1BC95A]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#171C19]">
                WhatsApp Auto-Dues Engine
              </h3>
              <p className="text-xs sm:text-sm text-[#69736E] leading-relaxed">
                Connect official Meta Cloud API to automatically notify members 7 days, 3 days, and on the day of expiry with direct 1-tap UPI payment links.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#171C19]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
                  <span>96.8% message open rate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
                  <span>GST-compliant auto receipt dispatch</span>
                </li>
              </ul>
            </div>

            {/* Benefit 3 */}
            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-7 sm:p-8 space-y-4 shadow-xs hover:border-[#1BC95A]/40 transition">
              <div className="h-12 w-12 rounded-xl bg-[#E8F9EE] text-[#16A34A] flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#1BC95A]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#171C19]">
                AI Churn & Ghosting Radar
              </h3>
              <p className="text-xs sm:text-sm text-[#69736E] leading-relaxed">
                Automatically detects members who haven&apos;t attended in 10+ days before they cancel. Launch 1-click re-engagement broadcasts to bring them back.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#171C19]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
                  <span>Attendance streak monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1BC95A]" />
                  <span>Proactive retention outreach</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How GymOS Works (3 Simple Steps) */}
      <section className="py-20 border-t border-[#E7ECE9] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl font-extrabold text-[#171C19]">
              How GymOS works in 3 simple steps
            </h2>
            <p className="text-xs sm:text-sm text-[#69736E]">
              Get your entire gym operational in under 5 minutes with zero technical overhead.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="space-y-3 text-center sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1BC95A] text-white font-display font-extrabold text-base shadow-xs mx-auto sm:mx-0">
                1
              </div>
              <h4 className="font-display text-lg font-bold text-[#171C19]">
                Register & Upload Roster
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Register your gym in 60 seconds and bulk-upload existing member records from Excel/CSV with one click.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1BC95A] text-white font-display font-extrabold text-base shadow-xs mx-auto sm:mx-0">
                2
              </div>
              <h4 className="font-display text-lg font-bold text-[#171C19]">
                Place Kiosk at Reception
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Open the Anti-Passback Reception Kiosk on any tablet or browser. Members scan their digital QR pass for instant entry.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1BC95A] text-white font-display font-extrabold text-base shadow-xs mx-auto sm:mx-0">
                3
              </div>
              <h4 className="font-display text-lg font-bold text-[#171C19]">
                Automate Dues & Retention
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                GymOS runs automated daily expiry sweeps, dispatches WhatsApp renewal notices, and deposits payments to your bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Gym-Size Suitability Section */}
      <section className="py-20 sm:py-24 bg-[#F7FAF8] border-t border-[#E7ECE9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl font-extrabold text-[#171C19]">
              Tailored for every gym size & business model
            </h2>
            <p className="text-xs sm:text-sm text-[#69736E]">
              From boutique yoga studios to multi-location commercial fitness franchises.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-6 space-y-3 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-[#16A34A] tracking-wider">
                Single Floor Studios (50 - 200 Members)
              </div>
              <h4 className="font-display text-lg font-bold text-[#171C19]">
                Boutique Fitness & Yoga
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Replace unorganized spreadsheets with clean attendance tracking, simple membership plans, and digital receipts.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#16A34A]">
                Recommended: Starter Studio Plan
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#1BC95A] bg-white p-6 space-y-3 shadow-md">
              <div className="text-[11px] font-bold uppercase text-[#16A34A] tracking-wider">
                Full-Service Gyms (200 - 800 Members)
              </div>
              <h4 className="font-display text-lg font-bold text-[#171C19]">
                Strength & Athletic Clubs
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Full lead pipeline CRM, class schedules, trainer assignments, inventory POS, and automated WhatsApp reminders.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#16A34A]">
                Recommended: Growth Athletic Plan
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7ECE9] bg-white p-6 space-y-3 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-[#16A34A] tracking-wider">
                Franchises & Chains (800+ Members)
              </div>
              <h4 className="font-display text-lg font-bold text-[#171C19]">
                Multi-Branch Fitness Chains
              </h4>
              <p className="text-xs text-[#69736E] leading-relaxed">
                Unified multi-tenant dashboard, AI member churn radar, custom domain mapping, dedicated SLA and unlimited capacity.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#16A34A]">
                Recommended: Pro Enterprise Plan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Revenue Recovery ROI Calculator */}
      <section className="py-20 border-t border-[#E7ECE9] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <RoiCalculator />
        </div>
      </section>

      {/* 9. Live Pricing Section */}
      <PricingSection showComparisonLink={true} />

      {/* 10. Frequently Asked Questions */}
      <section className="py-20 sm:py-28 bg-white border-t border-[#E7ECE9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#171C19]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#69736E]">
              Everything you need to know about switching your gym to GymOS.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* 11. Final High-Impact CTA Banner */}
      <CtaBanner />

      {/* 12. Global Marketing Footer */}
      <MarketingFooter />
    </div>
  );
}
