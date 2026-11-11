"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

interface PricingSectionProps {
  showComparisonLink?: boolean;
}

export function PricingSection({ showComparisonLink = true }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = React.useState<"MONTHLY" | "ANNUAL">("ANNUAL");

  const plans = [
    {
      id: "starter",
      name: "Starter Studio",
      badge: "Essential",
      isPopular: false,
      tagline: "Ideal for boutique studios, yoga centers, and single-floor fitness facilities.",
      monthlyPrice: 999,
      annualPrice: 799,
      capacity: "Up to 100 Active Members",
      staff: "3 Staff Accounts",
      features: [
        "Sub-Second Dynamic QR Code Gate",
        "Member Self-Service PWA App",
        "Automated Invoicing & GST Receipts",
        "Membership Expiry Tracking",
        "Manual Reception Desk Check-In",
        "Basic Financial Collection Reports",
        "Community Support",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaLink: "/register?plan=starter",
    },
    {
      id: "growth",
      name: "Growth Athletic",
      badge: "Most Popular",
      isPopular: true,
      tagline: "For scaling gyms looking to systematize leads, group classes, and expenses.",
      monthlyPrice: 1999,
      annualPrice: 1599,
      capacity: "Up to 500 Active Members",
      staff: "10 Staff Accounts",
      features: [
        "Everything in Starter Studio, plus:",
        "Walk-In & Digital Lead Kanban CRM",
        "Class Scheduling & Capacity Limits",
        "Complete Expense & P&L Tracking",
        "POS Inventory & Shake Bar Stock",
        "Workout & Exercise Plan Builder",
        "Branded Public Gym Microsite",
        "Priority Email & Chat Support",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaLink: "/register?plan=growth",
    },
    {
      id: "pro",
      name: "Pro Enterprise",
      badge: "Full Automation",
      isPopular: false,
      tagline: "For high-performance fitness clubs and multi-location operations.",
      monthlyPrice: 3499,
      annualPrice: 2799,
      capacity: "Unlimited Active Members",
      staff: "Unlimited Staff Seats",
      features: [
        "Everything in Growth Athletic, plus:",
        "Automated WhatsApp Retention (T-7, T-3, T-0)",
        "AI Member Churn & Ghosting Radar",
        "Executive Business P&L Analytics",
        "Anti-Passback Kiosk Cooldown Protection",
        "Custom Domain Mapping (gym.com)",
        "Automated Daily Expiry Sweep Engine",
        "24/7 Dedicated Account Manager",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaLink: "/register?plan=pro",
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#F7FAF8] relative overflow-hidden">
      {/* Background subtle micro-grid */}
      <div className="absolute inset-0 gymos-grid-subtle opacity-70 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F9EE] px-3.5 py-1 text-xs font-bold text-[#16A34A] border border-[#1BC95A]/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transparent SaaS Packages</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171C19]">
            Simple, <span className="text-[#1BC95A]">transparent pricing</span> for gyms of all sizes
          </h2>

          <p className="text-sm sm:text-base text-[#69736E] leading-relaxed max-w-2xl mx-auto">
            Choose the plan that fits your gym&apos;s current membership size. Upgrade or cancel anytime with zero long-term lock-in.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-[#E7ECE9] shadow-xs">
              <button
                type="button"
                onClick={() => setBillingPeriod("MONTHLY")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  billingPeriod === "MONTHLY"
                    ? "bg-[#171C19] text-white shadow-xs"
                    : "text-[#69736E] hover:text-[#171C19]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("ANNUAL")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingPeriod === "ANNUAL"
                    ? "bg-[#1BC95A] text-white shadow-xs"
                    : "text-[#69736E] hover:text-[#171C19]"
                }`}
              >
                <span>Annual Billing</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  billingPeriod === "ANNUAL" ? "bg-white text-[#16A34A]" : "bg-[#E8F9EE] text-[#16A34A]"
                }`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = billingPeriod === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-7 sm:p-8 transition-all ${
                  plan.isPopular
                    ? "bg-white border-2 border-[#1BC95A] shadow-xl shadow-[#1BC95A]/10 scale-[1.02] lg:-translate-y-2 z-10"
                    : "bg-white border border-[#E7ECE9] shadow-xs hover:border-[#1BC95A]/40 hover:shadow-md"
                }`}
              >
                {/* Popular Pill Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1BC95A] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-[#171C19]">
                      {plan.name}
                    </h3>
                    {!plan.isPopular && (
                      <span className="rounded-md bg-[#F7FAF8] border border-[#E7ECE9] px-2 py-0.5 text-[10px] font-semibold text-[#69736E]">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-[#69736E] leading-relaxed min-h-[36px]">
                    {plan.tagline}
                  </p>

                  {/* Pricing Display */}
                  <div className="mt-6 pb-6 border-b border-[#E7ECE9]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-[#69736E]">₹</span>
                      <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171C19]">
                        {price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-[#69736E]">
                        / month
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[#69736E]">
                      <span>{plan.capacity}</span>
                      <span>&bull;</span>
                      <span>{plan.staff}</span>
                    </div>

                    {billingPeriod === "ANNUAL" && (
                      <p className="mt-2 text-[11px] font-semibold text-[#16A34A] bg-[#E8F9EE] px-2 py-0.5 rounded-md inline-block">
                        Billed annually (₹{(price * 12).toLocaleString("en-IN")}/yr)
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mt-6 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#171C19]">
                      Included Features:
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#171C19]">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8F9EE] text-[#16A34A] mt-0.5">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span className={idx === 0 && plan.isPopular ? "font-bold text-[#16A34A]" : ""}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="mt-8 pt-4">
                  <Link
                    href={plan.ctaLink}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition active:scale-[0.98] shadow-xs ${
                      plan.isPopular
                        ? "bg-[#1BC95A] hover:bg-[#16A34A] text-white"
                        : "bg-[#171C19] hover:bg-[#28322D] text-white"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <p className="mt-2 text-center text-[10px] text-[#69736E]">
                    14 days free &bull; No card required &bull; Instant setup
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Link */}
        {showComparisonLink && (
          <div className="mt-12 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#16A34A] hover:text-[#1BC95A] transition"
            >
              <span>View complete plan feature comparison matrix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Trust Badges Bar */}
        <div className="mt-16 pt-8 border-t border-[#E7ECE9] grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-[#69736E]">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1BC95A]" />
            <span>PostgreSQL Tenant Isolation</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-[#1BC95A]" />
            <span>Zero Processing Surcharges</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-[#1BC95A]" />
            <span>Full CSV Data Portability</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1BC95A]" />
            <span>99.98% Guaranteed Uptime SLA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
